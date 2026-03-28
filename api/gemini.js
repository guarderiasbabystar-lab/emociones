module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en Vercel.' });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ error: 'El prompt es obligatorio.' });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: String(prompt) }] }],
          systemInstruction: {
            parts: [
              {
                text: 'Eres una IA experta en educación emocional infantil. Responde siempre de forma amable, pedagógica y en español.'
              }
            ]
          }
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.error ||
        'Error al generar contenido con Gemini.';
      return res.status(response.status).json({ error: message });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'Gemini devolvió una respuesta vacía.' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Error en /api/gemini:', error);
    return res.status(500).json({ error: 'Error interno al conectar con Gemini.' });
  }
};
