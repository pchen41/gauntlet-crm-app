INSERT INTO articles (id, title, content, created_at, created_by, updated_at, updated_by) VALUES
-- Account Management
(gen_random_uuid(), 'How to Create a Find My Cheese Account', 
'Creating a new Find My Cheese account is quick and easy:

1. Download the Find My Cheese app from your device''s app store
2. Open the app and tap "Create Account"
3. Enter your email address and create a password
4. Fill in your delivery address and contact details
5. Add a payment method (optional)
6. Verify your email address

That''s it! You''re ready to start ordering delicious artisanal cheese.', 
current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a', current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a'),

(gen_random_uuid(), 'Resetting Your Password',
'Forgot your password? No worries! Here''s how to reset it:

1. Tap "Forgot Password" on the login screen
2. Enter your email address
3. Check your email for a reset link
4. Click the link and create a new password
5. Log in with your new password

For security reasons, password reset links expire after 24 hours.', 
current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a', current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a'),

-- Ordering Process
(gen_random_uuid(), 'How to Place Your First Cheese Order',
'Ready to order some amazing cheese? Follow these steps:

1. Log into your Find My Cheese account
2. Browse our selection or use the search feature
3. Select your desired cheese(s) and quantity
4. Add items to your cart
5. Review your order
6. Select delivery time and payment method
7. Confirm your order

Note: Minimum order value is $25. Orders over $75 qualify for free delivery!',
current_timestamp, '92478760-b358-49a3-9242-0f3fdd16affc', current_timestamp, '92478760-b358-49a3-9242-0f3fdd16affc'),

-- Order Tracking
(gen_random_uuid(), 'Understanding Order Tracking Statuses',
'Track your cheese order with these status updates:

• Order Received: We''ve got your order!
• Preparing: Your cheese is being carefully selected and packed
• In Transit: Your order is on its way
• Out for Delivery: Your cheese will arrive today
• Delivered: Your cheese has arrived!

All orders include temperature monitoring to ensure your cheese arrives in perfect condition.',
current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a', current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a'),

-- Product Information
(gen_random_uuid(), 'Cheese Storage Guidelines',
'Proper storage is key to maintaining cheese quality:

Soft Cheese:
• Store between 35-45°F
• Keep wrapped in cheese paper or wax paper
• Consume within 1-2 weeks

Hard Cheese:
• Store between 40-50°F
• Wrap in cheese paper or loose plastic
• Can last 3-4 weeks when properly stored

General Tips:
• Never freeze cheese
• Allow cheese to reach room temperature before serving
• Store away from strong-smelling foods',
current_timestamp, '92478760-b358-49a3-9242-0f3fdd16affc', current_timestamp, '92478760-b358-49a3-9242-0f3fdd16affc'),

-- Shipping & Delivery
(gen_random_uuid(), 'Shipping and Delivery Information',
'Find My Cheese Delivery Details:

Delivery Areas:
• Currently serving all major cities in the continental US
• Check your zip code in the app for availability

Delivery Times:
• Standard: 2-3 business days
• Express: Next-day delivery available
• Choose your delivery window during checkout

Temperature Control:
• All orders shipped in insulated packaging
• Real-time temperature monitoring
• Dry ice included for shipments over 4 hours

Shipping Costs:
• Orders under $75: $9.99
• Orders over $75: FREE
• Express delivery: Additional $15',
current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a', current_timestamp, '7cd4ab3a-4a00-4116-bfc5-ba7ebe5ca31a'),

-- Loyalty Program
(gen_random_uuid(), 'Cheese Points Rewards Program',
'Earn delicious rewards with Cheese Points!

How to Earn:
• 1 point per $1 spent
• 100 bonus points for first order
• 50 bonus points for referring friends
• Double points during monthly special events

Redeeming Points:
• 500 points = $10 off your order
• 1000 points = Free shipping on any order
• 2500 points = Free cheese board
• 5000 points = Private cheese tasting event

Points never expire as long as you place at least one order per year.',
current_timestamp, '92478760-b358-49a3-9242-0f3fdd16affc', current_timestamp, '92478760-b358-49a3-9242-0f3fdd16affc');