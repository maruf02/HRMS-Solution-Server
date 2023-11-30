const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const mongooseApp = require('./Mongoose/mongoose');
// *********additinal******
const moment = require('moment');
// *********additinal******


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
        const AllWorkSheetCollection = client.db('HRMS').collection('WorkSheet');
        const AllPaymentSheetCollection = client.db('HRMS').collection('payment');
        const AllContactUsCollection = client.db('HRMS').collection('contact');

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
            // console.log('inside token', req.headers.authorization);
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
        app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
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
        // **for hr
        app.get('/users/employee', verifyToken, verifyHr, async (req, res) => {
            const role = 'Employee';
            console.log(role);
            const query = { role: role }
            const result = await AllUsersCollection.find(query).toArray();
            res.send(result);
        })



        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(role);
            const query = { email: email }
            const result = await AllUsersCollection.findOne(query);
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





        app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await AllUsersCollection.deleteOne(query);
            res.send(result);
        })

        // All Users Api



        // Employee worksheet/submitted task api


        app.get('/worksheet', async (req, res) => {
            const result = await AllWorkSheetCollection.find().toArray();
            res.send(result);
        })
        // app.get('/worksheet/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await AllWorkSheetCollection.findOne(query);
        //     res.send(result);
        // })

        // app.get('/worksheetemail/:email', async (req, res) => {
        //     const email = req.params.email;
        //     // console.log(role);
        //     const query = { email: email }
        //     const result = await AllWorkSheetCollection.find(query).toArray();
        //     res.send(result);
        // })
        app.get('/worksheet/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(role);
            const query = { email: email }
            const result = await AllWorkSheetCollection.find(query).toArray();
            res.send(result);
        })

        // app.get('/worksheetemailid/:email/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await AllWorkSheetCollection.findOne(query);
        //     res.send(result);
        // })
        app.get('/worksheet/:email/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllWorkSheetCollection.findOne(query);
            res.send(result);
        })

        // app.get('/worksheetemaildate/:email/:date', async (req, res) => {
        //     // const inputDate = req.params.date;
        //     const inputDate = 'Nov 4, 2023';

        //     const query = { date: inputDate };

        //     const result = await AllWorkSheetCollection.findOne(query);
        //     res.send(result);

        // });

        // app.get('/worksheetemaildate/:email/:month/:year', async (req, res) => {

        //     const inputMonth = 'november'
        //     const inputYear = '2023'
        //     const dbDate1 = 'Nov 4, 2023';
        //     const dbDate12 = 'Nov 5, 2023';
        //     const dbDate13 = 'Nov 6, 2023';
        //     const dbDate14 = 'Nov 8, 2023';
        //     const dbDate15 = 'Dec 4, 2023';
        //     const dbDate16 = 'Nov 4, 2023';

        //     // Parse the input date using moment
        //     const parsedDate = moment(inputDate, 'MMM D, YYYY');

        //     // Check if the parsed date has the desired month and year
        //     const isMonthNov = parsedDate.month() === 10; // Note: Months are zero-indexed in JavaScript (0-11)
        //     const isYear2023 = parsedDate.year() === 2023;

        //     // If both conditions are true, send true, otherwise send false
        //     const result = isMonthNov && isYear2023;
        //     res.send(result);
        // });


        // const dbDates = [
        //     'Nov 4, 2023',
        //     'Nov 5, 2023',
        //     'Nov 6, 2023',
        //     'Nov 8, 2023',
        //     'Dec 4, 2023',
        //     'Nov 4, 2023',
        // ];

        // app.get('/worksheetemaildate/:email/:month/:year', async (req, res) => {
        //     const inputMonth = req.params.month.toLowerCase(); // convert to lowercase for case-insensitive comparison
        //     const inputYear = req.params.year;

        //     // Check if any date in the array matches the input month and year
        //     const matchingDates = dbDates.filter((dbDate) => {
        //         const parsedDate = moment(dbDate, 'MMM D, YYYY');
        //         return (
        //             parsedDate.month() === moment().month(inputMonth).month() &&
        //             parsedDate.year() === parseInt(inputYear)
        //         );
        //     });

        //     res.send(matchingDates);
        // });

        // app.get('/worksheetemail/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email: email };
        //     const result = await AllWorkSheetCollection.find(query).toArray();
        //     res.send(result);
        // });

        // app.get('/worksheetemail/:email/:month/:year', async (req, res) => {
        //     const email = req.params.email;
        //     const inputMonth = req.params.month.toLowerCase();
        //     const inputYear = req.params.year;

        //     // Fetch data from MongoDB based on the provided email
        //     const rawData = await AllWorkSheetCollection.find({ email: email }).lean();

        //     // Filter the data based on the user's input for month and year
        //     const matchingData = rawData.filter(item => {
        //         const parsedDate = moment(item.date, 'MMM D, YYYY');
        //         return (
        //             parsedDate.month() === moment().month(inputMonth).month() &&
        //             parsedDate.year() === parseInt(inputYear)
        //         );
        //     });

        //     res.send(matchingData);
        // });

        // app.get('/worksheetemail/:email', async (req, res) => {
        //     const email = req.params.email;
        //     try {
        //         const result = await AllWorkSheetCollection.find({ email: email }).exec();
        //         res.send(result);
        //     } catch (error) {
        //         res.status(500).send({ message: error.message });
        //     }
        // });

        // app.get('/worksheetemail/:email/:month/:year', async (req, res) => {
        //     const email = req.params.email;
        //     const inputMonth = req.params.month.toLowerCase();
        //     const inputYear = req.params.year;

        //     try {
        //         // Fetch data from MongoDB based on the provided email
        //         const rawData = await AllWorkSheetCollection.find({ email: email }).exec();

        //         // Filter the data based on the user's input for month and year
        //         const matchingData = rawData.filter(item => {
        //             const parsedDate = moment(item.date, 'MMM D, YYYY');
        //             return (
        //                 parsedDate.month() === moment().month(inputMonth).month() &&
        //                 parsedDate.year() === parseInt(inputYear)
        //             );
        //         });

        //         res.send(matchingData);
        //     } catch (error) {
        //         res.status(500).send({ message: error.message });
        //     }
        // });


        app.get('/contact', async (req, res) => {
            const result = await AllContactUsCollection.find().toArray();
            res.send(result);
        })

        app.post('/contact', async (req, res) => {
            const newWorkSheet = req.body;
            console.log(newWorkSheet);
            const result = await AllContactUsCollection.insertOne(newWorkSheet);
            console.log(result);
            res.send(result);
        })




        app.post('/worksheet', async (req, res) => {
            const newWorkSheet = req.body;
            console.log(newWorkSheet);
            const result = await AllWorkSheetCollection.insertOne(newWorkSheet);
            console.log(result);
            res.send(result);
        })


        app.put('/worksheet/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateTask = req.body;
            const task = {
                $set: {
                    name: updateTask.name,
                    email: updateTask.email,
                    empId: updateTask.empId,
                    category: updateTask.category,
                    hours: updateTask.hours,
                    overtime: updateTask.overtime,
                    note: updateTask.note,
                    date: updateTask.date,
                    mainSalary: updateTask.mainSalary,
                    overtimeSalary: updateTask.overtimeSalary,


                }
            }

            const result = await AllWorkSheetCollection.updateOne(filter, task, option);
            console.log(updateTask);
            res.send(result);

        })



        // **********************
        // **********************
        app.get('/worksheetCal', async (req, res) => {
            const result = await AllWorkSheetCollection.find().toArray();
            res.send(result);
        })
        // app.get('/worksheetCal/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await AllWorkSheetCollection.findOne(query);
        //     res.send(result);
        // })

        app.get('/worksheetCal/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(role);
            const query = { email: email }
            const result = await AllWorkSheetCollection.find(query).toArray();
            res.send(result);
        })
        // app.get('/worksheetCal/:email/:month', async (req, res) => {
        //     const month = req.params.month;
        //     // console.log(role);
        //     const query = { month: month }
        //     const result = await AllWorkSheetCollection.find(query).toArray();
        //     res.send(result);
        // })
        app.get('/worksheetCal/:email/:month/:year', async (req, res) => {
            const month = req.params.month;
            const year = req.params.year;
            // console.log(role);
            const query = { month: month, year: year }
            const result = await AllWorkSheetCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/worksheetCal/:email/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllWorkSheetCollection.findOne(query);
            res.send(result);
        })

        // **********************
        // **********************


        // *************************************************


        app.get('/payment', verifyToken, async (req, res) => {
            const result = await AllPaymentSheetCollection.find().toArray();
            res.send(result);
        })
        app.get('/payment/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            // console.log(role);
            const query = { payEmail: email }
            const result = await AllPaymentSheetCollection.find(query).toArray();
            res.send(result);
        })


        app.post('/payment', async (req, res) => {
            const newPayment = req.body;
            console.log(newPayment);
            const result = await AllPaymentSheetCollection.insertOne(newPayment);
            console.log(result);
            res.send(result);
        })


        app.get('/paymentChart/:email', async (req, res) => {
            try {
                const email = req.params.email;
                console.log(email);

                const result = await AllPaymentSheetCollection.aggregate([

                    { $match: { payEmail: email } },


                    {
                        $group: {
                            _id: { payMonth: "$payMonth", payYear: "$payYear" },
                            maxPaySalary: { $max: { $toDouble: "$paySalary" } }
                        }
                    },


                    { $sort: { "_id.payYear": 1, "_id.payMonth": 1 } },


                    {
                        $project: {
                            _id: 0,
                            entry: {
                                // $concat: ["$_id.payYear", ",", { $substr: ["$_id.payMonth", 0, 3] }],
                                // $concat: ["$_id.payMonth", ",", { $substr: ["$_id.payYear", 2, -1] }],
                                $concat: [
                                    { $substr: ["$_id.payMonth", 0, 3] },
                                    ",",
                                    { $substr: ["$_id.payYear", 2, -1] }
                                ]

                            },
                            // maxPaySalaryFormatted: {
                            //     $concat: ["$", { $toString: "$maxPaySalary" }]
                            // }
                            // maxPaySalaryFormatted: { $concat: ["", "$maxPaySalary"] }
                            maxPaySalaryFormatted: { $concat: ["", { $substr: ["$maxPaySalary", 0, -1] }] }
                        }
                    }
                ]).toArray();

                res.send(result);
            } catch (error) {
                console.error("Error fetching payment data:", error);
                res.status(500).send("Internal Server Error");
            }
        });









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