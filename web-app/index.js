const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('identity.db');

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database schema
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emailHash TEXT UNIQUE NOT NULL,
            kyberPublicKey TEXT NOT NULL,
            dilithiumPublicKey TEXT NOT NULL,
            kyberPrivateKeyHash TEXT NOT NULL,
            dilithiumPrivateKeyHash TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS websites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            websiteUrl TEXT NOT NULL,
            passwordHash TEXT NOT NULL,
            FOREIGN KEY(userId) REFERENCES users(id)
        )
    `);
});

// Utility function to hash data
function hashData(data) {
    return crypto.createHash('sha3-256').update(data).digest('hex');
}

// Add a new user identity
app.post('/api/users', (req, res) => {
    const {
        emailHash,
        kyberPublicKey,
        dilithiumPublicKey,
        kyberPrivateKey,
        dilithiumPrivateKey,
    } = req.body;

    // Hash the private keys for secure storage
    const kyberPrivateKeyHash = hashData(kyberPrivateKey);
    const dilithiumPrivateKeyHash = hashData(dilithiumPrivateKey);

    db.run(
        `INSERT INTO users (emailHash, kyberPublicKey, dilithiumPublicKey, kyberPrivateKeyHash, dilithiumPrivateKeyHash)
         VALUES (?, ?, ?, ?, ?)`,
        [emailHash, kyberPublicKey, dilithiumPublicKey, kyberPrivateKeyHash, dilithiumPrivateKeyHash],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

// Retrieve a user by email hash
app.post('/api/getUser', (req, res) => {
    const { emailHash } = req.body;

    db.get(
        `SELECT emailHash, kyberPublicKey, dilithiumPublicKey FROM users WHERE emailHash = ?`,
        [emailHash],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ success: true, data: row });
        }
    );
});

// Add a website for a user
app.post('/api/websites', (req, res) => {
    const { userId, websiteUrl, password } = req.body;

    // Hash the password before storing it
    const passwordHash = hashData(password);

    db.run(
        `INSERT INTO websites (userId, websiteUrl, passwordHash) VALUES (?, ?, ?)`,
        [userId, websiteUrl, passwordHash],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

// Retrieve websites for a user
app.post('/api/getWebsites', (req, res) => {
    const { userId } = req.body;

    db.all(
        `SELECT id, websiteUrl, passwordHash FROM websites WHERE userId = ?`,
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, data: rows });
        }
    );
});

// Update a user's keys
app.post('/api/updateUser', (req, res) => {
    const {
        id,
        emailHash,
        kyberPublicKey,
        dilithiumPublicKey,
        kyberPrivateKey,
        dilithiumPrivateKey,
    } = req.body;

    // Hash the private keys
    const kyberPrivateKeyHash = hashData(kyberPrivateKey);
    const dilithiumPrivateKeyHash = hashData(dilithiumPrivateKey);

    db.run(
        `UPDATE users
         SET emailHash = ?, kyberPublicKey = ?, dilithiumPublicKey = ?, kyberPrivateKeyHash = ?, dilithiumPrivateKeyHash = ?
         WHERE id = ?`,
        [emailHash, kyberPublicKey, dilithiumPublicKey, kyberPrivateKeyHash, dilithiumPrivateKeyHash, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

// Delete a user by ID
app.post('/api/deleteUser', (req, res) => {
    const { id } = req.body;

    db.run(`DELETE FROM users WHERE id = ?`, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Delete a website by ID
app.post('/api/deleteWebsite', (req, res) => {
    const { id } = req.body;

    db.run(`DELETE FROM websites WHERE id = ?`, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
