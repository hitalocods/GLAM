const { getSql } = require('./_db');

module.exports = async function handler(req, res) {
    const sql = getSql();
    if (!sql) {
        return res.status(200).json({ ok: false, useLocal: true });
    }

    try {
        if (req.method === 'GET') {
            const rows = await sql`
                SELECT id, description AS "desc", amount
                FROM expenses
                ORDER BY created_at DESC
            `;
            return res.status(200).json({ ok: true, data: rows });
        }

        if (req.method === 'POST') {
            const { id, desc, amount } = req.body;
            if (!id || !desc) {
                return res.status(400).json({ ok: false, error: 'Descrição é obrigatória.' });
            }

            await sql`
                INSERT INTO expenses (id, description, amount)
                VALUES (${id}, ${desc}, ${amount || 0})
            `;
            return res.status(200).json({ ok: true });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id || (req.body && req.body.id);
            if (!id) return res.status(400).json({ ok: false, error: 'ID necessário' });
            await sql`DELETE FROM expenses WHERE id = ${id}`;
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ ok: false, error: 'Método não permitido' });
    } catch (err) {
        console.error('API Expenses Error:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
