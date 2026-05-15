const supabase = require('../../config/supabase');

exports.getStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: 'Erro ao obter estatísticas' });
    res.json(data || { total_workouts: 0, total_duration: 0, total_calories: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, age, weight, height, goal, fitness_level } = req.body;
    
    const { error } = await supabase
      .from('users')
      .update({ name, age, weight, height, goal, fitness_level, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (error) return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
