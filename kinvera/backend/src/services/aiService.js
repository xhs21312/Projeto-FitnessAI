const supabase = require('../../config/supabase');

class AIService {
  static async getWorkoutSuggestion(userId) {
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: false })
      .limit(5);

    const lastWorkout = workouts?.[0];
    let suggestion = {
      type: 'full_body',
      name: 'Treino Completo',
      intensity: 'medium',
      duration: 45,
      reason: 'Comeca com um treino equilibrado',
      exercises: [
        { name: 'Agachamento', sets: 3, reps: 10 },
        { name: 'Flexoes', sets: 3, reps: 12 },
        { name: 'Remada', sets: 3, reps: 10 },
        { name: 'Prancha', sets: 3, reps: '30s' },
      ]
    };

    if (lastWorkout) {
      const lastType = lastWorkout.type?.toLowerCase() || '';
      const lastName = lastWorkout.name?.toLowerCase() || '';

      if (lastName.includes('leg') || lastName.includes('perna') || lastType.includes('leg')) {
        suggestion = {
          type: 'upper_body',
          name: 'Upper Body - Peito e Ombros',
          intensity: 'medium',
          duration: 50,
          reason: 'Treinaste pernas ontem. Descanso muscular recomendado para membros inferiores.',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: 8 },
            { name: 'Overhead Press', sets: 3, reps: 10 },
            { name: 'Dips', sets: 3, reps: 12 },
            { name: 'Lateral Raises', sets: 3, reps: 15 },
          ]
        };
      } else if (lastName.includes('chest') || lastName.includes('peito') || lastType.includes('upper')) {
        suggestion = {
          type: 'lower_body',
          name: 'Lower Body - Pernas e Gluteos',
          intensity: 'medium',
          duration: 50,
          reason: 'Focaste em upper body no ultimo treino. Hoje e dia de pernas!',
          exercises: [
            { name: 'Squat', sets: 4, reps: 8 },
            { name: 'Romanian Deadlift', sets: 3, reps: 10 },
            { name: 'Lunges', sets: 3, reps: 12 },
            { name: 'Leg Curl', sets: 3, reps: 12 },
          ]
        };
      } else if (lastWorkout.intensity === 'high') {
        suggestion.intensity = 'low';
        suggestion.name = 'Treino Ativo de Recuperacao';
        suggestion.reason = 'Ultimo treino foi intenso. Hoje e dia de recuperacao ativa.';
        suggestion.duration = 30;
        suggestion.exercises = [
          { name: 'Caminhada rapida', sets: 1, reps: '20 min' },
          { name: 'Yoga / Mobilidade', sets: 1, reps: '15 min' },
          { name: 'Prancha', sets: 3, reps: '45s' },
        ];
      }
    }

    return suggestion;
  }

  static async analyzeRecovery(userId) {
    const since = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('scheduled_date', since);

    const weekCount = count || 0;

    let recovery = {
      status: 'good',
      message: 'Volume de treino equilibrado.',
      weekly_count: weekCount,
      recommendation: 'Mantem o ritmo atual.'
    };

    if (weekCount < 2) {
      recovery.status = 'low_activity';
      recovery.message = 'Pouca atividade esta semana.';
      recovery.recommendation = 'Tenta fazer pelo menos 3 treinos por semana.';
    } else if (weekCount > 5) {
      recovery.status = 'high_load';
      recovery.message = 'Volume alto de treino.';
      recovery.recommendation = 'Considera um dia de descanso ativo.';
    }

    return recovery;
  }
}

module.exports = AIService;
