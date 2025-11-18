require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');
const tmdbService = require('./tmdbService');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://frontend:3000',
    'http://frontend-1:3000'
  ],
  credentials: true
}));

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => res.json({ ok: true }));

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name },
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  }
  
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    const user = await prisma.user.create({
      data: { name, email, password }
    });
    
    res.status(201).json({ 
      user: { id: user.id, email: user.email, name: user.name },
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/movies', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      include: { sessions: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(movies);
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes' });
  }
});

app.post('/movies', async (req, res) => {
  const { title, synopsis, duration, rating } = req.body;
  
  if (!title || !synopsis || !duration || !rating) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  try {
    const movie = await prisma.movie.create({ 
      data: { title, synopsis, duration: parseInt(duration), rating }
    });
    res.status(201).json(movie);
  } catch (error) {
    console.error('Erro ao criar filme:', error);
    res.status(500).json({ error: 'Erro ao criar filme' });
  }
});

app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const movieId = parseInt(id);
  
  if (isNaN(movieId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  try {
    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({
        where: { movieId }
      });
      
      await tx.movie.delete({
        where: { id: movieId }
      });
    });
    
    res.json({ message: 'Filme deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar filme:', error);
    res.status(500).json({ error: 'Erro ao deletar filme' });
  }
});

const validatePage = (page) => {
  const pageNum = parseInt(page);
  return !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
};

app.get('/tmdb/popular', async (req, res) => {
  try {
    const page = validatePage(req.query.page);
    const data = await tmdbService.getPopularMovies(page);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar filmes populares:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes populares' });
  }
});

app.get('/tmdb/now-playing', async (req, res) => {
  try {
    const page = validatePage(req.query.page);
    const data = await tmdbService.getNowPlayingMovies(page);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar filmes em cartaz:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes em cartaz' });
  }
});

app.get('/tmdb/upcoming', async (req, res) => {
  try {
    const page = validatePage(req.query.page);
    const data = await tmdbService.getUpcomingMovies(page);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar filmes em breve:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes em breve' });
  }
});

app.get('/tmdb/top-rated', async (req, res) => {
  try {
    const page = validatePage(req.query.page);
    const data = await tmdbService.getTopRatedMovies(page);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar filmes melhor avaliados:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes melhor avaliados' });
  }
});

app.get('/tmdb/trending', async (req, res) => {
  try {
    const page = validatePage(req.query.page);
    const timeWindow = req.query.time_window || 'week';
    const data = await tmdbService.getTrendingMovies(timeWindow, page);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar filmes em alta:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes em alta' });
  }
});

app.get('/tmdb/featured', async (req, res) => {
  try {
    const data = await tmdbService.getFeaturedMovies();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar filmes em destaque:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes em destaque' });
  }
});

app.get('/tmdb/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
    }
    const pageNum = validatePage(page);
    const data = await tmdbService.searchMovies(query.trim(), pageNum);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes' });
  }
});

app.get('/tmdb/genres', async (req, res) => {
  try {
    const data = await tmdbService.getGenres();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    res.status(500).json({ error: 'Erro ao buscar gêneros' });
  }
});

app.get('/tmdb/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movieId = parseInt(id);
    
    if (isNaN(movieId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const data = await tmdbService.getMovieDetails(movieId);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do filme' });
  }
});

app.post('/movies/sync-tmdb', async (req, res) => {
  const { tmdbId } = req.body;
  
  if (!tmdbId) {
    return res.status(400).json({ error: 'tmdbId é obrigatório' });
  }
  
  const movieId = parseInt(tmdbId);
  if (isNaN(movieId)) {
    return res.status(400).json({ error: 'tmdbId deve ser um número válido' });
  }
  
  try {
    const existingMovie = await prisma.movie.findUnique({
      where: { tmdbId: movieId }
    });

    if (existingMovie) {
      return res.status(409).json({ 
        error: 'Filme já existe no banco de dados',
        movie: existingMovie 
      });
    }

    const tmdbMovie = await tmdbService.getMovieDetails(movieId);
    const movieData = tmdbService.convertTMDBMovieToLocal(tmdbMovie);
    
    const movie = await prisma.movie.create({
      data: movieData
    });

    res.status(201).json({
      message: 'Filme sincronizado com sucesso',
      movie
    });
  } catch (error) {
    console.error('Erro ao sincronizar filme:', error);
    res.status(500).json({ error: 'Erro ao sincronizar filme' });
  }
});

