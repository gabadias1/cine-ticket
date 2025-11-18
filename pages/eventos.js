import { useMemo, useState, useRef } from 'react';
import LocationSelector from "../components/LocationSelector";
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Eventos() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [events] = useState([
    { 
      id: 1, 
      name: 'Travis Scott - Festival', 
      description: 'Festival de shows com a apresentação principal, Travis Scott.', 
      image: 'images/events/showtravis.jpg', 
      city: 'São Paulo', 
      category: 'Festival', 
      location: 'Autódromo de Interlagos, São Paulo - SP', 
      date: '2025-11-15', 
      time: '14:00',
      sectors: [
        {
          name: 'Camarote Premium',
          price: 890.00,
          description: 'Área VIP com open bar e food, vista privilegiada e lounge exclusivo',
          capacity: 200,
          benefits: ['Open bar premium', 'Buffet completo', 'Área exclusiva', 'Meet & Greet']
        },
        {
          name: 'Pista Premium',
          price: 590.00,
          description: 'Área mais próxima ao palco com open bar',
          capacity: 1000,
          benefits: ['Open bar', 'Área próxima ao palco', 'Entrada antecipada']
        },
        {
          name: 'Pista',
          price: 350.00,
          description: 'Área geral do evento',
          capacity: 5000,
          benefits: ['Acesso à área geral']
        }
      ]
    },

    { 
      id: 2, 
      name: 'Os Melhores do Mundo', 
      description: 'Noite de risadas com um dos maiores nomes do stand-up.', 
      image: 'images/events/osmm.jpeg', 
      city: 'Curitiba', 
      category: 'Stand-up', 
      location: 'Teatro Positivo, Curitiba - PR', 
      date: '2025-10-20', 
      time: '20:00',
      sectors: [
        {
          name: 'Plateia VIP',
          price: 180.00,
          description: 'Primeiras fileiras com meet & greet',
          capacity: 50,
          benefits: ['Meet & Greet', 'Pôster autografado', 'Assentos premium']
        },
        {
          name: 'Plateia Central',
          price: 120.00,
          description: 'Visão central do palco',
          capacity: 200,
          benefits: ['Visão privilegiada', 'Assentos numerados']
        },
        {
          name: 'Plateia Lateral',
          price: 90.00,
          description: 'Área lateral do teatro',
          capacity: 150,
          benefits: ['Assentos numerados']
        }
      ]
    },

    { 
      id: 3, 
      name: 'Peça: Hamlet', 
      description: 'Clássico de Shakespeare em nova montagem.', 
      image: 'images/events/hamlet.jpg', 
      city: 'Rio de Janeiro', 
      category: 'Teatro', 
      location: 'Theatro Municipal, Rio de Janeiro - RJ', 
      date: '2025-10-05', 
      time: '19:30',
      sectors: [
        {
          name: 'Camarote Nobre',
          price: 250.00,
          description: 'Camarote exclusivo com serviço de buffet',
          capacity: 30,
          benefits: ['Buffet incluso', 'Champagne', 'Visão privilegiada']
        },
        {
          name: 'Plateia Premium',
          price: 180.00,
          description: 'Primeiras fileiras centrais',
          capacity: 100,
          benefits: ['Programa autografado', 'Welcome drink']
        },
        {
          name: 'Plateia',
          price: 120.00,
          description: 'Assentos na plateia principal',
          capacity: 300,
          benefits: ['Assentos numerados']
        },
        {
          name: 'Balcão',
          price: 80.00,
          description: 'Assentos no balcão superior',
          capacity: 200,
          benefits: ['Vista panorâmica']
        }
      ]
    },

    { 
      id: 4, 
      name: 'BGS 2025', 
      description: 'BRASIL GAME SHOWWWW - O maior evento de games da América Latina.', 
      image: 'images/events/bgs-logo.jpg', 
      city: 'São Paulo', 
      category: 'Evento', 
      location: 'Distrito Anhembi, São Paulo - SP', 
      date: '2025-12-01', 
      time: '14:00',
      sectors: [
        {
          name: 'Pass VIP',
          price: 599.00,
          description: 'Acesso completo com benefícios exclusivos',
          capacity: 1000,
          benefits: ['Early Access', 'Fast Pass para jogos', 'Kit exclusivo', 'Lounge VIP']
        },
        {
          name: 'Pass Premium',
          price: 399.00,
          description: 'Acesso a todos os dias do evento',
          capacity: 5000,
          benefits: ['Acesso todos os dias', 'Camiseta do evento', 'Fast Pass limitado']
        },
        {
          name: 'Pass Diário',
          price: 150.00,
          description: 'Acesso a um dia do evento',
          capacity: 10000,
          benefits: ['Acesso de um dia']
        }
      ]
    }
    ,
    {
      id: 5,
      name: 'Concerto Sinfônico - Orquestra Municipal',
      description: 'Concerto com clássicos e composições contemporâneas.',
      image: 'images/events/Concerto.jpg',
      city: 'Porto Alegre',
      category: 'Concerto',
      location: 'Teatro São Pedro, Porto Alegre - RS',
      date: '2025-11-10',
      time: '20:00',
      sectors: [
        { name: 'Camarote', price: 230.0, description: 'Camarote com visão lateral', capacity: 40, benefits: ['Programa impresso', 'Bebida'] },
        { name: 'Plateia Premium', price: 150.0, description: 'Fileiras centrais', capacity: 120, benefits: ['Assentos numerados'] },
        { name: 'Plateia', price: 80.0, description: 'Assentos gerais', capacity: 300, benefits: ['Assentos'] }
      ]
    },
    {
      id: 6,
      name: 'Musical: Cats - Edição Nacional',
      description: 'Espetáculo musical inspirado no clássico de Webber.',
      image: 'images/events/cats.jpg',
      city: 'São Paulo',
      category: 'Musical',
      location: 'Teatro Renault, São Paulo - SP',
      date: '2025-12-05',
      time: '21:00',
      sectors: [
        { name: 'VIP', price: 320.0, description: 'Assentos VIP com kit', capacity: 50, benefits: ['Kit do espetáculo', 'Welcome drink'] },
        { name: 'Plateia', price: 160.0, description: 'Assentos numerados', capacity: 200, benefits: ['Assentos numerados'] },
        { name: 'Balcão', price: 90.0, description: 'Balcão superior', capacity: 150, benefits: ['Vista panorâmica'] }
      ]
    },
    {
      id: 7,
      name: 'Circo Mundo Magico',
      description: 'Apresentações familiares com acrobacias e mágicas.',
      image: 'images/events/circo.jpeg',
      city: 'Belo Horizonte',
      category: 'Circo',
      location: 'Parque de Exposições, Belo Horizonte - MG',
      date: '2025-11-22',
      time: '16:00',
      sectors: [
        { name: 'Camarote Família', price: 120.0, description: 'Camarote com espaço para família', capacity: 40, benefits: ['Acesso rápido', 'Área reservada'] },
        { name: 'Arena', price: 60.0, description: 'Assentos próximos ao picadeiro', capacity: 400, benefits: ['Visão próxima'] },
        { name: 'Arquibancada', price: 30.0, description: 'Arquibancada econômica', capacity: 800, benefits: [] }
      ]
    },
    {
      id: 8,
      name: 'Show Sertanejo - Zezé di Camargo e Luciano',
      description: 'Turnê nacional do duo sertanejo.',
      image: 'images/events/zeze.jpg',
      city: 'Fortaleza',
      category: 'Show',
      location: 'Arena Castelão, Fortaleza - CE',
      date: '2025-12-18',
      time: '22:00',
      sectors: [
        { name: 'Camarote', price: 450.0, description: 'Camarote exclusivo com serviço', capacity: 150, benefits: ['Open bar', 'Área VIP'] },
        { name: 'Pista', price: 220.0, description: 'Pista geral', capacity: 3000, benefits: ['Entrada geral'] },
        { name: 'Pista Premium', price: 350.0, description: 'Pista próximo ao palco', capacity: 800, benefits: ['Área próxima ao palco'] }
      ]
    },

    {
      id: 9,
      name: 'Rock in CM 2025',
      description: 'O maior festival de rock do interior do Paraná.',
      image: 'images/events/rockcm.jpg',
      city: 'Campo Mourão',
      category: 'Festival',
      location: 'Parque do Lago, Campo Mourão - PR',
      date: '2025-12-20',
      time: '16:00',
      sectors: [
        { name: 'Área VIP', price: 450.0, description: 'Área exclusiva com open bar', capacity: 300, benefits: ['Open bar premium', 'Área exclusiva', 'Meet & Greet'] },
        { name: 'Pista Premium', price: 250.0, description: 'Pista frontal ao palco', capacity: 1000, benefits: ['Área próxima ao palco', 'Entrada antecipada'] },
        { name: 'Pista', price: 120.0, description: 'Pista comum', capacity: 3000, benefits: ['Acesso à pista'] }
      ]
    },
    {
      id: 10,
      name: 'Festival de Verão 2025',
      description: 'Festival de música eletrônica com DJs internacionais.',
      image: 'images/events/fest.jpeg',
      city: 'Salvador',
      category: 'Festival',
      location: 'Praia do Forte, Salvador - BA',
      date: '2025-12-28',
      time: '22:00',
      sectors: [
        { name: 'Lounge VIP', price: 890.0, description: 'Área VIP com vista para o mar', capacity: 200, benefits: ['Open bar premium', 'Buffet', 'Área exclusiva'] },
        { name: 'Pista Premium', price: 490.0, description: 'Pista com acesso ao front stage', capacity: 1500, benefits: ['Acesso front stage', 'Welcome drink'] },
        { name: 'Pista', price: 290.0, description: 'Pista comum', capacity: 5000, benefits: ['Acesso à pista'] }
      ]
    },

    {
      id: 11,
      name: 'Noite do Riso - Fábio Porchat',
      description: 'Show de stand up com Fábio Porchat e convidados.',
      image: 'images/events/porchat.jpeg',
      city: 'Brasília',
      category: 'Stand-up',
      location: 'Teatro Nacional, Brasília - DF',
      date: '2025-11-25',
      time: '21:00',
      sectors: [
        { name: 'VIP Meet & Greet', price: 250.0, description: 'Inclui encontro com artista', capacity: 50, benefits: ['Meet & Greet', 'Foto com artista', 'Assentos premium'] },
        { name: 'Plateia Gold', price: 180.0, description: 'Primeiras fileiras', capacity: 200, benefits: ['Assentos preferenciais'] },
        { name: 'Plateia', price: 120.0, description: 'Plateia comum', capacity: 300, benefits: ['Assentos numerados'] }
      ]
    },
    {
      id: 12,
      name: 'Comedy Night - Thiago Ventura',
      description: 'Show de comédia com Thiago Ventura.',
      image: 'images/events/ventura.jpg',
      city: 'Recife',
      category: 'Stand-up',
      location: 'Teatro Guararapes, Recife - PE',
      date: '2025-11-30',
      time: '20:00',
      sectors: [
        { name: 'Premium', price: 150.0, description: 'Melhor visão do palco', capacity: 100, benefits: ['Drink incluso', 'Assentos premium'] },
        { name: 'Plateia Central', price: 120.0, description: 'Visão central do palco', capacity: 300, benefits: ['Assentos numerados'] },
        { name: 'Plateia Lateral', price: 90.0, description: 'Visão lateral', capacity: 200, benefits: ['Assentos numerados'] }
      ]
    },

    {
      id: 13,
      name: 'O Fantasma da Ópera',
      description: 'Clássico musical da Broadway em versão nacional.',
      image: 'images/events/fantasma.jpg',
      city: 'São Paulo',
      category: 'Teatro',
      location: 'Teatro Municipal, São Paulo - SP',
      date: '2025-12-10',
      time: '20:00',
      sectors: [
        { name: 'Camarote Especial', price: 400.0, description: 'Camarote com serviço', capacity: 40, benefits: ['Serviço de buffet', 'Champagne', 'Vista premium'] },
        { name: 'Plateia Nobre', price: 280.0, description: 'Melhores assentos', capacity: 200, benefits: ['Programa autografado', 'Welcome drink'] },
        { name: 'Plateia', price: 180.0, description: 'Plateia comum', capacity: 500, benefits: ['Assentos numerados'] }
      ]
    },
    {
      id: 14,
      name: 'Romeu e Julieta - Ballet',
      description: 'Ballet clássico com orquestra ao vivo.',
      image: 'images/events/ree.jpg',
      city: 'Rio de Janeiro',
      category: 'Teatro',
      location: 'Theatro Municipal, Rio de Janeiro - RJ',
      date: '2025-12-15',
      time: '19:00',
      sectors: [
        { name: 'Camarote', price: 350.0, description: 'Camarote com serviço', capacity: 48, benefits: ['Serviço exclusivo', 'Welcome drink'] },
        { name: 'Plateia Premium', price: 250.0, description: 'Melhores assentos', capacity: 150, benefits: ['Programa especial', 'Visão privilegiada'] },
        { name: 'Plateia', price: 150.0, description: 'Plateia comum', capacity: 400, benefits: ['Assentos numerados'] }
      ]
    },

    {
      id: 15,
      name: 'Comic Con Brasil 2025',
      description: 'O maior evento geek do Brasil.',
      image: 'images/events/comic.jpg',
      city: 'São Paulo',
      category: 'Evento',
      location: 'Expo Center Norte, São Paulo - SP',
      date: '2025-12-05',
      time: '10:00',
      sectors: [
        { name: 'Epic Pass', price: 799.0, description: 'Acesso total com extras', capacity: 500, benefits: ['Meet & Greet', 'Kit exclusivo', 'Fast pass', 'Lounge VIP'] },
        { name: 'Full Pass', price: 499.0, description: 'Acesso a todos os dias', capacity: 2000, benefits: ['Acesso todos os dias', 'Camiseta evento'] },
        { name: 'Day Pass', price: 199.0, description: 'Acesso de um dia', capacity: 5000, benefits: ['Acesso de um dia'] }
      ]
    },
    {
      id: 16,
      name: 'Expo Tattoo 2025',
      description: 'Festival internacional de tatuagem.',
      image: 'images/events/expo.jpg',
      city: 'Curitiba',
      category: 'Evento',
      location: 'Expo Barigui, Curitiba - PR',
      date: '2025-11-28',
      time: '12:00',
      sectors: [
        { name: 'VIP Pass', price: 299.0, description: 'Acesso VIP com benefícios', capacity: 300, benefits: ['Área VIP', 'Kit exclusivo', 'Voucher desconto'] },
        { name: 'Full Pass', price: 199.0, description: 'Acesso todos os dias', capacity: 1000, benefits: ['Acesso completo', 'Camiseta oficial'] },
        { name: 'Day Pass', price: 89.0, description: 'Acesso de um dia', capacity: 2000, benefits: ['Acesso de um dia'] }
      ]
    }
  ]);

  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const [modalEvent, setModalEvent] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [extras, setExtras] = useState({ estacionamento: false, camarotePrivado: false, estacionamentoVIP: false });

  const cities = useMemo(() => Array.from(new Set(events.map((e) => e.city))).sort(), [events]);
  const categories = useMemo(() => Array.from(new Set(events.map((e) => e.category))).sort(), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const cityMatch = !filterCity || e.city === filterCity;
      const catMatch = !filterCategory || e.category === filterCategory;
      const dateMatch = !filterDate || e.date === filterDate;
      const text = `${e.name} ${e.description}`.toLowerCase();
      const searchMatch = !searchQuery || text.includes(searchQuery.toLowerCase());
      return cityMatch && catMatch && dateMatch && searchMatch;
    });
  }, [events, filterCity, filterCategory, filterDate, searchQuery]);

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
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Olá, {user.name}</span>
                <button
                  onClick={() => router.push("/perfil")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors text-sm"
                >
                  👤 Perfil
                </button>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Todos os Eventos</h2>
        </div>

        {/* Busca e Filtros - padrão Filmes */}
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
              <div key={ev.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group">
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
                  <p className="text-sm text-gray-600 mb-3">{ev.description}</p>
                  <div className="text-sm text-gray-500 space-y-1 mb-4">
                    <div className="flex items-center">{ev.location}</div>
                    <div className="flex items-center">{ev.date.split('-').reverse().join('/')} às {ev.time}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{ev.category}</span>
                    <button
                      onClick={() => setModalEvent(ev)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Ver mais
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalhes */}
        {modalEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setModalEvent(null)}
              >
                ✕
              </button>
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
                <div><strong>Cidade:</strong> {modalEvent.city}</div>
              </div>

              <div className="mt-6">
                <h4 className="text-xl font-semibold mb-4">Setores disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modalEvent.sectors.map((sector, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-lg">{sector.name}</h5>
                        <span className="text-lg font-semibold text-blue-600">
                          R$ {sector.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{sector.description}</p>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Capacidade:</span> {sector.capacity} pessoas
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Benefícios:</span>
                          <ul className="list-disc list-inside mt-1 text-gray-600">
                            {sector.benefits.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => { 
                          if (!user) {
                            router.push('/login');
                            return;
                          }
                          // Redirecionar para pagamento com dados do evento
                          router.push({
                            pathname: '/pagamento',
                            query: {
                              tipo: 'evento',
                              eventId: modalEvent.id,
                              eventName: modalEvent.name,
                              sector: sector.name,
                              price: sector.price,
                              eventDate: modalEvent.date
                            }
                          });
                          setModalEvent(null);
                        }}
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Comprar Ingresso
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setModalEvent(null)} 
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
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


