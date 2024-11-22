const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const ffi = require("ffi-napi");
const ref = require("ref-napi");
const ArrayType = require('ref-array-napi');


const uint8_t = ref.types.uint8;
const size_t = ref.types.size_t;
const uint8_t_ptr = ref.refType(uint8_t);


const uint8_t_array = ArrayType(uint8_t);
const size_t_ptr = ref.refType(size_t);


const kyber = ffi.Library('./libkyberO3.so', {
    'buf_gen_keypair': [uint8_t_ptr, []],
    'buf_encrypt': [uint8_t_ptr, [uint8_t_ptr, uint8_t_ptr, uint8_t_ptr]],
    'buf_decrypt': [uint8_t_ptr, [uint8_t_ptr, uint8_t_ptr, uint8_t_ptr]],
    'buf_free': ['void', [uint8_t_ptr]],
});

const dilithiumLib = ffi.Library('./libsign2.so', {
    'gen_keypair': ['int', [uint8_t_ptr, uint8_t_ptr]],
});

const kdf = ffi.Library('./libkdf.so', {
    'kdf': [uint8_t_ptr, [uint8_t_ptr, size_t, uint8_t_ptr, size_t]],
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});


app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});


app.post('/gen-identity', (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        
        const keypairBuffer = kyber.buf_gen_keypair();
        if (keypairBuffer.isNull()) {
            return res.status(500).json({ error: 'Kyber key pair generation failed' });
        }

        
        const keypairSize = 1152 + 2400; 
        const keypair = ref.reinterpret(keypairBuffer, keypairSize);

        const kyberPublicKey = Buffer.from(keypair.slice(0, 1152)); 
        const kyberPrivateKey = Buffer.from(keypair.slice(1152, 3552)); 

        
        kyber.buf_free(keypairBuffer);

        
        const dilithiumPublicKey = Buffer.alloc(1312); 
        const dilithiumPrivateKey = Buffer.alloc(2544); 

        
        const dilithiumResult = dilithiumLib.gen_keypair(dilithiumPublicKey, dilithiumPrivateKey);
        if (dilithiumResult !== 0) {
            return res.status(500).json({ error: 'Dilithium key pair generation failed' });
        }

        
        const emailHash = Buffer.alloc(32); 
        kdf.kdf(Buffer.from(email, 'utf8'), email.length, emailHash, emailHash.length);

        
        const publicPart = {
            emailHash: emailHash.toString('hex'),
            kyberPublicKey: kyberPublicKey.toString('hex'),
            dilithiumPublicKey: dilithiumPublicKey.toString('hex'),
        };

        const privatePart = {
            kyberPrivateKey: kyberPrivateKey.toString('hex'),
            dilithiumPrivateKey: dilithiumPrivateKey.toString('hex'),
        };

        res.json({
            publicIdentity: publicPart,
            privateIdentity: privatePart,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/gen-password', (req, res) => {
    try {
        const { sk1, sk2 } = req.body;

        if (!sk1 || !sk2) {
            return res.status(400).json({ error: 'Missing required keys' });
        }

        
        const inputBuffer = Buffer.concat([
            Buffer.from(sk1, 'hex'),
            Buffer.from(sk2, 'hex'),
        ]);

        const outputBuffer = Buffer.alloc(32); 
        kdf.kdf(inputBuffer, inputBuffer.length, outputBuffer, outputBuffer.length);

        res.json({
            password: outputBuffer.toString('hex'),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
