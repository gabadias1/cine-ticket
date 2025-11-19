import { useState, useEffect, useCallback, useMemo } from "react";
import LocationSelector from "../components/LocationSelector";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [bannerMovies, setBannerMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState(tab || "emCartaz");

  const filterFutureMovies = useCallback((movies) => {
    const today = new Date();
    return movies.filter(movie => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate > today;
    });
  }, []);

  const loadUpcomingMovies = useCallback(async (pages = 3) => {
    try {
      const allMovies = [];
      
      for (let page = 1; page <= pages; page++) {
        const upcomingData = await api.getTMDBUpcoming(page);
        allMovies.push(...(upcomingData.results || []));
        
        if (page < pages) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      return filterFutureMovies(allMovies);
    } catch (error) {
      console.error('Erro ao carregar filmes em breve:', error);
      return [];
    }
  }, [filterFutureMovies]);

  const loadBannerMovies = useCallback(async () => {
    try {
      //Busca os filmes em alta da semana
      const trendingResponse = await api.getTMDBTrending(1, 'week');
      //Pega os 3 primeiros
      const top3Movies = trendingResponse.results.slice(0, 3);
      //Busca detalhes de cada um 
      const bannerMovies = [];
      for (const movie of top3Movies) {
        try {
          const movieData = await api.getTMDBMovieDetails(movie.id);
          bannerMovies.push(movieData);
        } catch (error) {
          console.error(`Erro ao buscar detalhes do filme ${movie.id}:`, error);
        }
      }
      
      return bannerMovies;
    } catch (error) {
      console.error('Erro ao carregar filmes do banner:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [localMovies, sessionsData, trendingData, nowPlayingData, featuredData] = await Promise.all([
          api.getMovies(),
          api.getSessions(),
          api.getTMDBTrending(1, 'week'),
          api.getTMDBNowPlaying(1),
          api.getTMDBFeatured()
        ]);
        
        setMovies(localMovies);
        setSessions(sessionsData);
        setFeaturedMovies(featuredData.results || []);
        setTrendingMovies(trendingData.results || []);
        setNowPlayingMovies(nowPlayingData.results || []);
        
        const [futureMovies, bannerMoviesData] = await Promise.all([
          loadUpcomingMovies(3),
          loadBannerMovies()
        ]);
        
        setUpcomingMovies(futureMovies);
        setBannerMovies(bannerMoviesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMovies([]);
        setUpcomingMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadUpcomingMovies, loadBannerMovies]);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const sliderSettings = useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  }), []);

  const tabs = useMemo(() => [
    { id: "emCartaz", label: "Em Cartaz" },
    { id: "destaques", label: "Destaques" },
    { id: "emBreve", label: "Em Breve" },
  ], []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button onClick={() => router.push("/")} className="flex items-center space-x-3 h-10">
              <img src="/images/logo.png" alt="CineTicket" className="h-full w-auto object-contain" />
            </button>
            
            {/* Location Selector */}
            <LocationSelector />
            
            <nav className="hidden lg:flex space-x-8">
              <button
                onClick={() => router.push("/filmes")}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
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
            <button
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => router.push({ pathname: '/filmes', query: { focusSearch: '1' } })}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 hidden sm:inline text-sm font-medium">Olá, {user.name}</span>
                <button
                  onClick={() => router.push("/perfil")}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  title="Meu Perfil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Perfil</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  title="Sair"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sair</span>
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
          </div>
        </div>
      </header>

      {/* Featured Carousel */}
      {bannerMovies.length > 0 && (
        <div className="relative bg-white">
          <Slider {...sliderSettings}>
            {bannerMovies.map((movie) => (
              <div key={movie.id} className="relative">
                <div className="w-full h-[600px] relative overflow-hidden">
                  <img
                    src={movie.backdrop_path 
                      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
                      : movie.poster_path 
                        ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
                        : 'https://via.placeholder.com/1200x600?text=Filme+em+Destaque'
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/1200x600?text=Filme+em+Destaque';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-red-900/40 to-transparent"></div>
                  
                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-8 w-full">
                      <div className="max-w-2xl">
                        
                        <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                          {movie.title}
                        </h2>
                        
                        <div className="flex items-center space-x-4 mb-4 text-white">
                          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                            Cinema
                          </span>
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {movie.adult ? '18+' : 'L'}
                          </span>
                          <span className="text-white/80">
                            {movie.runtime ? `${Math.floor(movie.runtime / 60)}h${movie.runtime % 60}m` : 'N/A'}
                          </span>
                          <span className="text-white/80">
                            {movie.genres && movie.genres.length > 0 
                              ? movie.genres.slice(0, 2).map(g => g.name).join(', ')
                              : 'N/A'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => {
                              const localMovie = movies.find(m => m.tmdbId === movie.id);
                              if (localMovie) {
                                router.push(`/sessoes/${localMovie.id}`);
                              } else {
                                alert('Este filme ainda não está disponível para compra.');
                              }
                            }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
                          >
                            Ingressos
                          </button>
                          <button className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-colors">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Em Alta Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Em Alta</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando filmes...</p>
            </div>
          ) : trendingMovies.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum filme em alta encontrado</h3>
              <p className="text-gray-600 mb-6">Atualize a página para ver os filmes em alta</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingMovies.slice(0, 8).map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group h-full flex flex-col"
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
                      {movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : 'N/A'}
                    </div>
                    <div className="absolute top-2 left-2 bg-red-500 text-xs font-bold px-2 py-1 rounded-full text-white">
                      Em Alta
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                        {movie.title}
                      </h3>
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                        {movie.adult ? '18+' : 'L'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-grow">
                      {movie.overview}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                      <span>{movie.original_language?.toUpperCase() || 'N/A'}</span>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center text-xs text-gray-500">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Trending
                      </div>
                      <button
                        onClick={() => {
                          const localMovie = movies.find(m => m.tmdbId === movie.id);
                          if (localMovie) {
                            router.push(`/sessoes/${localMovie.id}`);
                          } else {
                            alert('Este filme ainda não está disponível para compra.');
                          }
                        }}
                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-xs"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                        <span>Ver Sessões</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Em Cartaz Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Em Cartaz</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando filmes...</p>
            </div>
          ) : nowPlayingMovies.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum filme em cartaz</h3>
              <p className="text-gray-600 mb-6">Atualize a página para ver os filmes em cartaz</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {nowPlayingMovies.slice(0, 8).map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group h-full flex flex-col"
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
                      {movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : 'N/A'}
                    </div>
                    <div className="absolute top-2 left-2 bg-green-500 text-xs font-bold px-2 py-1 rounded-full text-white">
                      Em Cartaz
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                        {movie.title}
                      </h3>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        {movie.adult ? '18+' : 'L'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-grow">
                      {movie.overview}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                      <span>{movie.original_language?.toUpperCase() || 'N/A'}</span>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center text-xs text-gray-500">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Em cartaz
                      </div>
                      <button
                        onClick={() => {
                          const localMovie = movies.find(m => m.tmdbId === movie.id);
                          if (localMovie) {
                            router.push(`/sessoes/${localMovie.id}`);
                          } else {
                            alert('Este filme ainda não está disponível para compra.');
                          }
                        }}
                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-xs"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                        <span>Ver Sessões</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Em Breve Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Em Breve</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando filmes em breve...</p>
            </div>
          ) : upcomingMovies.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum filme em breve encontrado</h3>
              <p className="text-gray-600 mb-6">Atualize a lista para ver os próximos lançamentos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {upcomingMovies.slice(0, 8).map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group h-full flex flex-col"
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
                    <div className="absolute top-2 right-2 bg-green-400 text-xs font-bold px-2 py-1 rounded-full">
                      {movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : 'Em Breve'}
                    </div>
                    <div className="absolute top-2 left-2 bg-red-500 text-xs font-bold px-2 py-1 rounded-full text-white">
                      Em Breve
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {movie.title}
                      </h3>
                      <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                        {movie.adult ? '18+' : 'L'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                      {movie.overview}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="text-green-600 font-semibold">
                        {movie.release_date ? new Date(movie.release_date).toLocaleDateString('pt-BR') : 'Em breve'}
                      </span>
                      <span className="text-gray-500">
                        {movie.original_language?.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Em Breve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">PUBLICIDADE</p>
        </div>
      </footer>
    </div>
  );
}
