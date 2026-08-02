const { getSql } = require('./_db');

module.exports = async function handler(req, res) {
    const sql = getSql();
    if (!sql) {
        return res.status(200).json({ ok: false, useLocal: true });
    }

    try {
        if (req.method === 'GET') {
            const rows = await sql`
                SELECT id, name, role, phone, price, avatar_url AS "avatarUrl", schedule 
                FROM professionals 
                ORDER BY created_at ASC
            `;
            return res.status(200).json({ ok: true, data: rows });
        }

        if (req.method === 'POST') {
            const { id, name, role, phone, price, avatarUrl, schedule } = req.body;
            if (!id || !name || !role || !phone) {
                return res.status(400).json({ ok: false, error: 'Campos obrigatórios ausentes.' });
            }

            await sql`
                INSERT INTO professionals (id, name, role, phone, price, avatar_url, schedule)
                VALUES (${id}, ${name}, ${role}, ${phone}, ${price || 0}, ${avatarUrl || null}, ${JSON.stringify(schedule)})
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    phone = EXCLUDED.phone,
                    price = EXCLUDED.price,
                    avatar_url = EXCLUDED.avatar_url,
                    schedule = EXCLUDED.schedule
            `;
            return res.status(200).json({ ok: true });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id || (req.body && req.body.id);
            if (!id) return res.status(400).json({ ok: false, error: 'ID necessário' });
            await sql`DELETE FROM professionals WHERE id = ${id}`;
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ ok: false, error: 'Método não permitido' });
    } catch (err) {
        console.error('API Professionals Error:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
