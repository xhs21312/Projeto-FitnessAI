const Workout = require('../models/Workout');

exports.createWorkout = async (req, res) => {
  try {
    const { name, type, duration, intensity, exercises, scheduled_date, notes } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Nome e tipo do treino são obrigatórios' });
    }

    const workout = await Workout.create({
      user_id: req.user.id,
      name, type, duration, intensity, exercises, scheduled_date, notes
    });

    res.status(201).json({ message: 'Treino criado com sucesso', workout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar treino' });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.findByUserId(req.user.id);
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter treinos' });
  }
};

exports.getWorkoutsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const workouts = await Workout.findByDate(req.user.id, date);
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter treinos do dia' });
  }
};

exports.completeWorkout = async (req, res) => {
  try {
    const { uuid } = req.params;
    await Workout.markCompleted(uuid);
    res.json({ message: 'Treino marcado como concluído' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao concluir treino' });
  }
};

exports.uncompleteWorkout = async (req, res) => {
  try {
    const { uuid } = req.params;
    await Workout.markUncompleted(uuid);
    res.json({ message: 'Treino desmarcado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao desmarcar treino' });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const { uuid } = req.params;
    await Workout.delete(uuid);
    res.json({ message: 'Treino eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao eliminar treino' });
  }
};
