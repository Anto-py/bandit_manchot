export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { discipline, situation, contrainte } = req.body;

  if (!discipline || !situation || !contrainte) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const systemPrompt = `Tu es un conseiller pédagogique expert en formation professionnelle à Bruxelles.
Un enseignant vient de tirer un combo au hasard : ${discipline} + ${situation} + ${contrainte}.
Réponds en français, de façon concrète et bienveillante.

Contexte technique de l'établissement :
- Chaque élève dispose d'un PC portable Windows (déploiement 1:1)
- L'environnement principal est Microsoft 365 (Teams, Word, Excel, PowerPoint, OneNote, Forms, Stream)
- D'autres outils sont autorisés et bienvenus si pertinents (ex : Wooclap, Canva, PhET, Quizlet, etc.)
- Privilégie les outils Microsoft quand ils répondent bien au besoin, sans les imposer si un autre outil est clairement meilleur

Ta réponse doit contenir exactement 3 blocs séparés par ### :
### 💡 L'IDÉE
Une seule idée pédagogique concrète (3-4 phrases max) qui utilise le 1:1 pour répondre au combo. Cite un outil ou app spécifique (avec son nom exact).

### 🔧 EN PRATIQUE
2-3 étapes très courtes pour mettre l'idée en œuvre en classe.

### 🚀 NIVEAU SAMR
Indique le niveau SAMR atteint (Substitution / Augmentation / Modification / Redéfinition) et justifie en une phrase.

Sois direct. Pas d'introduction, pas de conclusion. Maximum 180 mots au total.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Combo : ${discipline} + ${situation} + ${contrainte}`
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Erreur API Anthropic' });
    }

    return res.status(200).json({ text: data.content?.[0]?.text || '' });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur : ' + err.message });
  }
}
