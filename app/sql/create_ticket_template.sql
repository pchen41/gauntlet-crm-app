CREATE OR REPLACE FUNCTION create_ticket_template(
  p_name TEXT,
  p_description TEXT,
  p_fields JSONB,
  p_parent_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_template_id UUID;
  v_field JSONB;
  v_rank INTEGER;
  v_has_status BOOLEAN := false;
  v_has_priority BOOLEAN := false;
  v_has_assigned_to BOOLEAN := false;
  v_choice TEXT;
  v_parent_template_parent_id UUID;
  v_latest_version_id UUID;
  v_field_names TEXT[];  -- New variable to store field names
  v_field_name TEXT;     -- New variable to store current field name
BEGIN
  -- Initialize array to store field names
  v_field_names := ARRAY[]::TEXT[];

  -- Check for duplicate field names
  FOR v_field IN SELECT * FROM jsonb_array_elements(p_fields)
  LOOP
    v_field_name := v_field->>'name';
    
    -- Check if field name already exists in our array
    IF v_field_name = ANY(v_field_names) THEN
      RAISE EXCEPTION 'Duplicate field name found: %', v_field_name;
    END IF;
    
    -- Add field name to our array
    v_field_names := array_append(v_field_names, v_field_name);
  END LOOP;

  -- If parent_id is provided, validate it
  IF p_parent_id IS NOT NULL THEN
    -- Check if parent template exists and get its parent_id
    SELECT parent_id INTO v_parent_template_parent_id
    FROM ticket_templates
    WHERE id = p_parent_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Parent template with id % does not exist', p_parent_id;
    END IF;

    -- If parent template has a different parent_id, raise error
    IF v_parent_template_parent_id IS NOT NULL AND v_parent_template_parent_id != p_parent_id THEN
      RAISE EXCEPTION 'Invalid parent_id: template % already has a different parent_id', p_parent_id;
    END IF;

    -- Find and mark the latest version as deleted
    SELECT id INTO v_latest_version_id
    FROM ticket_templates
    WHERE (id = p_parent_id OR parent_id = p_parent_id)
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_latest_version_id IS NOT NULL THEN
      UPDATE ticket_templates
      SET deleted_at = NOW()
      WHERE id = v_latest_version_id;
    END IF;
  END IF;

  -- Validate required fields
  FOR v_field IN SELECT * FROM jsonb_array_elements(p_fields)
  LOOP
    IF v_field->>'name' = 'Status' AND v_field->>'type' = 'select' THEN
      v_has_status := true;
    END IF;
    IF v_field->>'name' = 'Priority' AND v_field->>'type' = 'select' THEN
      v_has_priority := true;
    END IF;
    IF v_field->>'name' = 'Assigned To' AND v_field->>'type' = 'agent' THEN
      v_has_assigned_to := true;
    END IF;

    -- Validate that select/multi-select fields have choices
    IF (v_field->>'type' = 'select' OR v_field->>'type' = 'multi-select') THEN
      IF v_field->'choices' IS NULL OR jsonb_array_length(v_field->'choices') = 0 THEN
        RAISE EXCEPTION 'Field "%" of type % must have at least one choice', 
          v_field->>'name', 
          v_field->>'type';
      END IF;

      -- Check for blank choices
      FOR v_choice IN SELECT jsonb_array_elements_text(v_field->'choices')
      LOOP
        IF length(trim(v_choice)) = 0 THEN
          RAISE EXCEPTION 'Field "%" cannot have blank choices', v_field->>'name';
        END IF;
      END LOOP;

      -- Validate default value is in choices for select fields
      IF v_field->>'type' = 'select' 
         AND v_field->>'default_value' IS NOT NULL 
         AND NOT (v_field->>'default_value' = ANY (ARRAY(SELECT jsonb_array_elements_text(v_field->'choices')))) THEN
        RAISE EXCEPTION 'Default value for field "%" must be one of the choices', v_field->>'name';
      END IF;
    END IF;
  END LOOP;

  IF NOT v_has_status THEN
    RAISE EXCEPTION 'Template must include a Status field of type select';
  END IF;
  IF NOT v_has_priority THEN
    RAISE EXCEPTION 'Template must include a Priority field of type select';
  END IF;
  IF NOT v_has_assigned_to THEN
    RAISE EXCEPTION 'Template must include an Assigned To field of type agent';
  END IF;

  -- Create the template with parent_id if provided
  INSERT INTO ticket_templates (
    name,
    description,
    parent_id
  ) VALUES (
    p_name,
    p_description,
    p_parent_id
  ) RETURNING id INTO v_template_id;

  -- Insert each field
  v_rank := 0;
  FOR v_field IN SELECT * FROM jsonb_array_elements(p_fields)
  LOOP
    INSERT INTO template_fields (
      ticket_template_id,
      name,
      description,
      type,
      required,
      default_value,
      choices,
      rank,
      "default",
      visible_to_customer,
      editable_by_customer
    ) VALUES (
      v_template_id,
      v_field->>'name',
      v_field->>'description',
      v_field->>'type',
      COALESCE((v_field->>'required')::BOOLEAN, false),
      v_field->>'default_value',
      CASE 
        WHEN v_field->>'choices' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(v_field->'choices'))
        ELSE NULL
      END,
      v_rank,
      COALESCE((v_field->>'isDefault')::BOOLEAN, false),
      COALESCE((v_field->>'visible_to_customer')::BOOLEAN, true),
      COALESCE((v_field->>'editable_by_customer')::BOOLEAN, false)
    );
    v_rank := v_rank + 1;
  END LOOP;

  RETURN v_template_id;
END;
$$ LANGUAGE plpgsql;