app.post('/movies/sync-popular', async (req, res) => {
  const { limit = 20 } = req.body;
  const maxLimit = Math.min(parseInt(limit) || 20, 50);
  
  try {
    const popularMovies = await tmdbService.getPopularMovies(1);
    const moviesToSync = popularMovies.results.slice(0, maxLimit);
    
    const syncedMovies = [];
    const errors = [];

    const processMovie = async (tmdbMovie) => {
      try {
        const existing = await prisma.movie.findUnique({
          where: { tmdbId: tmdbMovie.id }
        });

        if (existing) {
          return { ...existing, status: 'already_exists' };
        }

        const details = await tmdbService.getMovieDetails(tmdbMovie.id);
        const movieData = tmdbService.convertTMDBMovieToLocal(details);
        
        const movie = await prisma.movie.create({
          data: movieData
        });

        return { ...movie, status: 'created' };
      } catch (error) {
        console.error(`Erro ao sincronizar filme ${tmdbMovie.id}:`, error);
        throw { tmdbId: tmdbMovie.id, error: error.message };
      }
    };

    for (const tmdbMovie of moviesToSync) {
      try {
        const result = await processMovie(tmdbMovie);
        syncedMovies.push(result);
      } catch (error) {
        errors.push(error);
      }
    }

    res.json({
      message: `Sincronização concluída. ${syncedMovies.length} filmes processados.`,
      synced: syncedMovies,
      errors: errors
    });
  } catch (error) {
    console.error('Erro ao sincronizar filmes populares:', error);
    res.status(500).json({ error: 'Erro ao sincronizar filmes populares' });
  }
});

app.post('/movies/sync-now-playing', async (req, res) => {
  const { limit = 15 } = req.body;
  const maxLimit = Math.min(parseInt(limit) || 15, 30);
  
  try {
    const nowPlayingMovies = await tmdbService.getNowPlayingMovies(1);
    const moviesToSync = nowPlayingMovies.results.slice(0, maxLimit);
    
    const syncedMovies = [];
    const errors = [];

    const processMovie = async (tmdbMovie) => {
      try {
        const existing = await prisma.movie.findUnique({
          where: { tmdbId: tmdbMovie.id }
        });

        if (existing) {
          return { ...existing, status: 'already_exists' };
        }

        const details = await tmdbService.getMovieDetails(tmdbMovie.id);
        const movieData = tmdbService.convertTMDBMovieToLocal(details);
        
        const movie = await prisma.movie.create({
          data: movieData
        });

        return { ...movie, status: 'created' };
      } catch (error) {
        console.error(`Erro ao sincronizar filme ${tmdbMovie.id}:`, error);
        throw { tmdbId: tmdbMovie.id, error: error.message };
      }
    };

    for (const tmdbMovie of moviesToSync) {
      try {
        const result = await processMovie(tmdbMovie);
        syncedMovies.push(result);
      } catch (error) {
        errors.push(error);
      }
    }

    res.json({
      message: `Sincronização concluída. ${syncedMovies.length} filmes processados.`,
      synced: syncedMovies,
      errors: errors
    });
  } catch (error) {
    console.error('Erro ao sincronizar filmes em cartaz:', error);
    res.status(500).json({ error: 'Erro ao sincronizar filmes em cartaz' });
  }
});

app.get('/cinemas', async (req, res) => {
  try {
    const cinemas = await prisma.cinema.findMany({ 
      include: { halls: true },
      orderBy: { name: 'asc' }
    });
    res.json(cinemas);
  } catch (error) {
    console.error('Erro ao buscar cinemas:', error);
    res.status(500).json({ error: 'Erro ao buscar cinemas' });
  }
});

