const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
