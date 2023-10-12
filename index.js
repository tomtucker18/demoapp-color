const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;


// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const htmlTemplate = fs.readFileSync('index.html', 'utf8');
  res.send(htmlTemplate);
});

app.get('/hostname', (req, res) => {
  const hostname = os.hostname();
  res.send(hostname);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
