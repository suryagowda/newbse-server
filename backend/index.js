// index.js
const apiRoutes = require('./api/apiRoutes');

const express = require('express');

const app = express();
const port = 3000;

// Your database initialization code here (if needed)...


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

// API routes...
app.use('/', require('./api/apiRoutes'));


// Start the server
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
