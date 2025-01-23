create or replace function update_ticket(
  ticket_id uuid,
  field_updates jsonb,
  updater_id uuid,
  comment text default null,
  internal boolean default true,
  new_tags text[] default null
)
returns void
language plpgsql
security definer
as $$
declare
  old_fields jsonb;
  old_tags text[];
  field_update jsonb;
  old_field jsonb;
  changes jsonb[];
  found_field jsonb;
begin
  -- Get the current field values and tags
  select fields, tags into old_fields, old_tags
  from tickets
  where id = ticket_id;

  -- Initialize changes array
  changes := array[]::jsonb[];

  -- Iterate through each field update
  for field_update in select * from jsonb_array_elements(field_updates)
  loop
    -- Find the matching field in old_fields
    found_field := null;
    for old_field in select * from jsonb_array_elements(old_fields)
    loop
      if (old_field->>'id') = (field_update->>'id') then
        found_field := old_field;
        exit;
      end if;
    end loop;

    -- If old and new values are different, add to changes
    if found_field is not null and found_field->>'value' is distinct from field_update->>'value' then
      changes := array_append(
        changes,
        jsonb_build_object(
          'id', found_field->>'id',
          'field', found_field->>'name',
          'old_value', found_field->>'value',
          'new_value', field_update->>'value'
        )
      );
    end if;
  end loop;

  -- Check for tag changes only if new_tags parameter is provided
  if new_tags is not null and new_tags is distinct from old_tags then
    changes := array_append(
      changes,
      jsonb_build_object(
        'field', 'tags',
        'old_value', array_to_json(old_tags)::text,
        'new_value', array_to_json(new_tags)::text
      )
    );
  end if;

  -- Only proceed if there are actual changes or a comment is provided
  if array_length(changes, 1) > 0 or comment is not null then
    -- Update the ticket if there are field changes or tag changes
    if array_length(changes, 1) > 0 then
      with field_array as (
        select jsonb_agg(
          case
            when exists (
              select 1 
              from jsonb_array_elements(field_updates) u 
              where u->>'id' = field->>'id'
            ) then 
              jsonb_build_object(
                'id', field->>'id',
                'name', field->>'name',
                'type', field->>'type',
                'value', (
                  select u->>'value'
                  from jsonb_array_elements(field_updates) u
                  where u->>'id' = field->>'id'
                )
              )
            else field
          end
        ) as new_fields
        from jsonb_array_elements(old_fields) field
      )
      update tickets
      set 
        fields = field_array.new_fields,
        tags = case when new_tags is not null then new_tags else old_tags end,
        updated_at = now()
      from field_array
      where id = ticket_id;
    end if;

    -- Create ticket update record
    insert into ticket_updates (
      ticket_id,
      updates,
      comment,
      created_by,
      internal
    ) values (
      ticket_id,
      case 
        when array_length(changes, 1) > 0 then array_to_json(changes)::jsonb
        else null
      end,
      comment,
      updater_id,
      internal
    );
  end if;
end;
$$;