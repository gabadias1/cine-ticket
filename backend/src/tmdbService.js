const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '979f6e8c0d1f3185b797c251ae26ec3c';
    this.accessToken = process.env.TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NzlmNmU4YzBkMWYzMTg1Yjc5N2MyNTFhZTI2ZWMzYyIsIm5iZiI6MTc2MTE2NzM1NC4yOTc5OTk5LCJzdWIiOiI2OGY5NDdmYTlhNjU5MDM3ZjA2YjFhOGEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.6gD85Ct6U2E7lxnqvLy14MI83hsbU8bcS_c07qdbPuM';
    this.baseURL = 'https://api.themoviedb.org/3';
    this.imageBaseURL = 'https://image.tmdb.org/t/p';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getPopularMovies(page = 1) {
    try {
      const response = await this.client.get('/movie/popular', {
        params: { 
          page,
          language: 'pt-BR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes populares');
    }
  }

  async getNowPlayingMovies(page = 1) {
    try {
      const response = await this.client.get('/movie/now_playing', {
        params: { 
          page,
          language: 'pt-BR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes em cartaz:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes em cartaz');
    }
  }

  async getUpcomingMovies(page = 1) {
    try {
      const response = await this.client.get('/movie/upcoming', {
        params: { 
          page,
          language: 'pt-BR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes em breve:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes em breve');
    }
  }

  async getTopRatedMovies(page = 1) {
    try {
      const response = await this.client.get('/movie/top_rated', {
        params: { 
          page,
          language: 'pt-BR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes melhor avaliados:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes melhor avaliados');
    }
  }

  async getTrendingMovies(timeWindow = 'week', page = 1) {
    try {
      const response = await this.client.get(`/trending/movie/${timeWindow}`, {
        params: { 
          page,
          language: 'pt-BR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes em alta:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes em alta');
    }
  }

  async getFeaturedMovies() {
    try {
      const [popular, topRated, trending] = await Promise.all([
        this.getPopularMovies(1),
        this.getTopRatedMovies(1),
        this.getTrendingMovies('week', 1)
      ]);

      const allMovies = [
        ...popular.results,
        ...topRated.results,
        ...trending.results
      ];

      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );

      const featuredMovies = uniqueMovies
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20);

      return {
        results: featuredMovies,
        total_results: featuredMovies.length,
        page: 1,
        total_pages: 1
      };
    } catch (error) {
      console.error('Erro ao buscar filmes em destaque:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes em destaque');
    }
  }

  async getMovieDetails(tmdbId) {
    try {
      let response = await this.client.get(`/movie/${tmdbId}`, {
        params: {
          append_to_response: 'credits,videos,images',
          language: 'pt-BR'
        }
      });
      
      if (!response.data.title || !response.data.overview) {
        const englishResponse = await this.client.get(`/movie/${tmdbId}`, {
          params: {
            append_to_response: 'credits,videos,images',
            language: 'en-US'
          }
        });
        
        response.data.title = response.data.title || englishResponse.data.title;
        response.data.overview = response.data.overview || englishResponse.data.overview;
        response.data.genres = response.data.genres || englishResponse.data.genres;
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error.response?.data || error.message);
      throw new Error('Falha ao buscar detalhes do filme');
    }
  }

  async getMoviesByGenre(genreId, page = 1) {
    try {
      const response = await this.client.get('/discover/movie', {
        params: {
          with_genres: genreId,
          page,
          language: 'pt-BR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes por gênero:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes por gênero');
    }
  }

  async getGenres() {
    try {
      const response = await this.client.get('/genre/movie/list', {
        params: { language: 'pt-BR' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar gêneros:', error.response?.data || error.message);
      throw new Error('Falha ao buscar gêneros');
    }
  }

  async searchMovies(query, page = 1) {
    try {
      const response = await this.client.get('/search/movie', {
        params: { 
          query, 
          page,
          language: 'pt-BR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes');
    }
  }

  getImageURL(path, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  getPosterURL(path) {
    return this.getImageURL(path, 'w500');
  }

  getBackdropURL(path) {
    return this.getImageURL(path, 'w1280');
  }

  convertTMDBMovieToLocal(tmdbMovie) {
    const genres = tmdbMovie.genres?.map((genre) => genre.name).filter(Boolean) || [];

    return {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      synopsis: tmdbMovie.overview,
      duration: tmdbMovie.runtime || 120,
      rating: this.convertRating(tmdbMovie.adult),
      posterPath: tmdbMovie.poster_path,
      backdropPath: tmdbMovie.backdrop_path,
      releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
      voteAverage: tmdbMovie.vote_average,
      voteCount: tmdbMovie.vote_count,
      originalLanguage: tmdbMovie.original_language,
      genres: genres.length ? genres.join(', ') : null
    };
  }

  convertRating(adult) {
    return adult ? '18' : '12';
  }
}

module.exports = new TMDBService();
