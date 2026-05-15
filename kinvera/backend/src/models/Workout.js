const { v4: uuidv4 } = require('uuid');
const supabase = require('../../config/supabase');

class Workout {
  static async create(workoutData) {
    const uuid = uuidv4();

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert([{
        uuid,
        user_id: workoutData.user_id,
        name: workoutData.name,
        type: workoutData.type,
        duration: workoutData.duration || 0,
        intensity: workoutData.intensity || 'medium',
        exercises: workoutData.exercises || [],
        scheduled_date: workoutData.scheduled_date || new Date().toISOString().split('T')[0],
        notes: workoutData.notes || ''
      }])
      .select()
      .single();

    if (error) throw error;
    return workout;
  }

  static async findByUserId(user_id) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async findByDate(user_id, date) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id)
      .eq('scheduled_date', date);

    if (error) throw error;
    return data || [];
  }

  static async markCompleted(uuid) {
    const { data, error } = await supabase
      .from('workouts')
      .update({ completed: true })
      .eq('uuid', uuid);

    if (error) throw error;
    return { changes: 1 };
  }

  static async markUncompleted(uuid) {
    const { data, error } = await supabase
      .from('workouts')
      .update({ completed: false })
      .eq('uuid', uuid);

    if (error) throw error;
    return { changes: 1 };
  }

  static async delete(uuid) {
    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('uuid', uuid);

    if (error) throw error;
    return { changes: 1 };
  }
}

module.exports = Workout;
