import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LocationSelector from '../components/LocationSelector';

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
                  onClick={handleLogout}
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">👤 Meu Perfil</h1>
          <p className="text-gray-600">Visualize e gerencie seus ingressos</p>
        </div>

        {/* Abas */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setAbaSelecionada('ingressos')}
            className={`pb-4 font-semibold transition ${
              abaSelecionada === 'ingressos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎫 Ingressos de Cinema ({ingressos.length})
          </button>
          <button
            onClick={() => setAbaSelecionada('eventos')}
            className={`pb-4 font-semibold transition ${
              abaSelecionada === 'eventos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎭 Ingressos de Eventos ({ingressosEventos.length})
          </button>
        </div>

        {/* Mensagens */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8">
            {erro}
          </div>
        )}

        {/* Conteúdo */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-md">
          {carregando ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Carregando ingressos...</p>
            </div>
          ) : abaSelecionada === 'ingressos' ? (
            <div>
              {ingressos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">🎬</p>
                  <p className="text-gray-600 mb-6">Você ainda não comprou ingressos de cinema</p>
                  <button
                    onClick={() => router.push('/filmes')}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition text-white"
                  >
                    Ir para Filmes
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ingressos.map((ingresso) => (
                    <div
                      key={ingresso.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition shadow-sm"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Filme</p>
                          <p className="font-bold text-lg text-gray-800">
                            {ingresso.session?.movie?.title || 'Filme não disponível'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Sessão</p>
                          <p className="font-semibold text-gray-800">
                            {ingresso.session?.startsAt 
                              ? new Date(ingresso.session.startsAt).toLocaleDateString('pt-BR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })
                              : 'Data não definida'}
                          </p>
                          <p className="text-sm text-gray-600">
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
                          <p className="text-sm text-gray-600 mb-1">Assento</p>
                          <p className="font-bold text-lg text-gray-800">
                            {ingresso.seat?.row}-{ingresso.seat?.number || 'Não definido'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Preço: R$ {ingresso.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded p-3 mb-4 border border-blue-100">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            ingresso.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></span>
                          <p className="font-semibold text-gray-800">
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
                  <p className="text-gray-600 mb-6">Você ainda não comprou ingressos de eventos</p>
                  <button
                    onClick={() => router.push('/eventos')}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition text-white"
                  >
                    Ir para Eventos
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ingressosEventos.map((ingresso) => (
                    <div
                      key={ingresso.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition shadow-sm"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Evento</p>
                          <p className="font-bold text-lg text-gray-800">
                            {ingresso.event?.title || 'Evento não disponível'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Data</p>
                          <p className="font-semibold text-gray-800">
                            {ingresso.event?.date
                              ? new Date(ingresso.event.date).toLocaleDateString('pt-BR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })
                              : 'Data não definida'}
                          </p>
                          <p className="text-sm text-gray-600">
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
                          <p className="text-sm text-gray-600 mb-1">Ingresso</p>
                          <p className="font-bold text-lg text-gray-800">{ingresso.ticketType}</p>
                          <p className="text-sm text-gray-600">
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
            className="text-gray-600 hover:text-blue-600 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para home
          </button>
        </div>
      </main>
    </div>
  );
}
