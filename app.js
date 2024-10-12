const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Serve the index.html file at root ('/')
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let todos = [];

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const todo = req.body.todo;
    todos.push(todo);

    // Get CPU usage
    const cpuUsage = os.loadavg()[0]; // Load average over 1 minute

    // Log the todo and CPU usage to a text file
    const logEntry = `Todo: ${todo}, CPU Usage: ${cpuUsage}\n`;
    fs.appendFile('todo-log.txt', logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file', err);
        }
    });

    res.status(201).json({ message: 'Todo added', todo });
});

app.get('/download', (req, res) => {
    const file = `${__dirname}/todo-log.txt`;
    res.download(file); // Set Content-Disposition to attachment and send the file
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`To-Do app running on port ${PORT}`);
});
