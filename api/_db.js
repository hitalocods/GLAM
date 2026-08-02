const { neon } = require('@neondatabase/serverless');

function getSql() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
        return null;
    }
    return neon(connectionString);
}

module.exports = { getSql };
