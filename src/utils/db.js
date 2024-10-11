const mongoose = require('mongoose');

const connectDatabase = async ({ DB_USER, DB_PASS, DB_NAME, DB_HOSTS, REPLCA_SET_NAME }) => {
    const dbUri = `mongodb://${DB_HOSTS}/${DB_NAME}?replicaSet=${REPLCA_SET_NAME}`;

    console.log('Connecting to MongoDB:', dbUri);
    try {
        await mongoose.connect(dbUri, {
        });
        console.log('Successfully connected to MongoDB replica.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = { connectDatabase };