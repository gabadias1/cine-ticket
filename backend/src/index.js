require('dotenv').config();
const express = require('express');
const prisma = require('./prismaClient');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Simple CRUD examples

// Movies
app.get('/movies', async (req, res) => {
  const movies = await prisma.movie.findMany({
    include: { sessions: true }
  });
  res.json(movies);
});

app.post('/movies', async (req, res) => {
  const { title, synopsis, duration, rating } = req.body;
  const movie = await prisma.movie.create({ data: { title, synopsis, duration, rating }});
  res.status(201).json(movie);
});

// Cinemas & halls
app.get('/cinemas', async (req, res) => {
  const cinemas = await prisma.cinema.findMany({ include: { halls: true }});
  res.json(cinemas);
});

app.post('/cinemas', async (req, res) => {
  const { name, city } = req.body;
  const cinema = await prisma.cinema.create({ data: { name, city }});
  res.status(201).json(cinema);
});

// Sessions (movie showings)
app.get('/sessions', async (req, res) => {
  const sessions = await prisma.session.findMany({ include: { movie: true, hall: true }});
  res.json(sessions);
});

app.post('/sessions', async (req, res) => {
  const { movieId, hallId, startsAt, price } = req.body;
  const session = await prisma.session.create({ data: { movieId, hallId, startsAt: new Date(startsAt), price }});
  res.status(201).json(session);
});

// Ticket purchase (very basic, should be wrapped in transaction)
app.post('/purchase', async (req, res) => {
  const { userId, sessionId, seatId } = req.body;
  try {
    const existing = await prisma.ticket.findUnique({
      where: { sessionId_seatId: { sessionId, seatId } }
    }).catch(() => null);

    if (existing) return res.status(409).json({ error: 'Seat already booked for this session' });

    const session = await prisma.session.findUnique({ where: { id: sessionId }});
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        sessionId,
        seatId,
        price: session.price
      }
    });
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>🎬 CineTicket Backend</h1>
    <p>🚧 Em desenvolvimento — versão beta</p>
    <p>Rotas disponíveis:</p>
    <ul>
      <li><a href="/health">/health</a> – verificar status do servidor</li>
      <li><a href="/movies">/movies</a> – listar filmes</li>
      <li><a href="/cinemas">/cinemas</a> – listar cinemas</li>
      <li><a href="/sessions">/sessions</a> – listar sessões</li>
    </ul>
  `);
});

app.listen(PORT, () => {
  console.log(`CineTicket backend running on http://localhost:${PORT}`);
});
