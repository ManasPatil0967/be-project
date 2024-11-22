const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('test.db');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INT, userEmailHash TEXT, publicKey TEXT, secretKeyHash TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS websites (id INT, userid INT, websiteUrl TEXT, passwordHash TEXT)");
});

app.post('/api/users', (req, res) => {
    const { userEmailHash, publicKey, secretKeyHash } = req.body;

    db.run("INSERT INTO users (userEmailHash, publicKey, secretKeyHash) VALUES (?, ?, ?)", [userEmailHash, publicKey, secretKeyHash], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({ success: true });
    });
});

app.post('/api/websites', (req, res) => {
    const { userid, websiteUrl, passwordHash } = req.body;

    db.run("INSERT INTO websites (userid, websiteUrl, passwordHash) VALUES (?, ?, ?)", [userid, websiteUrl, passwordHash], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(200).json({ success: true });
    });
});

app.post('/api/getUser', (req, res) => {
    const { userEmailHash } = req.body;

    db.get("SELECT * FROM users WHERE userEmailHash = ?", [userEmailHash], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(200).json({ success: true, data: row });
    });
});

app.post('/api/getWebsites', (req, res) => {
    const { userid } = req.body;

    db.all("SELECT * FROM websites WHERE userid = ?", [userid], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(200).json({ success: true, data: rows });
    });
});

app.post('/api/updateUser', (req, res) => {
    const { id, userEmailHash, publicKey, secretKeyHash } = req.body;

    db.run("UPDATE users SET userEmailHash = ?, publicKey = ?, secretKeyHash = ? WHERE id = ?", [userEmailHash, publicKey, secretKeyHash, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(200).json({ success: true });
    });
});

app.post('/api/deleteWebsite', (req, res) => {
    const { id } = req.body;

    db.run("DELETE FROM websites WHERE id = ?", [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(200).json({ success: true });
    });
});

app.post('/api/deleteUser', (req, res) => {
    const { id } = req.body;

    db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(200).json({ success: true });
    });
});

app.listen(PORT, () => {
    app.use(express.static(path.join(__dirname, 'public')));
    console.log(`Server running on port ${PORT}`);
});
