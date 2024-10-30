const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Add CORS middleware
const bodyParser = require('body-parser');
const ffi = require("ffi-napi");

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const kyber = ffi.Library('./libkyber.so', {
    'generate_keypair': ['int', ['string', 'string']],
    'encrypt': ['int', ['string', 'string', 'string']],
    'decrypt': ['int', ['string', 'string', 'string']]
});

app.get('/generate-keypair', (req, res) => {
    try {
        const pkFile = path.join(__dirname, 'public_key.bin');
        const skFile = path.join(__dirname, 'secret_key.bin');
        
        console.log('Generating keypair...');
        const genResult = kyber.generate_keypair(pkFile, skFile);
        
        if (genResult !== 0) {
            console.error('Keypair generation failed with code:', genResult);
            return res.status(500).json({ error: "Keypair generation failed." });
        }

        const pkBlob = new Blob([Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))], { type: 'application/octet-stream' });
        const skBlob = new Blob([Uint8Array.from(atob(secretKey), c => c.charCodeAt(0))], { type: 'application/octet-stream' });

        res.json({ publicKey: pkBlob, secretKey: skBlob });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
