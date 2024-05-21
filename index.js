const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure Multer to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage instead of disk storage
});

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: req.file.originalname, // File name you want to save as in S3
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.status(200).send(`File uploaded successfully. ${data.Location}`);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
