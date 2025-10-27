import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function Filmes() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showTMDBResults, setShowTMDBResults] = useState(false);
  const [tmdbResults, setTmdbResults] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Iniciando carregamento de dados...');
        
        // Carregar filmes primeiro
        const moviesData = await api.getMovies();
        console.log('Filmes carregados:', moviesData);
        setMovies(moviesData);
        setFilteredMovies(moviesData);
        
        // Carregar gêneros separadamente (não é crítico)
        try {
          const genresData = await api.getTMDBGenres();
          setGenres(genresData.genres || []);
        } catch (genresError) {
          console.warn('Erro ao carregar gêneros:', genresError);
          setGenres([]);
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Se não conseguir carregar filmes, mostrar lista vazia
        setMovies([]);
        setFilteredMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = movies;

    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.synopsis?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(movie => {
        if (movie.genres) {
          // Gêneros estão armazenados como string simples (ex: "Terror, Suspense")
          const movieGenres = movie.genres.split(', ').map(genre => genre.trim());
          return movieGenres.some(genre => genre.toLowerCase().includes(selectedGenre.toLowerCase()));
        }
        return false;
      });
    }

    setFilteredMovies(filtered);
  }, [movies, searchQuery, selectedGenre]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const results = await api.searchTMDBMovies(searchQuery);
      setTmdbResults(results.results || []);
      setShowTMDBResults(true);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 4l2 4h-7l-2-4h7zM4 4l2 4H2l2-4zm2 16l-2-4h7l2 4H6zm14-4l2-4h-7l-2 4h7z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>CineTicket</h1>
            </div>
            
            {/* Location Selector */}
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="text-blue-600 font-medium text-sm">São Paulo</span>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            
            <nav className="hidden lg:flex space-x-8">
              <button
                onClick={() => router.push("/filmes")}
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium underline underline-offset-4"
              >
                Filmes
              </button>
              <button
                onClick={() => router.push("/eventos")}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Eventos
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Olá, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors font-medium"
              >
                Entrar
              </button>
            )}
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Todos os Filmes</h2>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar filmes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os gêneros</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('');
                setShowTMDBResults(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* TMDB Search Results */}
        {showTMDBResults && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Resultados da busca: "{searchQuery}"
              </h3>
              <button
                onClick={() => setShowTMDBResults(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Fechar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tmdbResults.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                >
                  <div className="relative">
                    <div className="aspect-w-2 aspect-h-3">
                      <img
                        src={movie.poster_path 
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : 'https://via.placeholder.com/300x450?text=Poster'
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x450?text=Poster';
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                      ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-2">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {movie.overview}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                      <span>{movie.adult ? '18+' : 'L'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local Movies */}
        {!showTMDBResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Carregando filmes...</p>
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600 mb-4">Nenhum filme encontrado.</p>
                <p className="text-sm text-gray-500">
                  Use a busca para encontrar filmes no TMDB ou clique em "Sincronizar Filmes Populares" para adicionar filmes ao catálogo.
                </p>
              </div>
            ) : (
              filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group h-full flex flex-col"
                >
                  <div className="relative">
                    <div className="aspect-w-2 aspect-h-3">
                      <img
                        src={movie.posterPath 
                          ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                          : 'https://via.placeholder.com/300x450?text=Poster'
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x450?text=Poster';
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                      {movie.voteAverage ? `⭐ ${movie.voteAverage.toFixed(1)}` : movie.rating}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {movie.title}
                      </h3>
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        {movie.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                      {movie.synopsis || movie.overview}
                    </p>
                    {movie.genres && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {movie.genres.split(', ').map((genre, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {genre.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}min</span>
                      <span>{movie.releaseDate?.split('T')[0] || movie.releaseDate?.split('-')[0] || 'N/A'}</span>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {movie.sessions && movie.sessions.length > 0 ? 'Sessões disponíveis' : 'Verificar sessões'}
                      </div>
                      <button
                        onClick={() => router.push(`/sessoes/${movie.id}`)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span>Ver Sessões</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
