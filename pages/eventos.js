import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';

export default function Eventos() {
  const router = useRouter();

  const [events] = useState([
    { id: 1, 
      name: 'Travis Scott - Festival', 
      description: 'Festival de shows com a apresentação principal, Travis Scott.', 
      image: 'images/events/showtravis.jpg', 
      city: 'São Paulo', 
      category: 'Festival', 
      location: 'Autódromo de Interlagos, São Paulo - SP', 
      date: '2025-11-15', 
      time: '14:00' },

    { id: 1, name: 'Os Melhores do Mundo', 
      description: 'Noite de risadas com um dos maiores nomes do stand-up.', 
      image: 'images/events/osmm.jpeg', 
      city: 'Curitiba', 
      category: 'Stand-up', 
      location: 'Teatro Positivo, Curitiba - PR', 
      date: '2025-10-20', 
      time: '20:00' },

    { id: 1, 
      name: 'Peça: Hamlet', 
      description: 'Clássico de Shakespeare em nova montagem.', 
      image: 'images/events/hamlet.jpg', 
      city: 'Rio de Janeiro', 
      category: 'Teatro', 
      location: 'Theatro Municipal, Rio de Janeiro - RJ', 
      date: '2025-10-05', 
      time: '19:30' },

    { id: 1, 
      name: 'BGS 2025', 
      description: 'BRASIL GAME SHOWWWW - O maior evento de games da América Latina.', 
      image: 'images/events/BGS-LOGO.jpg', 
      city: 'São Paulo', 
      category: 'Evento', 
      location: 'Distrito Anhembi, São Paulo - SP', 
      date: '2025-12-01', 
      time: '14;00' },

  ]);

  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [modalEvent, setModalEvent] = useState(null);

  const cities = useMemo(() => Array.from(new Set(events.map((e) => e.city))).sort(), [events]);
  const categories = useMemo(() => Array.from(new Set(events.map((e) => e.category))).sort(), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const cityMatch = !filterCity || e.city === filterCity;
      const catMatch = !filterCategory || e.category === filterCategory;
      const dateMatch = !filterDate || e.date === filterDate;
      return cityMatch && catMatch && dateMatch;
    });
  }, [events, filterCity, filterCategory, filterDate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-bold cursor-pointer" onClick={() => router.push("/")}>CineTicket</h1>
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => router.push("/filmes")}
                className="text-white hover:text-blue-200 transition-colors"
              >
                Filmes
              </button>
              <button
                onClick={() => router.push('/eventos')}
                className="text-white hover:text-blue-200 transition-colors underline underline-offset-4"
              >
                Eventos
              </button>
            </nav>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-full transition-colors"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Eventos</h2>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cidade</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Todas</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Data</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilterCity(''); setFilterCategory(''); setFilterDate(''); }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md py-2"
            >
              Limpar filtros
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
                    <div className="flex items-center">{new Date(ev.date).toLocaleDateString('pt-BR')} às {ev.time}</div>
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
                <div><strong>Data:</strong> {new Date(modalEvent.date).toLocaleDateString('pt-BR')} às {modalEvent.time}</div>
                <div><strong>Categoria:</strong> {modalEvent.category}</div>
                <div><strong>Cidade:</strong> {modalEvent.city}</div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModalEvent(null)} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Fechar</button>
                <button onClick={() => { setModalEvent(null); router.push('/login'); }} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Comprar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


