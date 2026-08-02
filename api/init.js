const { getSql } = require('./_db');

module.exports = async function handler(req, res) {
    const sql = getSql();
    if (!sql) {
        return res.status(200).json({ ok: false, message: 'DATABASE_URL not set in environment.' });
    }

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS professionals (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                price NUMERIC(10, 2) DEFAULT 0,
                avatar_url TEXT,
                schedule JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(50) PRIMARY KEY,
                pro_id VARCHAR(50) REFERENCES professionals(id) ON DELETE CASCADE,
                date VARCHAR(20) NOT NULL,
                time VARCHAR(10) NOT NULL,
                client_name VARCHAR(255) NOT NULL,
                client_phone VARCHAR(50) NOT NULL,
                service VARCHAR(255) NOT NULL,
                price NUMERIC(10, 2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS expenses (
                id VARCHAR(50) PRIMARY KEY,
                description VARCHAR(255) NOT NULL,
                amount NUMERIC(10, 2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        return res.status(200).json({ ok: true, message: 'Neon tables initialized successfully' });
    } catch (err) {
        console.error('Init DB error:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
