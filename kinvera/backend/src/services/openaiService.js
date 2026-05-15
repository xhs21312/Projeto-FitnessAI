const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class OpenAIService {
  static async getChatResponse(userId, message, userContext = {}) {
    try {
      const systemPrompt = `Tu és um assistente virtual amigável e especializado em fitness e nutrição.
Responde em português de Portugal.
Ajuda os utilizadores com:
- Perguntas sobre treinos e exercícios
- Dicas de nutrição e alimentação saudável
- Perguntas sobre a aplicação e funcionalidades
- Problemas técnicos ou dúvidas gerais
Sê útil, paciente, prático e encorajador.
Mantém as respostas concisas (máximo 2-3 frases) para conversas rápidas.

Contexto do utilizador:
- Nome: ${userContext.name || 'Utilizador'}
- Email: ${userContext.email || 'N/A'}`;

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
      { key: 'treino', response: 'Para treinos, recomendo 3-5 sessões por semana. Foca em consistência e progresso gradual.' },
      { key: 'dieta', response: 'Uma dieta equilibrada inclui proteína (1.6-2.2g/kg), carboidratos complexos e muitas frutas/vegetais.' },
      { key: 'nutricao', response: 'Para melhor nutrição, prioriza alimentos integrais, hidratação adequada e refeições regulares.' },
      { key: 'ajuda', response: 'Como posso ajudar? Posso responder sobre treinos, nutrição ou dúvidas sobre a app.' },
      { key: 'problema', response: 'Descreve o problema que estás a ter e vou tentar ajudar-te a resolver.' },
    ];

    for (const item of fallbacks) {
      if (msg.includes(item.key)) {
        return { response: item.response, category: 'fallback' };
      }
    }

    return { 
      response: 'Olá! Sou o assistente virtual. Podes perguntar sobre treinos, nutrição ou a aplicação.', 
      category: 'fallback' 
    };
  }
}

module.exports = OpenAIService;
