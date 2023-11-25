const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const mongooseApp = require('./Mongoose/mongoose');


app.use('/mongoose', mongooseApp);
app.use(cors());
app.use(express.json());


// Start main Server
app.get('/', (req, res) => {
    res.send('server is running');
});

app.listen(port, () => {
    console.log(`server is running in port: ${port}`);
})