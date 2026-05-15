const AIService = require('../services/aiService');

exports.getWorkoutSuggestion = async (req, res) => {
  try {
    const suggestion = await AIService.getWorkoutSuggestion(req.user.id);
    res.json(suggestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar sugestao de treino' });
  }
};

exports.getRecoveryAnalysis = async (req, res) => {
  try {
    const analysis = await AIService.analyzeRecovery(req.user.id);
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao analisar recuperacao' });
  }
};
