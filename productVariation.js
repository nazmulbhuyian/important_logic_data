
// Schema for product
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  variations: [
    {
      attributes: {
        type: Map,
        of: String, // This allows dynamic attributes with string values (e.g., size, color, fabric)
      },
      price: {
        type: Number,
        required: true,
      },
      discount_price: {
        type: Number,
      },
      image_url: {
        type: String,
        required: true,
      },
    }
  ],
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;


// Example usage
{
    "name": "Test Product",
    "brand": "Test Brand",
    "sku": "12345",
    "variations": [
      {
        "attributes": {
          "color": "red",
          "size": "m",
          "fabric": "jorget"
        },
        "price": 250,
        "discount_price": 240,
        "image_url": "image_url_1"
      },
      {
        "attributes": {
          "size": "l",
          "litre": "1.5L"
        },
        "price": 280,
        "discount_price": 240,
        "image_url": "image_url_2"
      },
      {
        "attributes": {
          "color": "blue"
        },
        "price": 220,
        "image_url": "image_url_3"
      }
    ]
  }
  

//   get request
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Product schema
const Attribute = require('./models/Attribute'); // Attribute schema
const AttributeValue = require('./models/AttributeValue'); // AttributeValue schema

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Function to populate attributes and attribute values dynamically
async function populateAttributes(product) {
  const variationsWithPopulatedAttributes = await Promise.all(product.variations.map(async (variation) => {
    const populatedAttributes = {};

    // Iterate over each attribute (key-value pairs) in the attributes map
    for (const [attributeId, attributeValueId] of Object.entries(variation.attributes)) {
      // Fetch the Attribute (e.g., Color, Size, Fabric)
      const attribute = await Attribute.findById(attributeId).lean();

      // Fetch the AttributeValue (e.g., Red, Medium, Jorget)
      const attributeValue = await AttributeValue.findById(attributeValueId).lean();

      // Add the populated attribute and its value to the object
      populatedAttributes[attribute.name] = attributeValue.value;
    }

    return {
      ...variation,
      attributes: populatedAttributes, // Replace the original attributes with populated data
    };
  }));

  return { ...product.toObject(), variations: variationsWithPopulatedAttributes };
}

// GET request to fetch all products with dynamic attribute population
app.get('/products', async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.find();

    // Populate attributes dynamically for each product
    const populatedProducts = await Promise.all(products.map(populateAttributes));

    res.status(200).json(populatedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post('/products', async (req, res) => {
    try {
      const { name, brand, sku, variations } = req.body;
  
      // Create a new Product object
      const newProduct = new Product({
        name,
        brand,
        sku,
        variations: variations.map(variation => ({
          attributes: variation.attributes, // attributes is a Map of Attribute and AttributeValue IDs
          price: variation.price,
          discount_price: variation.discount_price,
          image_url: variation.image_url,
        })),
      });
  
      // Save the new product to the database
      const savedProduct = await newProduct.save();
  
      res.status(201).json({ message: 'Product created successfully', product: savedProduct });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });





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
  