const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = 'myscreambucket';

// Set up multer for file handling
const upload = multer({
  storage: multer.memoryStorage(),
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint to upload audio
app.post('/upload', upload.single('audio'), (req, res) => {
  const params = {
    Bucket: bucketName,
    Key: Date.now() + '-' + req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read'
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Upload error');
    } else {
      res.status(200).send('Upload complete');
    }
  });
});

// Endpoint to retrieve audio recordings
app.get('/recordings', async (req, res) => {
  const params = {
    Bucket: bucketName,
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching recordings');
    } else {
      const recordings = data.Contents.map(item => ({
        url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
      }));
      res.json(recordings);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
