const supabase = require('../../config/supabase');

exports.getLatestData = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('watch_data')
      .select('*')
      .eq('user_id', req.user.id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: 'Erro ao obter dados' });

    if (!data && process.env.SIMULATE_WATCH_DATA === 'true') {
      return res.json({
        simulated: true,
        heart_rate: 72 + Math.floor(Math.random() * 20),
        calories: Math.floor(Math.random() * 500),
        steps: 3000 + Math.floor(Math.random() * 7000),
        distance: 2 + Math.random() * 5,
        active_minutes: 15 + Math.floor(Math.random() * 60),
        recorded_at: new Date().toISOString()
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data, error } = await supabase
      .from('watch_data')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Erro ao obter histórico' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.saveData = async (req, res) => {
  try {
    const { device_type, heart_rate, calories, steps, distance, active_minutes } = req.body;

    const { data, error } = await supabase
      .from('watch_data')
      .insert([{
        user_id: req.user.id,
        device_type: device_type || 'unknown',
        heart_rate, calories, steps, distance, active_minutes
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Erro ao guardar dados' });
    res.status(201).json({ message: 'Dados guardados', id: data.id });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
