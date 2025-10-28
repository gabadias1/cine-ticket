const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:3001';
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getBaseURL();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Movies endpoints
  async getMovies() {
    return this.request('/movies');
  }

  async createMovie(movieData) {
    return this.request('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  // Cinemas endpoints
  async getCinemas() {
    return this.request('/cinemas');
  }

  async createCinema(cinemaData) {
    return this.request('/cinemas', {
      method: 'POST',
      body: JSON.stringify(cinemaData),
    });
  }

  // Sessions endpoints
  async getSessions() {
    return this.request('/sessions');
  }

  async createSession(sessionData) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Tickets endpoints
  async purchaseTicket(userId, sessionId, seatId) {
    return this.request('/purchase', {
      method: 'POST',
      body: JSON.stringify({ userId, sessionId, seatId }),
    });
  }

  // TMDB endpoints
  async getTMDBPopular(page = 1) {
    return this.request(`/tmdb/popular?page=${page}`);
  }

  async getTMDBNowPlaying(page = 1) {
    return this.request(`/tmdb/now-playing?page=${page}`);
  }

  async getTMDBUpcoming(page = 1) {
    return this.request(`/tmdb/upcoming?page=${page}`);
  }

  async getTMDBTopRated(page = 1) {
    return this.request(`/tmdb/top-rated?page=${page}`);
  }

  async getTMDBTrending(page = 1, timeWindow = 'week') {
    return this.request(`/tmdb/trending?page=${page}&time_window=${timeWindow}`);
  }

  async getTMDBFeatured() {
    return this.request('/tmdb/featured');
  }

  async searchTMDBMovies(query, page = 1) {
    return this.request(`/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async getTMDBGenres() {
    return this.request('/tmdb/genres');
  }

  async getTMDBMovieDetails(id) {
    return this.request(`/tmdb/movie/${id}`);
  }

  async syncTMDBMovie(tmdbId) {
    return this.request('/movies/sync-tmdb', {
      method: 'POST',
      body: JSON.stringify({ tmdbId }),
    });
  }

  async syncPopularMovies(limit = 20) {
    return this.request('/movies/sync-popular', {
      method: 'POST',
      body: JSON.stringify({ limit }),
    });
  }

  async syncNowPlayingMovies(limit = 15) {
    return this.request('/movies/sync-now-playing', {
      method: 'POST',
      body: JSON.stringify({ limit }),
    });
  }

  async createAutoSessions(movieId) {
    return this.request('/sessions/auto-create', {
      method: 'POST',
      body: JSON.stringify({ movieId }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
