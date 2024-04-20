npm install @google-cloud/storage


const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'YOUR_PROJECT_ID',
  keyFilename: 'path/to/your/keyfile.json',
});

const bucketName = 'your-bucket-name';

async function uploadImageToGCS(file) {
  const bucket = storage.bucket(bucketName);
  const fileName = `${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucketName}/${fileName}`);
    });

    stream.end(file.buffer);
  });
}

module.exports = { uploadImageToGCS };


npm install axios


import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:YOUR_PORT/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Upload Image</button>
    </div>
  );
};

export default ImageUpload;
