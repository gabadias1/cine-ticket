import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Ticket, Calendar, Clock, MapPin, LogOut, Film, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Perfil() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [abaSelecionada, setAbaSelecionada] = useState('ingressos');
  const [carregando, setCarregando] = useState(true);
  const [ingressos, setIngressos] = useState([]);
  const [ingressosEventos, setIngressosEventos] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const { tab } = router.query;
    if (tab) setAbaSelecionada(tab);

    carregarIngressos();
  }, [user, router.query]);

  const carregarIngressos = async () => {
    if (!user) return;

    setCarregando(true);
    setErro('');

    try {
      const [ticketsData, eventTicketsData] = await Promise.all([
        api.getUserTickets(user.id),
        api.getUserEventTickets(user.id)
      ]);

      setIngressos(ticketsData || []);
      setIngressosEventos(eventTicketsData || []);
    } catch (erro) {
      setErro('Erro ao carregar ingressos: ' + erro.message);
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatarData = (data) => {
    if (!data) return 'Data não disponível';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TicketCard = ({ type, data }) => {
    const isMovie = type === 'movie';
    const title = isMovie ? data.session?.movie?.title : data.event?.title;
    const date = isMovie ? data.session?.startsAt : data.event?.date;
    const price = data.price;
    const seat = isMovie ? `${data.seat?.row}-${data.seat?.number}` : data.ticketType;
    const image = isMovie
      ? (data.session?.movie?.posterPath || data.session?.movie?.imageUrl)
      : (data.event?.imageUrl || data.event?.bannerUrl);

    // Fix image URL if needed
    const imageUrl = image?.startsWith('http')
      ? image
      : image ? `https://image.tmdb.org/t/p/w500${image.startsWith('/') ? image : '/' + image}` : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors group"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="w-full md:w-48 h-48 md:h-auto relative">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                {isMovie ? <Film className="w-12 h-12 text-gray-600" /> : <Music className="w-12 h-12 text-gray-600" />}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent md:bg-gradient-to-r" />
          </div>

          {/* Content Section */}
          <div className="p-6 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg mb-2 inline-block ${isMovie ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {isMovie ? 'CINEMA' : 'EVENTO'}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1">{title || 'Título Indisponível'}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${data.status === 'ACTIVE'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                  {data.status === 'ACTIVE' ? 'ATIVO' : data.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{date ? new Date(date).toLocaleDateString('pt-BR') : 'Data N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{date ? new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hora N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  <span>{seat || 'Assento N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Comprado em {formatarData(data.createdAt)}
              </div>
              <div className="text-xl font-bold text-white">
                R$ {price?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout title="Meu Perfil - CineTicket">
      <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto min-h-screen">

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Olá, {user?.name}</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setAbaSelecionada('ingressos')}
            className={`pb-4 px-4 font-medium transition-all relative ${abaSelecionada === 'ingressos'
                ? 'text-primary'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Ingressos de Cinema
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{ingressos.length}</span>
            {abaSelecionada === 'ingressos' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setAbaSelecionada('eventos')}
            className={`pb-4 px-4 font-medium transition-all relative ${abaSelecionada === 'eventos'
                ? 'text-primary'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Ingressos de Eventos
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{ingressosEventos.length}</span>
            {abaSelecionada === 'eventos' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {erro && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-8"
            >
              {erro}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="space-y-6">
          {carregando ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {abaSelecionada === 'ingressos' ? (
                ingressos.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Film className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum ingresso encontrado</h3>
                    <p className="text-gray-400 mb-6">Você ainda não comprou ingressos de cinema.</p>
                    <Button onClick={() => router.push('/filmes')}>
                      Explorar Filmes
                    </Button>
                  </div>
                ) : (
                  ingressos.map((ingresso) => (
                    <TicketCard key={ingresso.id} type="movie" data={ingresso} />
                  ))
                )
              ) : (
                ingressosEventos.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum evento encontrado</h3>
                    <p className="text-gray-400 mb-6">Você ainda não comprou ingressos para eventos.</p>
                    <Button onClick={() => router.push('/eventos')}>
                      Explorar Eventos
                    </Button>
                  </div>
                ) : (
                  ingressosEventos.map((ingresso) => (
                    <TicketCard key={ingresso.id} type="event" data={ingresso} />
                  ))
                )
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
