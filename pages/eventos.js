import { useMemo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import EventCard from '../components/events/EventCard';
import Button from '../components/ui/Button';
import { Search, Filter, X, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEAT_LAYOUT_RULES = [
  {
    preset: 'teatro',
    layout: '4',
    regex: /(teatr|ópera|opera|ballet|musical)/i,
  },
  {
    preset: 'show',
    layout: '4',
    regex: /(show|músic|music|concert|concerto|festival|tour|turnê|rock|metal|indie|pop|eletr[oô]n|eletron|hip[- ]?hop|rap|sertanej|pagode|samba|forr[oó]|ax[eé]|mpb|jazz|blues|funk)/i,
  },
  {
    preset: 'standup',
    layout: '4',
    regex: /(stand[ -]?up|com[eé]dia|humor)/i,
  }
];

const getSeatConfigForCategory = (category = '') => {
  const normalized = category?.toString().toLowerCase() || '';
  return SEAT_LAYOUT_RULES.find((rule) => rule.regex.test(normalized)) || null;
};

export default function Eventos() {
  const router = useRouter();
  const { user } = useAuth();

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

  const handleSelectSeats = async () => {
    if (!modalEvent || processingPurchase) return;
    const seatConfig = getSeatConfigForCategory(modalEvent.category || modalEvent.name);
    if (!seatConfig) {
      await handleProceedToPayment();
      return;
    }

    setProcessingPurchase(true);

    try {
      const localEventId = await ensureLocalEventId(modalEvent);

      if (!localEventId) {
        alert('Não foi possível preparar o evento para selecionar os lugares.');
        return;
      }

      const query = {
        eventId: localEventId,
        eventName: modalEvent.name,
        eventCategory: modalEvent.category || 'Evento',
        eventDate: modalEvent.date,
        eventTime: modalEvent.time,
        seatPreset: seatConfig.preset,
        basePrice: modalEvent.price || '',
        layout: seatConfig.layout
      };

      setModalEvent(null);
      router.push({ pathname: `/assentos/${localEventId}`, query });
    } catch (error) {
      console.error('Erro ao redirecionar para seleção de assentos:', error);
      alert(error.message || 'Erro ao abrir seleção de assentos. Tente novamente.');
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
    const price = (priceRange?.min && priceRange.min > 0)
      ? priceRange.min
      : ((priceRange?.max && priceRange.max > 0) ? priceRange.max : 80.00); // Fallback price for demo

    let category = event.classifications?.[0]?.genre?.name || event.classifications?.[0]?.segment?.name || 'Evento';
    if (category === 'Undefined' || category === 'Indefinido') {
      category = event.classifications?.[0]?.segment?.name || 'Evento';
    }

    return {
      id: `ticketmaster-${event.id}`,
      ticketmasterId: event.id,
      name: event.name || 'Evento sem título',
      description: (event.info || event.pleaseNote || '').replace(/<[^>]*>/g, '').trim().substring(0, 200),
      image: event.images?.find((img) => img.ratio === '16_9' && img.width >= 1024)?.url || event.images?.[0]?.url || '/images/logo.png',
      city: venue.city?.name || '',
      category,
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
    <Layout title="Eventos - CineTicket">
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Eventos e Shows</h1>
            <p className="text-gray-400">Garanta seu lugar nos melhores espetáculos</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
            <form onSubmit={(e) => e.preventDefault()} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar eventos..."
                className="w-full sm:w-64 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 pl-10 py-2.5"
              />
            </form>

            <div className="h-px sm:h-auto sm:w-px bg-white/10" />

            <div className="flex gap-2 flex-wrap">
              {/* City Filter */}
              <div className="relative">
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="appearance-none bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-40"
                >
                  <option value="" className="bg-gray-900">Cidades</option>
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-gray-900">{c}</option>
                  ))}
                </select>
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-40"
                >
                  <option value="" className="bg-gray-900">Categorias</option>
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-gray-900">{c}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="appearance-none bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-auto"
                />
              </div>

              {(searchQuery || filterCity || filterCategory || filterDate) && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterCity(''); setFilterCategory(''); setFilterDate(''); }}
                  className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                  title="Limpar Filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-8 flex items-center justify-between"
            >
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[16/9] bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filteredEvents.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum evento encontrado</h3>
                <p className="text-gray-400">Tente ajustar seus filtros ou buscar por outro termo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} onClick={() => {
                    setTicketCount(1);
                    setModalEvent(ev);
                  }}>
                    <EventCard event={{ ...ev, onClick: () => setModalEvent(ev) }} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal de Detalhes */}
        <AnimatePresence>
          {modalEvent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setModalEvent(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-surface border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {/* Close Button */}
                <button
                  onClick={() => setModalEvent(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Content */}
                <div className="relative h-64 sm:h-80">
                  <img
                    src={modalEvent.image}
                    alt={modalEvent.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="px-3 py-1 rounded-lg bg-primary text-white text-sm font-bold mb-2 inline-block">
                      {modalEvent.category}
                    </span>
                    <h2 className="text-3xl font-bold text-white">{modalEvent.name}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Data e Hora</p>
                        <p className="font-medium">{modalEvent.date.split('-').reverse().join('/')} às {modalEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Local</p>
                        <p className="font-medium">{modalEvent.location}</p>
                        <p className="text-xs text-gray-500">{modalEvent.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg font-bold text-white mb-2">Sobre o evento</h3>
                    <p className="text-gray-400">{modalEvent.description}</p>
                  </div>

                  {/* Ticketmaster Sync Warning */}
                  {modalEvent.source === 'ticketmaster' && !modalEvent.isSynced && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                      <p className="text-sm text-purple-300">
                        Este evento é da Ticketmaster. Sincronize para habilitar a compra.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSyncEvent(modalEvent.ticketmasterId)}
                        disabled={syncingEvent === modalEvent.ticketmasterId}
                      >
                        {syncingEvent === modalEvent.ticketmasterId ? 'Sincronizando...' : 'Sincronizar'}
                      </Button>
                    </div>
                  )}

                  {/* Purchase Section */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    {modalEvent.presentations && modalEvent.presentations.length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Apresentações Disponíveis</h4>
                        {modalEvent.presentations.map((presentation, index) => (
                          <div key={index} className="flex justify-between items-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                            <div>
                              <p className="font-bold text-white">{presentation.name || `Sessão ${index + 1}`}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(presentation.start_date.replace(' ', 'T')).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <span className="text-primary font-bold">
                              R$ {parseFloat(presentation.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {getSeatConfigForCategory(modalEvent.category || modalEvent.name) ? (
                          <div className="text-center space-y-4">
                            <p className="text-gray-300">Este evento possui mapa de assentos.</p>
                            <Button
                              variant="primary"
                              className="w-full"
                              onClick={handleSelectSeats}
                              disabled={processingPurchase}
                            >
                              {processingPurchase ? 'Carregando...' : 'Selecionar Lugares'}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400">Preço por ingresso</p>
                                <p className="text-2xl font-bold text-white">R$ {modalEvent.price.toFixed(2)}</p>
                              </div>

                              <div className="flex items-center gap-3 bg-black/30 rounded-lg p-1">
                                <button
                                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white transition-colors"
                                >
                                  -
                                </button>
                                <span className="font-bold text-white w-4 text-center">{ticketCount}</span>
                                <button
                                  onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <span className="text-gray-400">Total</span>
                              <span className="text-2xl font-bold text-primary">
                                R$ {(modalEvent.price * ticketCount).toFixed(2)}
                              </span>
                            </div>

                            <Button
                              variant="primary"
                              className="w-full"
                              size="lg"
                              onClick={handleProceedToPayment}
                              disabled={processingPurchase}
                            >
                              {processingPurchase ? 'Processando...' : 'Comprar Ingressos'}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
