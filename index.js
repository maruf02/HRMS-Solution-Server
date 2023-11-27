const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const mongooseApp = require('./Mongoose/mongoose');


app.use('/mongoose', mongooseApp);
// app.use(cors({
//     origin: [
//         'http://localhost:5173',
//         'http://localhost:5174',
//         // 'https://hotelbooking-client.web.app',
//         // 'https://hotelbooking-client.firebaseapp.com'
//     ],
//     credentials: true
// }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofnl5ln.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const AllUsersCollection = client.db('HRMS').collection('UsersInfo');

        // auth related api
        // Jwt for cookies
        // app.post('/jwt', logger, async (req, res) => {
        //     const user = req.body;
        //     console.log('user for token', user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });

        //     res.cookie('token', token, {
        //         httpOnly: true,
        //         secure: true,
        //         sameSite: 'none'
        //     })
        //         .send({ success: true });
        // })

        // jwt for locastorage
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });
            res.send({ token });
        })

        // app.post('/logout', async (req, res) => {
        //     const user = req.body;
        //     console.log('logging out', user);
        //     res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        // })

        app.post('/logout', (req, res) => {
            res.clearCookie('token').send({ success: true });
        });


        // middlewares 
        const logger = (req, res, next) => {
            console.log('log: info', req.method, req.url);
            next();
        }


        // verify token for cookie parser
        // const verifyToken = (req, res, next) => {
        //     const token = req?.cookies?.token;
        //     // console.log('token in the middleware', token);
        //     // no token available
        //     if (!token) {
        //         return res.status(401).send({ message: 'unauthorized access' })
        //     }
        //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        //         if (err) {
        //             return res.status(401).send({ message: 'unauthorized access' })
        //         }
        //         req.user = decoded;
        //         next();
        //     })
        // }


        const verifyToken = (req, res, next) => {
            // console.log('inside verify token', req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded;
                const email = req.decoded.email;
                console.log(email);
                next();
            })
        }

        // verifyAdmin check middleware
        const verifyAdmin = async (req, res, next) => {
            try {
                const email = req.decoded.email;
                console.log(email);
                const query = { email: email };
                console.log('email check admin', query);
                const user = await AllUsersCollection.findOne(query);
                const isAdmin = user?.role === 'Admin';
                if (!isAdmin) {
                    return res.status(403).send({ message: 'forbidden access' });
                }
                next();
            } catch (error) {
                console.error('Error in verifyAdmin middleware:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }

        }



        // verifyHr check middleware
        const verifyHr = async (req, res, next) => {
            try {
                const email = req.decoded.email;
                console.log(email);
                const query = { email: email };
                console.log('email check admin', query);
                const user = await AllUsersCollection.findOne(query);
                const isHr = user?.role === 'HR';
                if (!isHr) {
                    return res.status(403).send({ message: 'forbidden access' });
                }
                next();
            } catch (error) {
                console.error('Error in verifyAdmin middleware:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        }
        // verifyHr check middleware
        const verifyEmployee = async (req, res, next) => {
            try {
                const email = req.decoded.email;
                console.log(email);
                const query = { email: email };
                console.log('email check admin', query);
                const user = await AllUsersCollection.findOne(query);
                const isEmployee = user?.role === 'Employee';
                if (!isEmployee) {
                    return res.status(403).send({ message: 'forbidden access' });
                }
                next();
            } catch (error) {
                console.error('Error in verifyAdmin middleware:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        }




        // *******************************
        // *******************************
        // *******************************
        // *******************************



        // All Create api works here
        // All Users Api
        app.get('/users', async (req, res) => {
            const cursor = AllUsersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // admin check

        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            console.log(email);
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { email: email };
            const user = await AllUsersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'Admin';
            }
            res.send({ admin });
        })


        // HR check

        app.get('/users/hr/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            console.log(email);
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { email: email };
            const user = await AllUsersCollection.findOne(query);
            let hr = false;
            if (user) {
                hr = user?.role === 'HR';
            }
            res.send({ hr });
        })


        // Employee check

        app.get('/users/employee/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            console.log(email);
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { email: email };
            const user = await AllUsersCollection.findOne(query);
            let employee = false;
            if (user) {
                employee = user?.role === 'Employee';
            }
            res.send({ employee });
        })


        // Role wise check ends

        app.get('/users/employee', async (req, res) => {
            const role = 'Employee';
            console.log(role);
            const query = { role: role }
            const result = await AllUsersCollection.find(query).toArray();
            res.send(result);
        })




        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllUsersCollection.findOne(query);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const query = { email: newUser.email }
            const existingUser = await AllUsersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await AllUsersCollection.insertOne(newUser);
            res.send(result);
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const { status, role } = req.body;
            const updatedDoc = {
                $set: {
                    status: status,
                    role: role
                }
            };
            const result = await AllUsersCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })





        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await AllUsersCollection.deleteOne(query);
            res.send(result);
        })

        // All Users Api

        // All Create api works here
        // auth related api


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







// Start main Server
app.get('/', (req, res) => {
    res.send('server is running');
});

app.listen(port, () => {
    console.log(`server is running in port: ${port}`);
})