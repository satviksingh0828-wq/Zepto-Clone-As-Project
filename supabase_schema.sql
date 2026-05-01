-- Create Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    type TEXT NOT NULL,
    price DECIMAL NOT NULL,
    discount_price DECIMAL NOT NULL,
    countryoforigin TEXT DEFAULT 'India',
    src TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number VARCHAR(10) UNIQUE NOT NULL,
    customer_name TEXT,
    customer_address TEXT NOT NULL,
    total_amount DECIMAL NOT NULL,
    delivery_charge DECIMAL DEFAULT 100,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    order_status TEXT DEFAULT 'placed', -- 'placed', 'processing', 'shipped', 'delivered'
    payment_method TEXT DEFAULT 'razorpay', -- 'razorpay' or 'cod'
    payment_id TEXT, -- Razorpay Payment ID
    items JSONB NOT NULL, -- Array of objects: {name, quantity, price}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Mock Data
INSERT INTO products (name, unit, type, price, discount_price, countryoforigin, src) VALUES
('Banana', '1kg', 'Fresh Fruits', 60, 48, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-425-405,pr-true,f-webp,q-80/inventory/product/cb115d55-cf65-4228-80c8-b0fc0b90ae03-/tmp/20230216-1551351.jpeg'),
('Apple', '1kg', 'Fresh Fruits', 180, 162, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-500-500,pr-true,f-webp,q-80/inventory/product/0e673bd2-2fe6-4d8e-899e-00b4d460a653-tmp/a87d6c85-8184-428d-a877-070f4f55ffb5.jpeg'),
('Mango', '1kg', 'Fresh Fruits', 120, 96, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-478-522,pr-true,f-webp,q-80/inventory/product/1b9cf6b1-9a9d-41a7-ace5-0faec8e3e71f-image_file.png'),
('Orange', '1kg', 'Fresh Fruits', 80, 68, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-187-187,pr-true,f-webp,q-80/inventory/product/6c78cf1a-ed30-4d24-8def-a274418a27ea-image'),
('Papaya', '1kg', 'Fresh Fruits', 40, 36, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1000-799,pr-true,f-webp,q-80/inventory/product/de957e5c-6ef2-4b20-831f-4ec31fcb4c3d-image_file.jpeg'),
('Onion', '1kg', 'Fresh Vegetables', 35, 28, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1200-1200,pr-true,f-webp,q-80/inventory/product/07a54355-4d10-4623-b369-1109db67d160-Photo.jpeg'),
('Potato', '1kg', 'Fresh Vegetables', 25, 22, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-4745-3537,pr-true,f-webp,q-80/inventory/product/534318fb-a402-4902-9cce-2cbd8984d75b-53.jpeg'),
('Cauliflower', '1kg', 'Fresh Vegetables', 45, 36, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1500-1500,pr-true,f-webp,q-80/inventory/product/3a919660-707b-44f4-b666-8b3fcf094a7b-image'),
('Bottle Guard', '1kg', 'Fresh Vegetables', 30, 27, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1000-1000,pr-true,f-webp,q-80/inventory/product/9e5847e4-17a6-4a48-8221-d237f440d995-image'),
('Tomato', '1kg', 'Fresh Vegetables', 50, 40, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-800-500,pr-true,f-webp,q-80/inventory/product/dedf3d96-5fe5-482a-a24a-494f6e76845e-tmp/f3cb8fd8-e2df-4c11-ba79-4203e88af3ad.jpeg'),
('Spinach', '500g', 'leafy Herbs', 20, 18, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-393-510,pr-true,f-webp,q-80/inventory/product/9abf0781-37d6-4b05-b559-912ab7ce2145-568.jpeg'),
('Coriander', '100g', 'leafy Herbs', 15, 12, 'india', 'https://cdn.zeptonow.com/production///tr:w-450,ar-1500-888,pr-true,f-webp,q-80/inventory/product/6f885126-571a-4655-a9fb-91a6a893928f-4199723a-d43e-4e86-b88d-34289de52bb5-Photo.webp'),
('Curry leaves', '50g', 'leafy Herbs', 10, 8, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1000-1000,pr-true,f-webp,q-80/inventory/product/22fe0c8f-68d5-4979-a7ff-309e078b90bf-d1a47d08-8bbd-4cad-807f-04019d364919.jpeg'),
('Mint', '100g', 'leafy Herbs', 12, 10, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-800-900,pr-true,f-webp,q-80/inventory/product/223a4b9a-b56b-4229-9613-68a6351cd7b9-88f2ab6e-535d-4128-af71-7d326da7c1ff-d895a0da-812a-47ed-abb7-1e63149043ad.jpeg'),
('Chilli', '250g', 'leafy Herbs', 25, 20, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1000-1000,pr-true,f-webp,q-80/inventory/product/63261e85-1820-4068-885b-843785cb64f2-image_file.jpeg'),
('Rose', '3 Nos', 'Flowers', 30, 24, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1024-1024,pr-true,f-webp,q-80/inventory/product/b064d64e-d53e-4167-84c8-242f4c1331fc-c1689a18-a10c-404b-ad45-e38bd18eb599.jpeg'),
('Marigold', '3 Nos', 'Flowers', 20, 18, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-275-183,pr-true,f-webp,q-80/inventory/product/bfa2222e-bc7a-41d7-858f-13343d3d470d-5ae912ef-89df-4fbc-a546-87fbd23135bc.jpeg'),
('Whitelower', '3 Nos', 'Flowers', 25, 22, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1100-1100,pr-true,f-webp,q-80/inventory/product/0e256bfa-cede-45a3-ba77-42bc88c543fa-Photo.jpeg'),
('Capsicum', '500g', 'Exotic', 60, 48, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-500-500,pr-true,f-webp,q-80/inventory/product/2b9b7408-9e6e-4cfe-8b50-e785b50d5631-67d14285-ec66-44ab-ac02-f0cbcb1982a0.jpeg'),
('Broccoli', '500g', 'Exotic', 80, 72, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-500-500,pr-true,f-webp,q-80/inventory/product/d27275d2-1f38-498b-b5f3-f9da1bb3eae4-a14bec60-157d-43cf-bbb6-e730aa192303.jpeg'),
('BabyCorn', '250g', 'Exotic', 40, 34, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-500-500,pr-true,f-webp,q-80/inventory/product/e96e943f-4c39-4a79-a36f-2554e201582a-tmp/30d3c540-b407-4191-b9f4-435b68506ac0.jpeg'),
('Iceberg', '1 piece', 'Exotic', 35, 28, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1920-1440,pr-true,f-webp,q-80/inventory/product/b3fafcaa-5e1f-4a49-b43f-33ac753b60e8-513.jpeg'),
('Mushroom', '200g', 'Exotic', 50, 45, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-500-500,pr-true,f-webp,q-80/inventory/product/8e99f4fb-82b1-499a-9555-3fdf794870e5-b972dce8-6f25-4153-9bd8-39f851ba8ea8-Photo.webp'),
('Milk', '1 lt', 'Kitchen', 65, 62, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1449-2774,pr-true,f-webp,q-80/inventory/product/ff393466-31a4-4aba-a51b-a787c39ef57e-1X_7lBoxi4mJYgEcYcv0Wy43RpIC7yQdk.jpeg'),
('Tea', '250g pack', 'Kitchen', 120, 108, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-412-499,pr-true,f-webp,q-80/inventory/product/1e59f8b8-ebe3-4bbb-b9b3-b45ef7a45274-1CqRELFOO9CnkzvH6tfZaF1vQJDJzzLcQ.jpeg'),
('Sugar', '1kg', 'Kitchen', 50, 47, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1117-1500,pr-true,f-webp,q-80/inventory/product/b3509c76-ae8b-44c8-8e5f-cf936e31c154-1Goci1ytuE8z6w5aJqv6IqwsvLxSys91o.jpeg'),
('Masala', '100g pack', 'Kitchen', 45, 36, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-900-900,pr-true,f-webp,q-80/inventory/product/16a652fa-98ec-4fc0-8f89-210964124ff4-17TURUs2qsmLbTIIEgRDx9XGdbAO_t-HI.jpeg'),
('Salt', '1kg', 'Kitchen', 25, 23, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1500-1500,pr-true,f-webp,q-80/inventory/product/ed9fdfd5-6536-4a16-9d70-b055fa36ec34-103.jpg'),
('Cleaners', '500ml', 'House Hold', 85, 76, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1000-1000,pr-true,f-webp,q-80/inventory/product/9f1fab69-ce22-40e0-bda1-f4d9d9d93d6a-/tmp/20230301-1517501.jpeg'),
('Allout', '1 pack', 'House Hold', 150, 135, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1200-1286,pr-true,f-webp,q-80/inventory/product/add06766-764f-432b-af4c-a21088ba960d-1e1U__7TcZUxQWdLWQTVylJ5IwN2HkFU4.jpeg'),
('Room Freshners', '300ml', 'House Hold', 95, 81, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-1200-1200,pr-true,f-webp,q-80/inventory/product/e7399340-1d82-4dfe-9e5f-0ded0f170319-1ULtgm5lv0YAtHM20m3chg_eeURJ5Og5K.jpeg'),
('Soap', '4 pack', 'House Hold', 120, 96, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-600-600,pr-true,f-webp,q-80/inventory/product/4ec76d3d-e0d0-4f49-8d71-f38792e688aa-1IW7n_PJoDzpNgrZeYuVuXc2Gmwv2Hj7L.jpeg'),
('Sanitizers', '200ml', 'House Hold', 75, 68, 'india', 'https://cdn.zeptonow.com/production///tr:w-200,ar-679-679,pr-true,f-webp,q-80/inventory/product/1d0e0824-4bf0-4380-b0d4-6bc9f7ac0c15-1Ln11pGDHPMx1EGM0y-kLazpF0Mh3jHRD.jpeg');
