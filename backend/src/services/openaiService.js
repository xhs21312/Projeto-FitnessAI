const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class OpenAIService {
  static async getChatResponse(userId, message, userContext = {}) {
    try {
      const systemPrompt = `Tu és um coach de fitness experiente e motivador. 
Responde em português de Portugal.
Ajuda com treinos, nutrição, recuperação e motivação.
Sê conciso, prático e encorajador.
Mantém as respostas curtas (máximo 2-3 frases) para conversas rápidas.

Contexto do utilizador:
- Nome: ${userContext.name || 'Atleta'}
- Idade: ${userContext.age || 'N/A'}
- Peso: ${userContext.weight || 'N/A'} kg
- Altura: ${userContext.height || 'N/A'} cm
- Objetivo: ${userContext.goal || 'geral'}
- Nível de fitness: ${userContext.fitness_level || 'iniciante'}`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'Não consegui processar a tua mensagem. Tenta novamente.';

      return { response, category: 'ai' };
    } catch (error) {
      console.error('Groq API error:', error.message);
      
      return this.getFallbackResponse(message);
    }
  }

  static getFallbackResponse(message) {
    const msg = message.toLowerCase();
    
    const fallbacks = [
      { key: 'treino', response: 'Para treinos, recomendo 3-5 sessões por semana. O que queres focar hoje?' },
      { key: 'dieta', response: 'Foca em proteína (1.6-2.2g/kg), carboidratos complexos e hidratação adequada.' },
      { key: 'recuperacao', response: 'Descansa 48h entre treinos do mesmo grupo muscular. Dorme 7-9h por noite.' },
      { key: 'motivacao', response: 'Lembra-te porque começaste. Consistência > intensidade. Cada treino conta!' },
    ];

    for (const item of fallbacks) {
      if (msg.includes(item.key)) {
        return { response: item.response, category: 'fallback' };
      }
    }

    return { 
      response: 'Posso ajudar com treinos, nutrição, recuperação ou motivação. Pergunta-me!', 
      category: 'fallback' 
    };
  }
}

module.exports = OpenAIService;
