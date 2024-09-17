
// using prisma and postgre


model Product {
    id         Int         @id @default(autoincrement())
    name       String
    brand      String
    sku        String      @unique
    variations Variation[] // One-to-many relation with Variation
    createdAt  DateTime    @default(now())
    updatedAt  DateTime    @updatedAt
  }
  
  model Variation {
    id            Int      @id @default(autoincrement())
    price         Float
    discountPrice Float?   // Optional
    imageUrl      String
    attributes    Json     // Storing attributes as JSON
    productId     Int      // Foreign key
    product       Product  @relation(fields: [productId], references: [id])
  
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }
  
  model Attribute {
    id   Int    @id @default(autoincrement())
    name String // e.g., "size", "color"
  }
  
  model AttributeValue {
    id          Int        @id @default(autoincrement())
    value       String     // e.g., "M", "Red"
    attributeId Int
    attribute   Attribute  @relation(fields: [attributeId], references: [id])
  }
  

//   POST request to create a new product with dynamic attribute population
  {
    "name": "T-Shirt",
    "brand": "BrandX",
    "sku": "SKU12345",
    "variations": [
      {
        "price": 25.99,
        "discount_price": 20.99,
        "image_url": "http://example.com/image1.jpg",
        "attributes": {
          "2": "9",  // size "M" where 2 is the size attribute ID, and 9 is the value ID for "M"
          "6": "4"   // color "Red" where 6 is the color attribute ID, and 4 is the value ID for "Red"
        }
      },
      {
        "price": 29.99,
        "discount_price": null,
        "image_url": "http://example.com/image2.jpg",
        "attributes": {
          "2": "10", // size "L"
          "6": "5"   // color "Blue"
        }
      }
    ]
  }
  

//   post request to create a new product with dynamic attribute population
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.post('/products', async (req, res) => {
  const { name, brand, sku, variations } = req.body;

  try {
    const createdProduct = await prisma.product.create({
      data: {
        name,
        brand,
        sku,
        variations: {
          create: variations.map((variation) => ({
            price: variation.price,
            discountPrice: variation.discount_price,
            imageUrl: variation.image_url,
            attributes: variation.attributes, // Store attributes as JSON
          })),
        },
      },
      include: {
        variations: true,
      },
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating product' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



// get request
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          variations: true,
        },
      });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const variationsWithAttributes = await Promise.all(
        product.variations.map(async (variation) => {
          const attributes = await Promise.all(
            Object.entries(variation.attributes).map(async ([attributeId, valueId]) => {
              const attribute = await prisma.attribute.findUnique({
                where: { id: parseInt(attributeId) },
              });
              const attributeValue = await prisma.attributeValue.findUnique({
                where: { id: parseInt(valueId) },
              });
              return { [attribute.name]: attributeValue.value };
            })
          );
  
          return {
            ...variation,
            attributes: attributes.reduce((acc, attr) => ({ ...acc, ...attr }), {}),
          };
        })
      );
  
      res.json({
        ...product,
        variations: variationsWithAttributes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving product' });
    }
  });
  