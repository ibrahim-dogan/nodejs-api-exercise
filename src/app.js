const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const {sequelize} = require('./model')
const {router} = require("./routes");
const HttpError = require("./httpError");

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
app.use(router);

app.use((error, req, res) => {
    console.log({error});

    if (error instanceof HttpError) {
        return res.status(error.status).json({
            error: error.message,
        });
    }

    res.status(500).json({
        error: 'Internal server error',
    });
});

module.exports = app;
