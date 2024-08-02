const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Create an Express application
const app = express();
const port = 3000;

// Telegram Bot setup
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initial state
let command = {
    text: "",
    written: true
};

// GET endpoint to retrieve the command
app.get('/api/command', (req, res) => {
    res.json(command);
});

// PUT endpoint to update the command
app.put('/api/command', (req, res) => {
    const { written } = req.body;

    if (typeof written !== 'undefined') {
        command.written = written;
        res.status(200).json({ message: 'Command updated' });
    } else {
        res.status(400).json({ message: 'Invalid request' });
    }
});

// POST endpoint to create a new command
app.post('/api/command', (req, res) => {
    const { text } = req.body;

    if (text) {
        command.text = text.replace(/\t/g, '    ');
        command.written = false;
        res.status(201).json({ message: 'Command created' });
    } else {
        res.status(400).json({ message: 'Invalid request' });
    }
});

// Telegram bot setup to handle messages
bot.onText(/\/set([\s\S]+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1].trim();

    // Update command from Telegram message
    command.text = text.replace(/\t/g, '    ');
    command.written = false;

    // Notify the user
    bot.sendMessage(chatId, 'Command has been updated.');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
