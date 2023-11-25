const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofnl5ln.mongodb.net/HRMS?retryWrites=true&w=majority`;


mongoose.connect(MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log('Connected to MongooseDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`MongooseDB connection error: ${err}`);
});



const jobOfferSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    jobType: { type: String, required: true },
    skills: { type: String, required: true },
    salary: { type: String, required: true },
    today: { type: Date, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },

}, { versionKey: false });

const JobOfferModel = mongoose.model('jobOffer', jobOfferSchema);

// jobOffer related api for mongoose

app.get('/joboffer', async (req, res) => {
    try {
        const result = await JobOfferModel.find();
        // console.log(result);
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/joboffer/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await JobOfferModel.findById(id);
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.post('/joboffer', async (req, res) => {
    try {
        const { jobTitle,
            jobType,
            skills,
            salary,
            today,
            date,
            description } = req.body;

        const newJobOffer = {
            jobTitle,
            jobType,
            skills,
            salary,
            today,
            date,
            description
        };
        console.log('mongoose', newJobOffer);
        const result = await JobOfferModel.create(newJobOffer);
        console.log(result);
        res.send(result);
        // res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/joboffer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateJobOffer = req.body;
        const result = await JobOfferModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    jobTitle: updateJobOffer.jobTitle,
                    jobType: updateJobOffer.jobType,
                    skills: updateJobOffer.skills,
                    salary: updateJobOffer.salary,
                    today: updateJobOffer.today,
                    date: updateJobOffer.date,
                    description: updateJobOffer.description,
                }
            },
            { new: true } // { new: true } returns the modified document
        );
        console.log(result);
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }

})





app.delete('/joboffer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await JobOfferModel.findByIdAndDelete(id);
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});









app.get('/', (req, res) => {
    // res.send('Mongoose server is running');
    res.send(`Mongoose server is running `);
});

// app.listen(port, () => {
//     console.log(`Mongoose server is running in port: 5001`);
// });

module.exports = app;