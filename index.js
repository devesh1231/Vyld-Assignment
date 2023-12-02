const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');
dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



const authRoutes = require('./routes/userAuthentication');
app.use('/api/users', authRoutes);
//app.use(errorHandler);
app.listen(8000, () => {
    console.log(`Server is running at PORT 8000`);
});