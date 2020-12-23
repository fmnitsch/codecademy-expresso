const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const apiRouter = require('./api/api');

const app = express();

PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(errorhandler());

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;