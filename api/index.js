const express = require('express');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const { configDotenv } = require('dotenv');

configDotenv

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

// AWS S3 configuration
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();

app.post('/api/upload', (req, res) => {
    const audioBase64 = req.body.audio;
    const audioBuffer = Buffer.from(audioBase64.replace(/^data:audio\/wav;base64,/, ''), 'base64');

    const params = {
        Bucket: 'myscreambucket',
        Key: `audio/${Date.now()}.wav`,
        Body: audioBuffer,
        ContentType: 'audio/wav'
    };

    s3.upload(params, (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Upload failed', error: err });
        }
        res.status(200).json({ message: 'Upload successful', url: data.Location });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
