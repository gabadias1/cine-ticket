import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('emCartaz');

  const featuredEvents = [
    {
      id: 1,
      title: 'Taylor Swift: The Eras Tour',
      description: 'Um espetáculo musical imperdível',
      image: '/images/movies/taylor-swift.jpg',
      date: '15/10/2024'
    },
    {
      id: 2,
      title: 'Show do Red Hot Chili Peppers',
      description: 'Turnê mundial em São Paulo',
      image: '/images/movies/rhcp.jpg',
      date: '20/11/2024'
    },
    {
      id: 3,
      title: 'Cirque du Soleil: Alegría',
      description: 'O espetáculo mais mágico do mundo',
      image: '/images/movies/cirque.jpg',
      date: '05/12/2024'
    }
  ];

  const moviesInTheaters = [
    {
      id: 1,
      title: 'Invocação do mal 4',
      genre: 'Ficção Científica',
      duration: '2h 46min',
      rating: '14',
      imdbRating: '8.8',
      image: '/images/movies/invocacao4.jpg',
      sessions: ['15:30', '18:00', '20:30']
    },
    {
      id: 2,
      title: 'Demon Slayer: Kimetsu No Yaiba - Castelo Infinito',
      genre: 'Animação',
      duration: '2h 35min',
      rating: '18',
      imdbRating: '8.4',
      image: '/images/movies/demonslayer.jpg',
      sessions: ['14:00', '16:40', '19:20']
    },
    {
      id: 3,
      title: 'Os caras malvados 2',
      genre: 'Animação',
      duration: '2h 32min',
      rating: '12',
      imdbRating: '8.2',
      image: '/images/movies/oscaras2.jpg',
      sessions: ['13:30', '16:00', '21:00']
    },
    {
      id: 4,
      title: 'Kung Fu Panda 4',
      genre: 'Animação',
      duration: '1h 34min',
      rating: 'L',
      imdbRating: '7.9',
      image: '/images/movies/kungfu-panda4.jpg',
      sessions: ['14:30', '16:30', '18:30']
    }
  ];

  const comingSoonMovies = [
    {
      id: 5,
      title: 'Deadpool 3',
      genre: 'Ação/Comédia',
      duration: '2h 15min',
      rating: '16',
      releaseDate: '26/07/2024',
      image: '/images/movies/deadpool3.jpg'
    },
    {
      id: 6,
      title: 'Furiosa',
      genre: 'Ação/Aventura',
      duration: '2h 25min',
      rating: '16',
      releaseDate: '23/05/2024',
      image: '/images/movies/furiosa.jpg'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const tabs = [
    { id: 'emCartaz', label: 'Em Cartaz' },
    { id: 'emBreve', label: 'Em Breve' },
    { id: 'eventos', label: 'Eventos' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-bold">CineTicket</h1>
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => router.push("/filmes")}
                className="text-white hover:text-blue-200 transition-colors"
              >
                Filmes
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

      {/* Featured Carousel */}
      <div className="relative">
        <Slider {...sliderSettings}>
          {moviesInTheaters.map((movie) => (
            <div key={movie.id} className="relative">
              <div className="aspect-w-16 aspect-h-7">
                <div className="w-full h-[400px] relative overflow-hidden">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/1200x600?text=Filme+em+Destaque';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="max-w-7xl mx-auto text-white">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-bold">
                            IMDb {movie.imdbRating}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-bold">
                            {movie.rating}
                          </span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">{movie.title}</h2>
                        <p className="text-xl mb-4 text-gray-200">
                          {movie.genre} • {movie.duration}
                        </p>
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="flex items-center text-gray-300">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Hoje às {movie.sessions.join(', ')}
                          </div>
                        </div>
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                          Comprar Ingresso
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

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'emCartaz' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Em Cartaz</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {moviesInTheaters.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                >
                  <div className="relative">
                    <div className="aspect-w-2 aspect-h-3">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x450?text=Poster';
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                      IMDb {movie.imdbRating}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {movie.title}
                      </h3>
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        {movie.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{movie.genre} • {movie.duration}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Hoje às {movie.sessions.join(', ')}
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span>Comprar Ingresso</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'eventos' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Eventos Especiais</h2>
            <div className="mb-8">
              <Slider {...sliderSettings}>
                {featuredEvents.map((event) => (
                  <div key={event.id} className="px-2">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="relative">
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/1200x600?text=Evento';
                            }}
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-gray-200 mb-2">{event.description}</p>
                          <div className="flex items-center text-gray-300">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {event.date}
                          </div>
                          <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition-colors">
                            Comprar Ingressos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}

        {activeTab === 'emBreve' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Próximas Estreias</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {comingSoonMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                >
                  <div className="relative">
                    <div className="aspect-w-2 aspect-h-3">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x450?text=Em+Breve';
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Em Breve
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{movie.genre} • {movie.duration}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Estreia em {movie.releaseDate}
                    </div>
                    <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Mais Informações</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
