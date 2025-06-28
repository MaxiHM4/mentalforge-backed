
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  progress: {
    mental_resistance: { type: Number, default: 0 },
    discipline_score: { type: Number, default: 0 },
    completed_modules: [String],
  }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.send('🔥 Mental Forge API lista');
});

app.post('/api/user', async (req, res) => {
  try {
    const { username } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Usuario ya existe' });

    const newUser = new User({ username });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

app.get('/api/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

app.put('/api/user/:username/progress', async (req, res) => {
  try {
    const { username } = req.params;
    const { mental_resistance, discipline_score, completed_modules } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.progress = {
      mental_resistance,
      discipline_score,
      completed_modules,
    };
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando progreso' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
