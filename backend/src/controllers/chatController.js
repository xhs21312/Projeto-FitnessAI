const OpenAIService = require('../services/openaiService');
const supabase = require('../../config/supabase');

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mensagem e obrigatoria' });
    }

    // Buscar contexto do utilizador do Supabase
    const { data: userContext, error } = await supabase
      .from('users')
      .select('name, age, weight, height, goal, fitness_level')
      .eq('id', req.user.id)
      .single();

    if (error) console.error('Error fetching user context:', error);

    const { response, category } = await OpenAIService.getChatResponse(req.user.id, message, userContext || {});
    
    res.json({ response, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
};
