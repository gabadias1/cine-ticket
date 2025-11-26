import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { Calendar, Clock, MapPin, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [movieIdForSessions, setMovieIdForSessions] = useState(null);

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
        label: i === 0 ? 'HOJE' : dayName,
        subLabel: `${dayNumber}/${month.toString().padStart(2, '0')}`,
        isToday: i === 0
      });
    }

    return dates;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        let localMovie = null;
        const tmdbId = parseInt(id);

        try {
          const allMovies = await api.getMovies();
          const movieByTmdbId = allMovies.find(m => m.tmdbId === tmdbId);
          if (movieByTmdbId) {
            localMovie = movieByTmdbId;
          }
        } catch (searchError) {
          console.warn('Erro ao buscar filmes no banco local:', searchError);
        }

        if (!tmdbId || isNaN(tmdbId)) {
          router.push('/filmes');
          return;
        }

        const [tmdbData, sessionsData, cinemasData] = await Promise.all([
          api.getTMDBMovieDetails(tmdbId),
          api.getSessions(),
          api.getCinemas()
        ]);

        if (!tmdbData) {
          router.push('/filmes');
          return;
        }

        setMovie(tmdbData);

        const movieIdForSessionsValue = localMovie ? localMovie.id : tmdbId;
        setMovieIdForSessions(movieIdForSessionsValue);

        if (localMovie && (!sessionsData || sessionsData.filter(s => s.movieId === localMovie.id).length === 0)) {
          // Se não tem sessões, tentar criar automaticamente
          try {
            const newSessions = await api.createAutoSessions(localMovie.id);
            setSessions(newSessions);
          } catch (e) {
            console.error('Erro ao criar sessões automáticas:', e);
            setSessions(sessionsData || []);
          }
        } else {
          setSessions(sessionsData || []);
        }

        setCinemas(cinemasData || []);
        setSelectedDate(dates[0].date);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        router.push('/filmes');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const filteredSessions = useMemo(() => {
    const movieIdForFilter = movieIdForSessions || parseInt(id);
    const tmdbId = parseInt(id);

    return sessions.filter(session => {
      const sessionDate = new Date(session.startsAt).toISOString().split('T')[0];
      const matchesDate = !selectedDate || sessionDate === selectedDate;
      const matchesCinema = !selectedCinema || session.hallId.toString() === selectedCinema;

      const matchesMovie = session.movieId === movieIdForFilter ||
        session.movieId?.toString() === movieIdForFilter?.toString() ||
        session.movieId === tmdbId ||
        session.movieId?.toString() === tmdbId?.toString();

      return matchesDate && matchesCinema && matchesMovie;
    });
  }, [sessions, selectedDate, selectedCinema, id, movieIdForSessions]);

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
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!movie) return null;

  return (
    <Layout title={`${movie.title} - Sessões`}>
      {/* Hero Section with Backdrop */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-48 rounded-xl shadow-2xl border border-white/10 hidden md:block"
            />
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4"
              >
                {movie.title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6"
              >
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                  {movie.release_date?.split('-')[0]}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                  {movie.adult ? '18+' : 'Livre'}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <Star className="w-3 h-3 fill-current" />
                  {movie.vote_average?.toFixed(1)}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min
                </span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 max-w-2xl line-clamp-3"
              >
                {movie.overview}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Date Selector */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Selecione a Data
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {dates.map((dateObj) => (
              <button
                key={dateObj.date}
                onClick={() => setSelectedDate(dateObj.date)}
                className={`flex flex-col items-center min-w-[100px] p-4 rounded-xl border transition-all ${selectedDate === dateObj.date
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'bg-surface border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                  }`}
              >
                <span className="text-xs font-bold mb-1">{dateObj.label}</span>
                <span className="text-lg font-bold">{dateObj.subLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-8">
          {Object.keys(sessionsByCinema).length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma sessão encontrada</h3>
              <p className="text-gray-400 mb-6">Não há sessões disponíveis para esta data.</p>
              <Button onClick={() => setSelectedDate(dates[0].date)}>
                Ver sessões de hoje
              </Button>
            </div>
          ) : (
            Object.entries(sessionsByCinema).map(([cinemaId, cinemaData]) => (
              <motion.div
                key={cinemaId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{cinemaData.cinema.name}</h3>
                      <p className="text-sm text-gray-400">Shopping Center • Sala Premium</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid gap-4">
                  {cinemaData.sessions.map((session) => (
                    <div key={session.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                      <div className="flex gap-2">
                        {['LEG', 'VIP', 'ATMOS'].map((tag, i) => (
                          <span key={i} className="px-2 py-1 rounded text-xs font-bold bg-white/10 text-gray-300 border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Button
                        onClick={() => {
                          const layout = session.hall?.template?.layout ? 'custom' : '1';
                          const price = session.price || 35.00;

                          const query = {
                            id: session.id,
                            movieId: movie?.id,
                            sessionId: session.id,
                            sessionStartsAt: session.startsAt,
                            layout,
                            eventName: movie.title,
                            eventDate: session.startsAt.split('T')[0],
                            eventTime: formatTime(session.startsAt),
                            basePrice: price
                          };
                          router.push({ pathname: `/assentos/${session.id}`, query });
                        }}
                        className="w-full sm:w-auto min-w-[120px]"
                      >
                        {formatTime(session.startsAt)}
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
