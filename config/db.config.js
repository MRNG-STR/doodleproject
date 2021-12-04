const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'doodlebluePurchase',
    password: 'Arun@123',
    port: 5433,
    max: 20,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 2000,
})

module.exports = {
    pool: pool
};