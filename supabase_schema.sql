-- N Legacy E-commerce - Complete Supabase Database Schema
-- Run this entire script in your Supabase SQL Editor (https://supabase.com)
-- এটি কপি করে আপনার Supabase SQL এডিটর-এ রান করুন।

-- 1. Enable any required extensions
create extension if not exists "uuid-ossp";

-- 2. Create products table
create table if not exists "products" (
  "id" text primary key,
  "name" text not null,
  "category" text not null,
  "price" numeric not null,
  "originalPrice" numeric,
  "image" text not null,
  "rating" numeric default 4.5,
  "reviewsCount" integer default 50,
  "description" text,
  "stock" integer default 50,
  "shop" text default 'RK Store',
  "discount" numeric default 0
);

-- 3. Create orders table
create table if not exists "orders" (
  "id" text primary key,
  "userName" text not null,
  "phone" text not null,
  "email" text,
  "address" text not null,
  "city" text not null,
  "zipCode" text not null,
  "orderNotes" text,
  "paymentMethod" text not null,
  "onlinePaymentMethod" text,
  "transactionId" text,
  "items" jsonb not null default '[]'::jsonb,
  "subtotal" numeric not null,
  "deliveryFee" numeric not null,
  "discount" numeric default 0,
  "total" numeric not null,
  "status" text default 'Pending',
  "createdAt" text not null
);

-- 4. Create coupons table
create table if not exists "coupons" (
  "code" text primary key,
  "discount" numeric not null,
  "minAmount" numeric not null,
  "type" text not null default 'flat',
  "description" text not null
);

-- 5. Create sliders table
create table if not exists "sliders" (
  "id" text primary key,
  "image" text not null,
  "title" text not null,
  "subtitle" text not null
);

-- 6. Create users table
create table if not exists "users" (
  "phone" text primary key,
  "name" text not null,
  "password" text not null,
  "email" text,
  "profileImage" text
);

-- 7. Create chats table
create table if not exists "chats" (
  "phone" text primary key,
  "userName" text not null,
  "unread" boolean default false,
  "messages" jsonb not null default '[]'::jsonb
);

-- Disable Row Level Security (RLS) on all tables for public access
alter table "products" disable row level security;
alter table "orders" disable row level security;
alter table "coupons" disable row level security;
alter table "sliders" disable row level security;
alter table "users" disable row level security;
alter table "chats" disable row level security;

-- 8. Seed Default Data / ডেমো ডেটা ইনসার্ট করা হচ্ছে (ঐচ্ছিক)
-- Products
insert into "products" ("id", "name", "category", "price", "originalPrice", "image", "rating", "reviewsCount", "description", "stock", "shop", "discount") values
('prod_1', 'Rice Flour (Chaler Gura) 2kg', 'Organic', 200, 230, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600', 4.4, 59, 'Premium quality rice flour (Chaler Gura) milled from selected organic rice.', 50, 'RK Store', 13),
('prod_2', 'Laal Atta 2kg', 'Organic', 160, 200, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600', 4.6, 75, 'Whole wheat red flour (Laal Atta) rich in dietary fiber.', 45, 'RK Store', 20),
('prod_3', 'Mug Dal 1 Kg', 'Organic', 210, 260, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600', 4.5, 86, 'High-grade premium Moong Dal, polished naturally.', 30, 'RK Store', 19)
on conflict ("id") do nothing;

-- Coupons
insert into "coupons" ("code", "discount", "minAmount", "type", "description") values
('WELCOME100', 100, 300, 'flat', '৳100 discount on your first order'),
('FLATS500', 500, 2000, 'flat', '৳500 flat discount on orders over ৳2000'),
('FREESHIP', 130, 500, 'free_shipping', 'Free shipping on orders over ৳500')
on conflict ("code") do nothing;

-- Sliders
insert into "sliders" ("id", "image", "title", "subtitle") values
('slide_1', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200', '50% Discount on Organic Items', 'Fresh groceries direct to your home safely'),
('slide_2', 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=1200', 'Premium Honey & Ghee', '100% certified authentic products')
on conflict ("id") do nothing;

-- Default Admin User
insert into "users" ("phone", "name", "password", "email", "profileImage") values
('01781099407', 'Emon (Admin)', 'Emon@36231', 'emon@nlegacy.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200')
on conflict ("phone") do nothing;
