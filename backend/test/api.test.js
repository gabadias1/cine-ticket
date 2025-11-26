const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Setup Express app para testes
const app = express();
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('../src/routes/auth.routes');
const movieRoutes = require('../src/routes/movies.routes');
const eventRoutes = require('../src/routes/events.routes');
const cinemaRoutes = require('../src/routes/cinemas.routes');
const sessionRoutes = require('../src/routes/sessions.routes');

// Use Routes
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/events', eventRoutes);
app.use('/cinemas', cinemaRoutes);
app.use('/sessions', sessionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

describe('API Básica - Testes de Saúde', () => {
  test('GET /health deve retornar status 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });

  test('GET /cinemas deve retornar lista (vazia ou não)', async () => {
    const response = await request(app)
      .get('/cinemas')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /movies deve retornar lista (vazia ou não)', async () => {
    const response = await request(app)
      .get('/movies')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /events deve retornar lista (vazia ou não)', async () => {
    const response = await request(app)
      .get('/events')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /sessions deve retornar lista (vazia ou não)', async () => {
    const response = await request(app)
      .get('/sessions')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });
});
