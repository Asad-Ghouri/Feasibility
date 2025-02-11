const pgPromise = require('pg-promise');
const dotenv = require('dotenv');

dotenv.config();

// Enhanced error handling
const initOptions = {
    error: (error, e) => {
        if (e.cn) {
            console.error('Connection Error:', error.message);
        }
        if (e.query) {
            console.error('Query Error:', error.message);
            console.error('Query:', e.query);
            console.error('Parameters:', e.params);
        }
    },
    connect: (client, dc, useCount) => {
        const cp = client.connectionParameters;
        console.log('Connected to database:', cp.database);
    },
    disconnect: (client, dc) => {
        console.log('Disconnected from database');
    }
};

const pgp = pgPromise(initOptions);

// Connection configuration with retry mechanism
const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 30,  // Maximum number of connections in the pool
    idleTimeoutMillis: 30000,  // How long a client is allowed to remain idle
    connectionTimeoutMillis: 10000  // How long to wait when connecting
};

const db = pgp(connectionConfig);

// Test database connection
async function testConnection() {
    try {
        await db.one('SELECT NOW()');
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

// Run connection test
testConnection();

module.exports = db;
