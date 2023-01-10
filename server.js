const dotenv = require('dotenv');
const mongoose = require('mongoose');

// handle 500 server errors. Shutsdown server.
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// consume enviornment variables
dotenv.config({ path: './config.env' });
const app = require('./app');

// mongo connection string
const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

// connect to DB
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('DB connection successful!');
    });

// defines port for server to listen on
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// Gracefully handles unknown errors by shutting down server
process.on('uncaughtRejection', (err) => {
    console.log('Unhandled Rejection! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
