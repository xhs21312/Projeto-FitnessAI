const { v4: uuidv4 } = require('uuid');
const supabase = require('../../config/supabase');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const uuid = uuidv4();
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    const { data: userRow, error: userError } = await supabase
      .from('users')
      .insert([{
        uuid,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        age: userData.age || null,
        weight: userData.weight || null,
        height: userData.height || null,
        goal: userData.goal || 'general',
        fitness_level: userData.fitness_level || 'beginner'
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Create user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert([{ user_id: userRow.id }]);

    if (statsError) console.error('Error creating user_stats:', statsError);

    const { password, ...safeUser } = userRow;
    return safeUser;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  static async findByName(name) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  static async findByUuid(uuid) {
    const { data, error } = await supabase
      .from('users')
      .select('id, uuid, name, email, age, weight, height, goal, fitness_level, created_at')
      .eq('uuid', uuid)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compareSync(candidatePassword, hashedPassword);
  }
}

module.exports = User;
