const multer = require('multer');
const storage = multer.memoryStorage(); // Store the image in memory (you may adjust this based on your requirements)
const upload = multer({ storage: storage });
const sharp = require('sharp');

app.post('/upload', upload.single('image'), (req, res) => {
  // Access the uploaded image in req.file.buffer
  // Perform further processing or save to a database
  

// Inside the '/upload' endpoint
sharp(req.file.buffer)
  .resize({ width: 2048, height: 1024 }) // Adjust dimensions as needed
  .toFile('path/to/output/file.jpg', (err, info) => {
    // Handle errors and provide the processed image to the client
  });

});


import React from 'react';
import 'aframe';
import 'aframe-painter';

const VRImage = () => {
  return (
    <a-scene>
      <a-sky src="path/to/processed/image.jpg" rotation="0 -130 0"></a-sky>
    </a-scene>
  );
};

export default VRImage;

