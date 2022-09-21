const dotenv = require('dotenv');
const express = require('express');
dotenv.config();

const notion = require('./notion.js');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});



// Check for updates every 5 minutesd
// setInterval(() => {
//     checkForUpdates();
// }, 300000);

// Check for updates every 10 seconds
// setInterval(() => {
//     notion.checkForUpdates();
// }, 10000);

// Check for updates every 5 seconds
setInterval(() => {
    notion.checkForUpdates();
}, 5000);

app.listen(port, () => console.log(`Listening on port ${port}...`));




