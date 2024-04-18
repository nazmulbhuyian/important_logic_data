// product.prisma

// Define your database schema using Prisma

// Define the database schema
// This file will be compiled to generate Prisma client
// This schema defines your database tables, fields, and relationships

// Import the necessary datatypes from Prisma
// Make sure to install prisma/client using npm install @prisma/client
// Then, import it as shown below
import { ModelName } from '@prisma/client';

// Define your database schema
// This will create a Product table in your database
model Product {
  // Define the fields of the Product table
  id              Int       @id @default(autoincrement()) // Define a primary key with autoincrement
  category_id     Int       // Assuming category_id is a foreign key referencing another table
  sub_category_id Int?      // Assuming sub_category_id is a foreign key referencing another table
  product_name    String    // Product name
  product_slug    String    @unique // Product slug, unique constraint
  product_related_slug String // Related product slug
  product_thumbnail String   // Thumbnail image URL
  product_hover_image String // Hover image URL
  product_status  String    @default("active") // Product status with default value
  product_description String? // Product description, nullable field
  product_price   Float     // Product price
  product_discount_price Float? // Product discount price, nullable field
  product_quantity Int?     // Product quantity, nullable field
  product_images  Json[]    // Product images, assuming it's an array of JSON objects
  product_size_variation Json[] // Product size variation, assuming it's an array of JSON objects

  // Add timestamps for created_at and updated_at fields
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
}

// Note: Adjust the datatypes and constraints according to your PostgreSQL requirements
// For example, use Integer types for IDs if required, adjust string lengths, etc.
