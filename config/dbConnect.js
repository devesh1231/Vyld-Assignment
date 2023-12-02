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