app.post('/cinemas', async (req, res) => {
  const { name, city } = req.body;
  
  if (!name || !city) {
    return res.status(400).json({ error: 'Nome e cidade são obrigatórios' });
  }
  
  try {
    const cinema = await prisma.cinema.create({ 
      data: { name, city }
    });
    res.status(201).json(cinema);
  } catch (error) {
    console.error('Erro ao criar cinema:', error);
    res.status(500).json({ error: 'Erro ao criar cinema' });
  }
});

// Events endpoints
app.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { tickets: true }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

app.post('/events', async (req, res) => {
  const { title, description, date, price, location, address, city, state, capacity, category } = req.body;
  
  if (!title || !date || !price || !location) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }
  
  try {
    const event = await prisma.event.create({
      data: {
        title,
        description: description || '',
        date: new Date(date),
        price: parseFloat(price),
        location,
        address: address || '',
        city: city || '',
        state: state || '',
        capacity: parseInt(capacity) || 100,
        category: category || 'Geral'
      }
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

app.get('/sessions', async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({ 
      include: { movie: true, hall: true },
      orderBy: { startsAt: 'asc' }
    });
    res.json(sessions);
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({ error: 'Erro ao buscar sessões' });
  }
});

app.post('/sessions', async (req, res) => {
  const { movieId, hallId, startsAt, price } = req.body;
  
  if (!movieId || !hallId || !startsAt || !price) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  try {
    const session = await prisma.session.create({ 
      data: { 
        movieId: parseInt(movieId), 
        hallId: parseInt(hallId), 
        startsAt: new Date(startsAt), 
        price: parseFloat(price) 
      }
    });
    res.status(201).json(session);
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro ao criar sessão' });
  }
});

app.post('/sessions/auto-create', async (req, res) => {
  const { movieId } = req.body;
  
  if (!movieId) {
    return res.status(400).json({ error: 'movieId é obrigatório' });
  }
  
  const id = parseInt(movieId);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'movieId deve ser um número válido' });
  }
  
  try {
    const movie = await prisma.movie.findUnique({
      where: { id }
    });

    if (!movie) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    const sessions = [];
    const today = new Date();
    const times = ['14:00', '16:30', '19:00'];
    
    const sessionData = [];
    
    for (let day = 0; day < 7; day++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + day);
      
      for (const time of times) {
        const [hours, minutes] = time.split(':');
        const sessionDateTime = new Date(sessionDate);
        sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        sessionData.push({
          movieId: id,
          hallId: 1,
          startsAt: sessionDateTime,
          price: 25.00
        });
      }
    }

    const createdSessions = await prisma.session.createMany({
      data: sessionData
    });

    res.json({
      message: `Criadas ${createdSessions.count} sessões para o filme ${movie.title}`,
      count: createdSessions.count
    });
  } catch (error) {
    console.error('Erro ao criar sessões automáticas:', error);
    res.status(500).json({ error: 'Erro ao criar sessões automáticas' });
  }
});

