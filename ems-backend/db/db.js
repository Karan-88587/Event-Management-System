const mongoose = require('mongoose');

const connectDB = async () => {

    const dbUrl = process.env.DB_URL;
    const dbName = process.env.DB_NAME;

    try {
        const connectionInstance = await mongoose.connect(`${dbUrl}/${dbName}`);
        console.log('Connected to MongoDB');
        console.log("Database host :", connectionInstance.connection.host);
    } catch (error) {
        console.error('Error connecting to MongoDB :', error);
        process.exit(1);
    }
};

module.exports = connectDB;