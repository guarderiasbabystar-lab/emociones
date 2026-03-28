module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido.' });
  }

  const csvUrl = process.env.CSV_URL;

  if (!csvUrl) {
    return res.status(500).json({ success: false, message: 'Falta configurar CSV_URL en Vercel.' });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son obligatorios.' });
    }

    const response = await fetch(csvUrl);

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'No se pudo cargar la lista de acceso.' });
    }

    const csvText = await response.text();
    const rows = csvText.split(/\r?\n/);

    for (const row of rows) {
      if (!row.trim()) continue;

      const cols = row.split(',');
      if (cols.length < 2) continue;

      const csvUser = (cols[0] || '').trim();
      const csvPass = (cols[1] || '').trim();

      if (csvUser.toLowerCase() === String(username).trim().toLowerCase() && csvPass === String(password).trim()) {
        return res.status(200).json({ success: true, nombre: csvUser });
      }
    }

    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos. Verifica tu información.' });
  } catch (error) {
    console.error('Error en /api/login:', error);
    return res.status(500).json({ success: false, message: 'Error al conectar con la base de datos. Intenta de nuevo.' });
  }
};
