const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    app.use(express.static(path.join(__dirname, 'public')));
    console.log(`Server running on port ${PORT}`);
});
