const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/products', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Product Model
const Product = mongoose.model('Product', { 
  name: String,
  price: Number,
  warranty: String
});

// Create a new product
app.post('/products', async (req, res) => {
  const { name, price, warranty } = req.body;
  const newProduct = new Product({ name, price, warranty });
  await newProduct.save();
  const productDetails = {
    id: newProduct._id.toString(),
    name,
    price,
    warranty
  };
  const qrCodeData = await QRCode.toDataURL(JSON.stringify(productDetails));
  res.send({ qrCodeData });
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});





import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [productDetails, setProductDetails] = useState({
    name: '',
    price: '',
    warranty: ''
  });
  const [qrCodeData, setQrCodeData] = useState('');

  const generateQRCode = async () => {
    const response = await axios.post('http://localhost:3001/products', productDetails);
    setQrCodeData(response.data.qrCodeData);
  };

  return (
    <div>
      <h1>Create QR Code for Product</h1>
      <label>Name:</label>
      <input type="text" value={productDetails.name} onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })} />
      <label>Price:</label>
      <input type="text" value={productDetails.price} onChange={(e) => setProductDetails({ ...productDetails, price: e.target.value })} />
      <label>Warranty:</label>
      <input type="text" value={productDetails.warranty} onChange={(e) => setProductDetails({ ...productDetails, warranty: e.target.value })} />
      <button onClick={generateQRCode}>Generate QR Code</button>
      {qrCodeData && <img src={qrCodeData} alt="QR Code" />}
    </div>
  );
}

export default App;
