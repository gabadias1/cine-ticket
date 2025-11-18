import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900 bg-opacity-95 border-b border-gray-700 py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-red-500 hover:text-red-400 transition"
          >
            🎬 CineTicket
          </button>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400">Bem-vindo,</p>
              <p className="font-bold">{user?.name || 'Usuário'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">👤 Meu Perfil</h1>
          <p className="text-gray-400">Visualize e gerencie seus ingressos</p>
        </div>

        {/* Abas */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setAbaSelecionada('ingressos')}
            className={`pb-4 font-semibold transition ${
              abaSelecionada === 'ingressos'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎫 Ingressos de Cinema ({ingressos.length})
          </button>
          <button
            onClick={() => setAbaSelecionada('eventos')}
            className={`pb-4 font-semibold transition ${
              abaSelecionada === 'eventos'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎭 Ingressos de Eventos ({ingressosEventos.length})
          </button>
        </div>

        {/* Mensagens */}
        {erro && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-8">
            {erro}
          </div>
        )}

        {/* Conteúdo */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          {carregando ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-400">Carregando ingressos...</p>
            </div>
          ) : abaSelecionada === 'ingressos' ? (
            <div>
              {ingressos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">🎬</p>
                  <p className="text-gray-400 mb-6">Você ainda não comprou ingressos de cinema</p>
                  <button
                    onClick={() => router.push('/filmes')}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Ir para Filmes
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ingressos.map((ingresso) => (
                    <div
                      key={ingresso.id}
                      className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-6 hover:border-red-500 transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Filme</p>
                          <p className="font-bold text-lg">
                            {ingresso.session?.movie?.title || 'Filme não disponível'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Sessão</p>
                          <p className="font-semibold">
                            {ingresso.session?.startsAt 
                              ? new Date(ingresso.session.startsAt).toLocaleDateString('pt-BR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })
                              : 'Data não definida'}
                          </p>
                          <p className="text-sm text-gray-300">
                            {ingresso.session?.startsAt
                              ? new Date(ingresso.session.startsAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })
                              : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Assento</p>
                          <p className="font-bold text-lg">
                            {ingresso.seat?.row}-{ingresso.seat?.number || 'Não definido'}
                          </p>
                          <p className="text-sm text-gray-300">
                            Preço: R$ {ingresso.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-600 bg-opacity-50 rounded p-3 mb-4">
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            ingresso.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                          }`}></span>
                          <p className="font-semibold">
                            {ingresso.status === 'ACTIVE' ? '✓ Ativo' : ingresso.status}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Comprado em: {formatarData(ingresso.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {ingressosEventos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">🎭</p>
                  <p className="text-gray-400 mb-6">Você ainda não comprou ingressos de eventos</p>
                  <button
                    onClick={() => router.push('/eventos')}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Ir para Eventos
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ingressosEventos.map((ingresso) => (
                    <div
                      key={ingresso.id}
                      className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-6 hover:border-red-500 transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Evento</p>
                          <p className="font-bold text-lg">
                            {ingresso.event?.title || 'Evento não disponível'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Data</p>
                          <p className="font-semibold">
                            {ingresso.event?.date
                              ? new Date(ingresso.event.date).toLocaleDateString('pt-BR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })
                              : 'Data não definida'}
                          </p>
                          <p className="text-sm text-gray-300">
                            {ingresso.event?.date
                              ? new Date(ingresso.event.date).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })
                              : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Ingresso</p>
                          <p className="font-bold text-lg">{ingresso.ticketType}</p>
                          <p className="text-sm text-gray-300">
                            Preço: R$ {ingresso.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Comprado em: {formatarData(ingresso.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão para voltar */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-red-500 hover:text-red-400 transition flex items-center gap-2"
          >
            ← Voltar para home
          </button>
        </div>
      </main>
    </div>
  );
}
