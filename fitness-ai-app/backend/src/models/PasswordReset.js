const supabase = require('../../config/supabase');
const crypto = require('crypto');

class PasswordReset {
  static async create(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    const { data, error } = await supabase
      .from('password_resets')
      .insert([{ email, token, expires_at: expiresAt, used: false }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByToken(token) {
    const { data, error } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;

    // Check if expired
    if (new Date(data.expires_at) < new Date()) return null;
    return data;
  }

  static async markUsed(token) {
    const { error } = await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('token', token);

    if (error) throw error;
  }
}

module.exports = PasswordReset;
