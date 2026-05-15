const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, uuid: user.uuid, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, age, weight, height, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e password são obrigatórios' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email já registado' });
    }

    const user = await User.create({ name, email, password, age, weight, height, goal });
    const token = generateToken(user);

    res.status(201).json({ message: 'Utilizador criado com sucesso', user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar utilizador' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/nome e password são obrigatórios' });
    }

    // Try finding by email first, then by name
    let user = await User.findByEmail(email);
    if (!user) {
      user = await User.findByName(email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: 'Login bem-sucedido', user: userWithoutPassword, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByUuid(req.user.uuid);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Não revelar que o email não existe (segurança)
      return res.json({ message: 'Se o email existir, receberás um email de recuperação' });
    }

    // Criar token de reset
    const reset = await PasswordReset.create(email);

    // Enviar email real
    try {
      await sendPasswordResetEmail(email, reset.token);
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
      return res.status(500).json({ error: 'Erro ao enviar email. Verifica a configuração SMTP.' });
    }

    res.json({ message: 'Se o email existir, receberás um email de recuperação' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar pedido' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token e nova password são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password deve ter pelo menos 6 caracteres' });
    }

    // Verificar token
    const reset = await PasswordReset.findByToken(token);
    if (!reset) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Atualizar password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const supabase = require('../../config/supabase');
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', reset.email);

    if (updateError) throw updateError;

    // Marcar token como usado
    await PasswordReset.markUsed(token);

    res.json({ message: 'Password atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao redefinir password' });
  }
};
