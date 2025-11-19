import { useMemo, useState, useRef, useEffect } from 'react';
import LocationSelector from "../components/LocationSelector";
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function Eventos() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Estados para eventos
  const [localEvents, setLocalEvents] = useState([]);
  const [ticketmasterEvents, setTicketmasterEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncingEvent, setSyncingEvent] = useState(null);

  // Estados de filtros
  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const [modalEvent, setModalEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  // Buscar eventos do banco local
  useEffect(() => {
    loadEvents();
  }, []);

  const SPECIAL_KEYWORDS = ['camarote', 'vip', 'lounge', 'premium', 'experience', 'experiência'];

  const isSpecialVariant = (name = '') => {
    const normalized = name?.toLowerCase() || '';
    return SPECIAL_KEYWORDS.some((keyword) => normalized.includes(keyword));
  };

  const ensureLocalEventId = async (event) => {
    if (!event) return null;
    if (typeof event.id === 'number') return event.id;
    if (event.localEventId) return event.localEventId;

    if (event.source === 'ticketmaster') {
      try {
        const response = await api.syncTicketmasterEvent(event.ticketmasterId);
        await loadEvents();
        return response?.event?.id || null;
      } catch (err) {
        throw new Error(err.message || 'Não foi possível sincronizar o evento para compra.');
      }
    }

    return null;
  };

  const handleProceedToPayment = async () => {
    if (!modalEvent || processingPurchase) return;
    setProcessingPurchase(true);

    try {
      const localEventId = await ensureLocalEventId(modalEvent);

      if (!localEventId) {
        alert('Não foi possível preparar o evento para compra.');
        return;
      }

      const eventQuery = {
        tipo: 'evento',
        eventId: localEventId,
        ticketmasterId: modalEvent.ticketmasterId || '',
        eventName: modalEvent.name,
        sector: modalEvent.category || 'Evento',
        price: modalEvent.price || 0,
        eventDate: modalEvent.date,
        qty: ticketCount
      };

      if (!user) {
        router.push({ pathname: '/login', query: eventQuery });
      } else {
        setModalEvent(null);
        router.push({ pathname: '/pagamento', query: eventQuery });
      }
    } catch (error) {
      console.error('Erro ao preparar compra:', error);
      alert(error.message || 'Erro ao preparar compra. Tente novamente.');
    } finally {
      setProcessingPurchase(false);
    }
  };

  const sanitizeEventName = (name = '') => {
    if (!name) return '';

    let normalized = name.toLowerCase();

    const delimiters = [' - ', ' | ', ':'];
    for (const delimiter of delimiters) {
      const index = normalized.indexOf(delimiter);
      if (index !== -1) {
        const prefix = normalized.substring(0, index);
        const suffix = normalized.substring(index + delimiter.length);
        if (SPECIAL_KEYWORDS.some(keyword => prefix.includes(keyword))) {
          normalized = suffix;
          break;
        }
      }
    }

    SPECIAL_KEYWORDS.forEach((keyword) => {
      normalized = normalized.replace(new RegExp(keyword, 'g'), '');
    });

    normalized = normalized
      .replace(/\s+/g, ' ')
      .replace(/^-+/, '')
      .trim();

    return normalized;
  };

  const groupTicketmasterEvents = (events = []) => {
    const grouped = new Map();

    for (const event of events) {
      const attractionName = event._embedded?.attractions?.[0]?.name || '';
      const baseName = sanitizeEventName(attractionName || event.name || '') || (event.name || '').toLowerCase();
      const venue = event._embedded?.venues?.[0];
      const city = venue?.city?.name?.toLowerCase() || '';
      const date = event.dates?.start?.localDate || '';
      const key = `${baseName}|${city}|${date}`;

      const isCamarote = isSpecialVariant(event.name);
      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, { event, isCamarote });
        continue;
      }

      if (existing.isCamarote && !isCamarote) {
        grouped.set(key, { event, isCamarote });
      }
    }

    return Array.from(grouped.values()).map(({ event }) => event);
  };

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      // Buscar eventos do banco local
      const localData = await api.getEvents();
      setLocalEvents(localData || []);

      // Buscar eventos públicos da Ticketmaster (Brasil)
      try {
        const ticketmasterResponse = await api.getTicketmasterEvents({ size: 100 });
        const events = ticketmasterResponse?._embedded?.events || [];
        const dedupedEvents = groupTicketmasterEvents(events);
        setTicketmasterEvents(dedupedEvents);
      } catch (tmError) {
        console.error('Erro ao buscar eventos do Ticketmaster:', tmError);
        setTicketmasterEvents([]);
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar eventos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Normalizar eventos locais para o formato esperado
  const normalizeLocalEvent = (event) => {
    const eventDate = new Date(event.date);
    return {
      id: event.id,
      name: event.title,
      description: event.description || '',
      image: event.imageUrl || event.bannerUrl || '/images/logo.png',
      city: event.city || '',
      category: event.category || 'Evento',
      location: event.location || event.address || '',
      date: eventDate.toISOString().split('T')[0],
      time: eventDate.toTimeString().split(' ')[0].substring(0, 5),
      price: event.price || 0,
      address: event.address || '',
      state: event.state || '',
      capacity: event.capacity || 0,
      source: 'local',
      ticketmasterId: event.ticketmasterId || null,
      sectors: [],
      localEventId: event.id
    };
  };

  const normalizeTicketmasterEvent = (event) => {
    const venue = event._embedded?.venues?.[0] || {};
    const startDate = event.dates?.start?.dateTime || `${event.dates?.start?.localDate || ''}T${event.dates?.start?.localTime || '00:00:00'}`;
    const parsedDate = startDate ? new Date(startDate) : new Date();
    const addressParts = [
      venue.address?.line1,
      venue.address?.line2,
      venue.city?.name,
      venue.state?.stateCode,
      venue.postalCode
    ].filter(Boolean);
    const priceRange = event.priceRanges?.[0];
    const matchingLocal = localEvents.find((e) => e.ticketmasterId === event.id);
    const price = typeof priceRange?.min === 'number'
      ? priceRange.min
      : (typeof priceRange?.max === 'number' ? priceRange.max : 0);

    return {
      id: `ticketmaster-${event.id}`,
      ticketmasterId: event.id,
      name: event.name || 'Evento sem título',
      description: (event.info || event.pleaseNote || '').replace(/<[^>]*>/g, '').trim().substring(0, 200),
      image: event.images?.find((img) => img.ratio === '16_9' && img.width >= 1024)?.url || event.images?.[0]?.url || '/images/logo.png',
      city: venue.city?.name || '',
      category: event.classifications?.[0]?.genre?.name || event.classifications?.[0]?.segment?.name || 'Evento',
      location: venue.name || venue.address?.line1 || 'Local a definir',
      date: parsedDate.toISOString().split('T')[0],
      time: parsedDate.toTimeString().split(' ')[0].substring(0, 5),
      price,
      address: addressParts.join(', '),
      state: venue.state?.stateCode || '',
      capacity: venue.capacity || 0,
      source: 'ticketmaster',
      isSynced: Boolean(matchingLocal),
      localEventId: matchingLocal?.id || null,
      attractionKey: sanitizeEventName(event._embedded?.attractions?.[0]?.name || event.name || '')
    };
  };

  const dedupeEventsForDisplay = (events = []) => {
    const grouped = new Map();

    for (const event of events) {
      const baseName = sanitizeEventName(event.attractionKey || event.name || '') || (event.name || '').toLowerCase();
      const city = (event.city || '').toLowerCase();
      const date = event.date || '';
      const key = `${baseName}|${city}|${date}`;
      const isCamarote = isSpecialVariant(event.name);
      const isLocal = event.source === 'local';

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, { event, isCamarote, isLocal });
        continue;
      }

      const shouldReplace = (!existing.isLocal && isLocal) || (existing.isCamarote && !isCamarote);

      if (shouldReplace) {
        grouped.set(key, { event, isCamarote, isLocal });
      }
    }

    return Array.from(grouped.values()).map(({ event }) => event);
  };

  // Combinar eventos locais e da Ticketmaster
  const allEvents = useMemo(() => {
    const normalizedLocal = localEvents.map(normalizeLocalEvent);
    const normalizedTicketmaster = ticketmasterEvents.map(normalizeTicketmasterEvent);
    const combined = [...normalizedLocal, ...normalizedTicketmaster];

    return dedupeEventsForDisplay(combined);
  }, [localEvents, ticketmasterEvents]);

  const cities = useMemo(() => Array.from(new Set(allEvents.map((e) => e.city).filter(Boolean))).sort(), [allEvents]);
  const categories = useMemo(() => Array.from(new Set(allEvents.map((e) => e.category).filter(Boolean))).sort(), [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const cityMatch = !filterCity || e.city === filterCity;
      const catMatch = !filterCategory || e.category === filterCategory;
      const dateMatch = !filterDate || e.date === filterDate;
      const text = `${e.name} ${e.description}`.toLowerCase();
      const searchMatch = !searchQuery || text.includes(searchQuery.toLowerCase());
      return cityMatch && catMatch && dateMatch && searchMatch;
    });
  }, [allEvents, filterCity, filterCategory, filterDate, searchQuery]);

  // Sincronizar evento do Ticketmaster para o banco local
  const handleSyncEvent = async (ticketmasterId) => {
    if (!ticketmasterId) return;
    
    setSyncingEvent(ticketmasterId);
    try {
      await api.syncTicketmasterEvent(ticketmasterId);
      // Recarregar eventos após sincronização
      await loadEvents();
      alert('Evento sincronizado com sucesso!');
    } catch (err) {
      console.error('Erro ao sincronizar evento:', err);
      alert(err.message || 'Erro ao sincronizar evento. Tente novamente.');
    } finally {
      setSyncingEvent(null);
    }
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
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                  searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              type="button"
              aria-label="Buscar eventos"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Todos os Eventos</h2>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando eventos...</p>
          </div>
        )}

        {/* Busca e Filtros */}
        {!loading && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar eventos..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as cidades</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={() => { setSearchQuery(''); setFilterCity(''); setFilterCategory(''); setFilterDate(''); }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Lista de eventos / estado vazio */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                Nenhum evento encontrado
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group relative">
                    {ev.source === 'ticketmaster' && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          Ticketmaster
                        </span>
                      </div>
                    )}
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={ev.image}
                        alt={ev.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x338?text=Evento'; }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">{ev.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ev.description}</p>
                      <div className="text-sm text-gray-500 space-y-1 mb-4">
                        <div className="flex items-center">{ev.location}</div>
                        <div className="flex items-center">{ev.date.split('-').reverse().join('/')} às {ev.time}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{ev.category}</span>
                        <button
                          onClick={() => {
                            setTicketCount(1);
                            setModalEvent(ev);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Ver mais
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal de detalhes */}
        {modalEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalEvent(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
                onClick={() => setModalEvent(null)}
              >
                ✕
              </button>
              
              {modalEvent.source === 'ticketmaster' && !modalEvent.isSynced && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 mb-2">
                    Este evento veio da Ticketmaster. Sincronize para adicionar ao nosso catálogo local.
                  </p>
                  <button
                    onClick={() => handleSyncEvent(modalEvent.ticketmasterId)}
                    disabled={syncingEvent === modalEvent.ticketmasterId}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {syncingEvent === modalEvent.ticketmasterId ? 'Sincronizando...' : 'Sincronizar Evento'}
                  </button>
                </div>
              )}

              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={modalEvent.image}
                  alt={modalEvent.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x338?text=Evento'; }}
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">{modalEvent.name}</h3>
              <p className="text-gray-700 mb-4">{modalEvent.description}</p>
              <div className="text-sm text-gray-600 space-y-1 mb-6">
                <div><strong>Local:</strong> {modalEvent.location}</div>
                <div><strong>Data:</strong> {modalEvent.date.split('-').reverse().join('/')} às {modalEvent.time}</div>
                <div><strong>Categoria:</strong> {modalEvent.category}</div>
                {modalEvent.city && <div><strong>Cidade:</strong> {modalEvent.city}</div>}
                {modalEvent.address && <div><strong>Endereço:</strong> {modalEvent.address}</div>}
              </div>

              <div className="mt-6">
                {modalEvent.presentations && modalEvent.presentations.length > 0 ? (
                  <>
                    <h4 className="text-xl font-semibold mb-4">Apresentações disponíveis</h4>
                    <div className="space-y-4 mb-6">
                      {modalEvent.presentations.map((presentation, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-lg text-gray-800">
                              {presentation.name || `Apresentação ${index + 1}`}
                            </h5>
                            {presentation.price && (
                              <span className="text-lg font-bold text-blue-600">
                                R$ {parseFloat(presentation.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {presentation.start_date && (
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Data:</strong> {new Date(presentation.start_date.replace(' ', 'T')).toLocaleString('pt-BR')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-xl font-semibold mb-4">Comprar ingresso</h4>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center border rounded-md px-2 py-1">
                        <button 
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} 
                          className="px-3 py-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          -
                        </button>
                        <div className="px-4 font-bold">{ticketCount}</div>
                        <button 
                          onClick={() => setTicketCount(Math.min(10, ticketCount + 1))} 
                          className="px-3 py-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          +
                        </button>
                      </div>
                      {modalEvent.price > 0 && (
                        <>
                          <div className="text-sm text-gray-700">
                            Preço por ingresso: <span className="font-semibold text-blue-600">R$ {modalEvent.price.toFixed(2)}</span>
                          </div>
                          <div className="ml-auto text-sm font-bold">
                            Total: <span className="text-green-600">R$ {(modalEvent.price * ticketCount).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={processingPurchase}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {processingPurchase ? 'Carregando...' : 'Ir para pagamento'}
                    </button>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setModalEvent(null)} 
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
