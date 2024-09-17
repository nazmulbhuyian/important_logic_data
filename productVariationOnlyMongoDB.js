
// need use second approach


// first approach
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
      attributes: [
        {
          key: { type: String, required: true },  // Attribute name (e.g., "color")
          value: { type: String, required: true } // Attribute value (e.g., "red")
        }
      ],
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




app.post('/products', async (req, res) => {
    const { name, brand, sku, variations } = req.body;
  
    try {
      const createdProduct = await Product.create({
        name,
        brand,
        sku,
        variations: variations.map(variation => ({
          price: variation.price,
          discount_price: variation.discount_price,
          image_url: variation.image_url,
          attributes: Object.entries(variation.attributes).map(([key, value]) => ({ key, value })),
        })),
      });
  
      res.status(201).json(createdProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating product' });
    }
  });
  


  app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const formattedProduct = {
        ...product._doc,
        variations: product.variations.map(variation => ({
          ...variation._doc,
          attributes: variation.attributes.reduce((acc, attr) => {
            acc[attr.key] = attr.value;
            return acc;
          }, {}),
        })),
      };
  
      res.json(formattedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving product' });
    }
  });
  


  {
    "name": "T-Shirt",
    "brand": "BrandX",
    "sku": "SKU12345",
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
  

//   second approach
const attributeSchema = new Schema({
    name: { type: String, required: true } // e.g., "color", "size"
  });
  
  const Attribute = mongoose.model('Attribute', attributeSchema);
  
  const attributeValueSchema = new Schema({
    value: { type: String, required: true }, // e.g., "red", "M"
    attribute: { type: Schema.Types.ObjectId, ref: 'Attribute', required: true } // Reference to the Attribute
  });
  
  const AttributeValue = mongoose.model('AttributeValue', attributeValueSchema);
  
  module.exports = { Attribute, AttributeValue };
  



  const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
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
      attributes: [
        {
          key: { type: Schema.Types.ObjectId, ref: 'Attribute', required: true },  // Reference to Attribute table
          value: { type: Schema.Types.ObjectId, ref: 'AttributeValue', required: true } // Reference to AttributeValue table
        }
      ],
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



app.post('/products', async (req, res) => {
    const { name, brand, sku, variations } = req.body;
  
    try {
      const createdProduct = await Product.create({
        name,
        brand,
        sku,
        variations: variations.map(variation => ({
          price: variation.price,
          discount_price: variation.discount_price,
          image_url: variation.image_url,
          attributes: Object.entries(variation.attributes).map(([key, value]) => ({
            key,   // Attribute ID
            value  // AttributeValue ID
          })),
        })),
      });
  
      res.status(201).json(createdProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating product' });
    }
  });
  

  {
    "name": "T-Shirt",
    "brand": "BrandX",
    "sku": "SKU12345",
    "variations": [
      {
        "attributes": {
          "64ea12a4b3e1f2e06b1a7a01": "64ea12a5b3e1f2e06b1a7a02",  // "color": "red"
          "64ea12a4b3e1f2e06b1a7a03": "64ea12a5b3e1f2e06b1a7a04"   // "size": "m"
        },
        "price": 250,
        "discount_price": 240,
        "image_url": "image_url_1"
      }
    ]
  }

  

  app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const product = await Product.findById(id)
        .populate({
          path: 'variations.attributes.key',
          model: 'Attribute',
        })
        .populate({
          path: 'variations.attributes.value',
          model: 'AttributeValue',
        });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const formattedProduct = {
        ...product._doc,
        variations: product.variations.map(variation => ({
          ...variation._doc,
          attributes: variation.attributes.reduce((acc, attr) => {
            acc[attr.key.name] = attr.value.value; // Populate with actual attribute name and value
            return acc;
          }, {}),
        })),
      };
  
      res.json(formattedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving product' });
    }
  });
  

  {
    "_id": "64ea1234b3e1f2e06b1a7a01",
    "name": "T-Shirt",
    "brand": "BrandX",
    "sku": "SKU12345",
    "variations": [
      {
        "attributes": {
          "color": "red",
          "size": "m"
        },
        "price": 250,
        "discount_price": 240,
        "image_url": "image_url_1"
      }
    ],
    "createdAt": "2024-09-17T12:00:00Z",
    "updatedAt": "2024-09-17T12:00:00Z"
  }
  

//   3rd approach

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

