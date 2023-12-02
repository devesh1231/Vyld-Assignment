
Today, We are going to implement Authentication API in Node using JWT, express, and MongoDB. 

I advise you to follow the table of content and don't miss any steps. I will provide the full app code link at the end. 

## Table of Content 
   * [1. Introduction](#1-introduction) 
   * [2. Prerequisites](#2-prerequisites) 
   * [3. Tools and Packages Required](#3-packages-required)
   * [4. Initiate Project](#4-initiate-project)
   * [5. Setup MongoDB Database](#5-setup-mongodb-database)
   * [6. Configure User Model](#6-configure-user-model)
   * [7. Conclusion](#7-conclusion)

----


### 1. Introduction

User Authentication contains various steps, please checkout this flowchart to know more. We will be using this flow to build authentication system in our application.

![Alt Text](https://thepracticaldev.s3.amazonaws.com/i/k2vi3g73qy12ebznxqzs.png)


----
### 2. Prerequisites

You should have prior knowledge of `javascript basics`, `nodejs`. Knowledge of ES6 syntax is a plus. And, at last **nodejs** should be installed on your system. 

----

### 3. Packages Required


You will be needing these following 'npm' packages. 

1. **express**
Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications



2. **body-parser**
It is `nodejs` middleware for parsing the body data. 


3. **bcryptjs**
This library will be used to hash the password and then store it to database.This way even app administrators can't access the account of a user. 

4. **jsonwebtoken**
**jsonwebtoken** will be used to encrypt our data payload on registration and return a token. We can use that **token** to authenticate ourselves to secured pages like the dashboard. There would also an option to set the validity of those token, so you can specify how much time that token will last. 

6. **mongoose**
Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks.


----

## Environment Variables

Create a file named `.env` in the root directory of your project and add the following environment variables:

```plaintext
MONGODB_URL=mongodb://127.0.0.1:27017/DatabaseName
JWT_SECRET="your-secret-code-

```
### 4. Initiate Project

We will start by creating a node project. So, Create a new folder with the name 'node-auth' and follow the steps below. All the project files should be inside the 'node-auth' folder. 



npm init

```

***npm init*** will ask you some basic information about project. Now, you have created the node project, it's time to install the required packages. So, go ahead and install the packages by running the below command.

```javascript
npm install express express-validator body-parser bcryptjs jsonwebtoken mongoose --save
```

Now, create a file ***index.js*** and add this code. 

```javascript
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
app.listen(8000, () => {
    console.log(`Server is running at PORT 8000`);
});

```

If you type `node index.js` in the terminal, the server will start at PORT 8000. 

> You have successfully set up your NodeJS app application. It's time to set up the database to add more functionality. 

----

###5. Setup MongoDB Database

We will be using MongoDB Database to store our users. You can use  local MongoDB server. 

```javascript
const mongoose = require('mongoose');

const dbConnect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database error:", err);
    }
};

module.exports = dbConnect;

```





### 6. Configure User Model

Let's go and first create a `config` folder. This folder will keep the database connection information. 

Create a file named: **dbConnect.js** in **config**


Now, we are done the database connection. Let's create the User Model to save our registered users. 

Go ahead and create a new folder named **model**. Inside the model folder, create a new file **userModel.js**. 

We will be using **mongoose** to create UserSchema. 

**User.js**
```javascript

//FILENAME : userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    bio: {
        type: String,
    },
    age: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
}, {
    timestamps: false,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// export model user with UserSchema
module.exports = mongoose.model("user", UserSchema);

```

Now, we are done with `Database Connection`, `User Schema`. So, let's go ahead and update our index.js to connect our API to the database. 

**index.js**

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const InitiateMongoServer = require("./config/db");

// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});


app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});


```

> Congratulations :smile::smile: , You have successfully connected your app to the MongoDB server.

## Project Screenshots

Here are some screenshots showcasing different aspects of the project:


### Screenshot 1: user-Register

![ user-Register](https://github.com/devesh1231/Vyld-Task/blob/main/register.png);



### Screenshot 2: user-login 

![user-login ](https://github.com/devesh1231/Vyld-Task/blob/main/login-.png)



### Screenshot 3: User-details

![ User-details](https://github.com/devesh1231/Vyld-Task/blob/main/details.png)

### Screenshot 4: user-update

![ user-update](https://github.com/devesh1231/Vyld-Task/blob/main/update.png)

### Screenshot 5: user-delete

![user-delete](https://github.com/devesh1231/Vyld-Task/blob/main/delete.png);

### Screenshot 6: user-logout

![user-logout](https://github.com/devesh1231/Vyld-Task/blob/main/logout.png)
<!-- Add more screenshots as needed -->
