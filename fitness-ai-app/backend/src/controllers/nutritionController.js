const supabase = require('../../config/supabase');

exports.getMeals = async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase
      .from('nutrition')
      .select('*')
      .eq('user_id', req.user.id);

    if (date) {
      query = query.gte('consumed_at', `${date}T00:00:00`).lt('consumed_at', `${date}T23:59:59`);
    }

    const { data, error } = await query.order('consumed_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Erro ao obter refeições' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.addMeal = async (req, res) => {
  try {
    const { meal_type, food_items, calories, protein, carbs, fat, pre_workout, post_workout } = req.body;

    const { data, error } = await supabase
      .from('nutrition')
      .insert([{
        user_id: req.user.id,
        meal_type,
        food_items: food_items || [],
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        pre_workout: pre_workout || false,
        post_workout: post_workout || false
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Erro ao adicionar refeição' });
    res.status(201).json({ message: 'Refeição adicionada', id: data.id });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.getPreWorkoutSuggestions = async (req, res) => {
  res.json({
    suggestions: [
      { name: 'Banana', reason: 'Energia rápida de hidratos complexos', timing: '30-45 min antes' },
      { name: 'Café / Pré-treino', reason: 'Aumento de foco e performance', timing: '20-30 min antes' },
      { name: 'Pasta de amendoim com pão', reason: 'Energia sustentada', timing: '1-2 horas antes' },
      { name: 'Aveia com fruta', reason: 'Hidratos complexos e fibra', timing: '1 hora antes' }
    ]
  });
};

exports.getPostWorkoutSuggestions = async (req, res) => {
  res.json({
    suggestions: [
      { name: 'Batido de proteína', reason: 'Recuperação muscular rápida', timing: 'Dentro de 30 min' },
      { name: 'Ovos com batata doce', reason: 'Proteína completa + hidratos', timing: 'Até 1 hora depois' },
      { name: 'Frango com arroz', reason: 'Leucina para recuperação', timing: 'Até 2 horas depois' },
      { name: 'Iogurte grego com fruta', reason: 'Proteína + hidratos simples', timing: 'Imediato' }
    ]
  });
};
