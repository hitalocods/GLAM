const { getSql } = require('./_db');

module.exports = async function handler(req, res) {
    const sql = getSql();
    if (!sql) {
        return res.status(200).json({ ok: false, useLocal: true });
    }

    try {
        if (req.method === 'GET') {
            const rows = await sql`
                SELECT id, pro_id AS "proId", date, time, client_name AS "clientName", client_phone AS "clientPhone", service, price, created_at AS "createdAt"
                FROM bookings
                ORDER BY created_at DESC
            `;
            return res.status(200).json({ ok: true, data: rows });
        }

        if (req.method === 'POST') {
            const { id, proId, date, time, clientName, clientPhone, service, price } = req.body;
            if (!id || !proId || !date || !time || !clientName || !clientPhone) {
                return res.status(400).json({ ok: false, error: 'Campos obrigatórios ausentes.' });
            }

            // Check if slot is already taken
            const existing = await sql`
                SELECT id FROM bookings 
                WHERE pro_id = ${proId} AND date = ${date} AND time = ${time} AND id != ${id}
            `;
            if (existing.length > 0) {
                return res.status(409).json({ ok: false, error: 'Este horário acabou de ser agendado por outra cliente!' });
            }

            await sql`
                INSERT INTO bookings (id, pro_id, date, time, client_name, client_phone, service, price)
                VALUES (${id}, ${proId}, ${date}, ${time}, ${clientName}, ${clientPhone}, ${service || ''}, ${price || 0})
            `;
            return res.status(200).json({ ok: true });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id || (req.body && req.body.id);
            if (!id) return res.status(400).json({ ok: false, error: 'ID necessário' });
            await sql`DELETE FROM bookings WHERE id = ${id}`;
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ ok: false, error: 'Método não permitido' });
    } catch (err) {
        console.error('API Bookings Error:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
