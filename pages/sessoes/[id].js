import { useState, useEffect, useCallback, useMemo } from 'react';
import LocationSelector from "../../components/LocationSelector";
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export default function SelecaoSessoes() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  


  const dates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();
      const month = date.getMonth() + 1;
      
      dates.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? `HOJE ${dayNumber}/${month.toString().padStart(2, '0')}` : `${dayName} ${dayNumber}/${month.toString().padStart(2, '0')}`,
        isToday: i === 0
      });
    }
    
    return dates;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar dados do filme e sessões
        const [movieData, sessionsData, cinemasData] = await Promise.all([
          api.getMovies().then(movies => movies.find(m => m.id === parseInt(id))),
          api.getSessions(),
          api.getCinemas()
        ]);

        if (!movieData) {
          router.push('/filmes');
          return;
        }

        setMovie(movieData);
        setSessions(sessionsData);
        setCinemas(cinemasData);
        
        // Definir data padrão como hoje
        setSelectedDate(dates[0].date);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // Filtrar sessões baseado na data, cinema e filtros selecionados
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startsAt).toISOString().split('T')[0];
    const matchesDate = !selectedDate || sessionDate === selectedDate;
    const matchesCinema = !selectedCinema || session.hallId.toString() === selectedCinema;
    
    // Aqui você pode adicionar lógica para filtros específicos
    // Por enquanto, vamos apenas filtrar por data e cinema
    
    return matchesDate && matchesCinema && session.movieId === parseInt(id);
  });

  // Agrupar sessões por cinema
  const sessionsByCinema = filteredSessions.reduce((acc, session) => {
    const cinemaId = session.hallId;
    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        cinema: cinemas.find(c => c.id === cinemaId) || { name: 'Cinema', address: 'Endereço' },
        sessions: []
      };
    }
    acc[cinemaId].sessions.push(session);
    return acc;
  }, {});

  const formatTime = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando sessões...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Filme não encontrado</h2>
          <button
            onClick={() => router.push('/filmes')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar aos Filmes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button onClick={() => router.push("/")} className="flex items-center space-x-3 h-10">
              <img src="/images/logo.png" alt="CineTicket" className="h-full w-auto object-contain" />
            </button>
            
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
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Olá, {user.name}</span>
                <button
                  onClick={() => router.push("/login")}
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
          </div>
        </div>
      </header>

      {/* Movie Info */}
      <div className="bg-white shadow-md py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-6">
            <img
              src={movie.posterPath 
                ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
                : 'https://via.placeholder.com/200x300?text=Poster'
              }
              alt={movie.title}
              className="w-32 h-48 object-cover rounded-lg shadow-lg"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{movie.title}</h2>
              <p className="text-gray-600 mb-2">{movie.synopsis}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}min</span>
                <span>{movie.rating}</span>
                <span>{movie.releaseDate?.split('T')[0] || 'Em breve'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button className="py-4 px-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600">
              Sessões
            </button>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {dates.map((dateObj) => (
              <button
                key={dateObj.date}
                onClick={() => setSelectedDate(dateObj.date)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDate === dateObj.date
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {dateObj.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      

      {/* Sessions List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {Object.keys(sessionsByCinema).length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma sessão encontrada</h3>
            <p className="text-gray-600 mb-6">Não há sessões disponíveis para a data selecionada</p>
            <button
              onClick={() => setSelectedDate(dates[0].date)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Sessões de Hoje
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(sessionsByCinema).map(([cinemaId, cinemaData]) => (
              <div key={cinemaId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{cinemaData.cinema.name}</h3>
                        <p className="text-gray-600">{cinemaData.cinema.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {cinemaData.sessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1">
                            {['LASER', 'DUBLADO', 'VIP', 'DOLBY ATMOS'].map((feature) => (
                              <span
                                key={feature}
                                className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => router.push(`/assentos/${session.id}`)}
                            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                          >
                            {formatTime(session.startsAt)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
