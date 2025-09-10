const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = [];

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado.' });
  }
  users.push({ email, password });
  res.json({ message: 'Cadastro realizado com sucesso!' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }
  res.json({ message: 'Login realizado com sucesso!' });
});

app.listen(3001, () => {
  console.log('API rodando na porta 3001');
});