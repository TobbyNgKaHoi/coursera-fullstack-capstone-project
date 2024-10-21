/*jshint esversion: 11 */
//Step 1 - Task 2: Import necessary packages
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const pino = require('pino');
const router = express.Router();
const connectToDatabase = require('../models/db');
const { connect } = require('./giftRoutes');

dotenv.config();
//Step 1 - Task 3: Create a Pino logger instance
const logger = pino();


//Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    console.log('API register');
    try {
        let { firstName, lastName, email, password } = req.body
        firstName = (firstName??"").trim();
        lastName = (lastName??"").trim();
        email = (email??"").trim();
        password = (password??"").trim();

        if (firstName === "") {
            return res.json({ error: `firstName is required.`});
        } else if (lastName === "") {
            return res.json({ error: `lastName is required.`});
        } else if (email === "") {
            return res.json({ error: `email is required.`});
        } else if (password === "") {
            return res.json({ error: `password is required.`});
        }

        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access MongoDB collection
        const collection = db.collection("users");

        // Task 3: Check for existing email
        const existingEmail = await collection.findOne({ email });

        if (existingEmail) {
            return res.json({ error: `email already exist. Pls login with ${email} or register with another email`});
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(password, salt);
        

        // Task 4: Save user details in database
        const newUser = await collection.insertOne({
            email, firstName, lastName, password : hash,
            createdAt: new Date()
        })

        // Task 5: Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId
            }
        }

        const authtoken = jwt.sign(payload, JWT_SECRET);
        
        logger.info('User registered successfully');
        res.json({authtoken,email});
    } catch (e) {
        console.log('Register error: ', e);
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    console.log('API login');
    try {
        let { email, password } = req.body;
        email = (email??"").trim();
        password = (password??"").trim();

        if (email === "") {
            return res.json({ error: `email is required.`});
        } else if (password === "") {
            return res.json({ error: `password is required.`});
        }
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();

        // Task 2: Access MongoDB `users` collection
        const collection = db.collection("users");

        // Task 3: Check for user credentials in database
        const existingUser = await collection.findOne({ email });

        // Task 4: Task 4: Check if the password matches the encrypyted password and send appropriate message on mismatch
        if (existingUser) {
            let result = await bcryptjs.compare(password, existingUser.password);

            if (!result) {
                logger.error('Password do not match');
                return res.status(404).json({ error: 'Wrong password'});
            }
        } else {
            // Task 7: Send appropriate message if user not found
            logger.error('User not found');
            return res.status(404).json({ error: `User (${email}) not found`});
        }

        // Task 5: Fetch user details from database
        const firstName = existingUser.firstName;
        
        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {
                id: existingUser._id.toString(),
            }
        }

        const authtoken = jwt.sign(payload, JWT_SECRET);
        
        res.json({authtoken, userName : firstName, userEmail: email });
        
    } catch (e) {
        console.log('Login error: ', e);
        return res.status(500).send('Internal server error');
    }
});

// Task 1: Use the `body`,`validationResult` from `express-validator` for input validation

router.put('/update', async (req, res) => {
    console.log('API update');

    // Task 2: Validate the input using `validationResult` and return approiate message if there is an error.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request: ', errors.array());
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        // Task 3: Check if `email` is present in the header and throw an appropriate error message if not present.
        const email = req.headers.email;
        
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: find user credentials in database
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            // Task 7: Send appropriate message if user not found
            logger.error('User not found');
            return res.status(404).json({ error: `User (${email}) not found`});
        }
        
        existingUser.firstName = (req.body.name??"").trim();
        existingUser.updatedAt = new Date();

        // Task 6: update user credentials in database
        const updateUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        )

        // Task 7: create JWT authentication using secret key from .env file
        const payload = {
            user: {
                id: updateUser._id.toString(),
            }
        }
        const authtoken = jwt.sign(payload, JWT_SECRET);
        res.json({authtoken});
    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});
module.exports = router;