app.post('/purchase', async (req, res) => {
  const { userId, sessionId, seatId } = req.body;
  
  if (!userId || !sessionId || !seatId) {
    return res.status(400).json({ error: 'userId, sessionId e seatId são obrigatórios' });
  }
  
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.ticket.findUnique({
        where: { sessionId_seatId: { sessionId, seatId } }
      });

      if (existing) {
        throw new Error('Assento já está ocupado para esta sessão');
      }

      const session = await tx.session.findUnique({ 
        where: { id: sessionId },
        include: { movie: true, hall: true }
      });
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const ticket = await tx.ticket.create({
        data: {
          userId,
          sessionId,
          seatId,
          price: session.price
        },
        include: {
          session: {
            include: {
              movie: true,
              hall: true
            }
          }
        }
      });
      
      res.status(201).json({
        ticket,
        message: 'Ingresso comprado com sucesso'
      });
    });
  } catch (error) {
    console.error('Erro na compra:', error);
    if (error.message === 'Assento já está ocupado para esta sessão' || 
        error.message === 'Sessão não encontrada') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Payment endpoints
app.post('/payment/process', async (req, res) => {
  const { userId, method, totalAmount, paymentData, ticketDetails } = req.body;
  
  if (!userId || !method || !totalAmount || !ticketDetails) {
    return res.status(400).json({ error: 'Dados incompletos para o pagamento' });
  }
  
  if (!['CREDITO', 'DEBITO', 'PIX'].includes(method)) {
    return res.status(400).json({ error: 'Método de pagamento inválido' });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Gerar código PIX aleatório se for PIX
    let pixCode = null;
    if (method === 'PIX') {
      pixCode = 'PIX-' + Math.random().toString(36).substring(2, 15).toUpperCase();
    }
    
    // Salvar pagamento
    const payment = await prisma.payment.create({
      data: {
        userId: parseInt(userId),
        method,
        totalAmount,
        status: 'COMPLETED',
        paymentData: JSON.stringify(paymentData || {}),
        pixCode,
        ticketDetails: JSON.stringify(ticketDetails)
      }
    });
    
    // Parsear detalhes dos ingressos e criar tickets
    const tickets = [];
    try {
      const ticketsData = Array.isArray(ticketDetails) ? ticketDetails : JSON.parse(ticketDetails);
      
      for (const ticketData of ticketsData) {
        const ticket = await prisma.ticket.create({
          data: {
            userId: parseInt(userId),
            sessionId: parseInt(ticketData.sessionId),
            seatId: parseInt(ticketData.seatId),
            price: parseFloat(ticketData.price)
          }
        });
        tickets.push(ticket);
      }
    } catch (error) {
      console.error('Erro ao criar tickets:', error);
    }
    
    res.status(201).json({
      message: 'Pagamento processado com sucesso',
      payment: {
        id: payment.id,
        method: payment.method,
        status: payment.status,
        pixCode: payment.pixCode,
        totalAmount: payment.totalAmount
      },
      tickets
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

app.get('/user/:userId/tickets', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: parseInt(userId) },
      include: {
        session: {
          include: {
            movie: true,
            hall: true
          }
        },
        seat: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar ingressos:', error);
    res.status(500).json({ error: 'Erro ao buscar ingressos' });
  }
});

app.get('/user/:userId/event-tickets', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const eventTickets = await prisma.eventTicket.findMany({
      where: { userId: parseInt(userId) },
      include: {
        event: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(eventTickets);
  } catch (error) {
    console.error('Erro ao buscar ingressos de eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar ingressos de eventos' });
  }
});

app.post('/purchase-event', async (req, res) => {
  const { userId, eventId, price, ticketType, seatNumber } = req.body;
  
  if (!userId || !eventId || !price || !ticketType) {
    return res.status(400).json({ error: 'Dados incompletos para compra' });
  }
  
  try {
    const eventTicket = await prisma.eventTicket.create({
      data: {
        userId: parseInt(userId),
        eventId: parseInt(eventId),
        price: parseFloat(price),
        ticketType,
        seatNumber: seatNumber || null
      }
    });
    
    res.status(201).json({
      message: 'Ingresso de evento criado com sucesso',
      eventTicket
    });
  } catch (error) {
    console.error('Erro ao criar ingresso de evento:', error);
    res.status(500).json({ error: 'Erro ao criar ingresso de evento' });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: '🎬 CineTicket Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        'POST /auth/login': 'Login de usuário',
        'POST /auth/register': 'Registro de usuário'
      },
      movies: {
        'GET /movies': 'Listar filmes',
        'POST /movies': 'Criar filme',
        'POST /movies/sync-tmdb': 'Sincronizar filme do TMDB',
        'POST /movies/sync-popular': 'Sincronizar filmes populares'
      },
      tmdb: {
        'GET /tmdb/popular': 'Filmes populares do TMDB',
        'GET /tmdb/now-playing': 'Filmes em cartaz do TMDB',
        'GET /tmdb/search': 'Buscar filmes no TMDB',
        'GET /tmdb/genres': 'Gêneros do TMDB',
        'GET /tmdb/movie/:id': 'Detalhes do filme no TMDB'
      },
      cinemas: {
        'GET /cinemas': 'Listar cinemas',
        'POST /cinemas': 'Criar cinema'
      },
      sessions: {
        'GET /sessions': 'Listar sessões',
        'POST /sessions': 'Criar sessão'
      },
      tickets: {
        'POST /purchase': 'Comprar ingresso'
      },
      health: {
        'GET /health': 'Status do servidor'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`CineTicket backend running on http://localhost:${PORT}`);
});
