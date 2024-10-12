const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));


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

    
    const cpuUsage = os.loadavg()[0]; 

    
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
    res.download(file); 
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`To-Do app running on port ${PORT}`);
});
