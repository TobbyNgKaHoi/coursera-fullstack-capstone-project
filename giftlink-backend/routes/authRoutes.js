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
            email, firstName, lastName, password,
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
         return res.status(500).send('Internal server error');
    }
});

module.exports = router;