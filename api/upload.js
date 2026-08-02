const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Método não permitido' });
    }

    try {
        const filename = req.query.filename || `avatar-${Date.now()}.jpg`;
        const blob = await put(filename, req, {
            access: 'public',
        });

        return res.status(200).json({ ok: true, url: blob.url });
    } catch (err) {
        console.error('Vercel Blob Upload Error:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
