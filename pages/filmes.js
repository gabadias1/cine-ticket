import { useRouter } from 'next/router';

export default function Filmes() {
  const router = useRouter();
  
  const allMovies = [
    {
      id: 1,
      title: 'Invocação do mal 4',
      genre: 'Ficção Científica',
      duration: '2h 46min',
      rating: '14',
      imdbRating: '8.8',
      image: '/images/movies/invocacao4.jpg',
      sessions: [
        {
          time: '15:30',
          room: {
            name: 'Sala IMAX',
            type: 'IMAX',
            features: ['Tela gigante IMAX', 'Som Dolby Atmos', 'Poltronas reclináveis'],
            price: 45.00
          }
        },
        {
          time: '18:00',
          room: {
            name: 'Sala VIP',
            type: 'VIP',
            features: ['Serviço de comida', 'Poltronas super confortáveis', 'Menu exclusivo'],
            price: 55.00
          }
        },
        {
          time: '20:30',
          room: {
            name: 'Sala 3D',
            type: '3D',
            features: ['Projeção 3D de última geração', 'Som surround'],
            price: 35.00
          }
        }
      ]
    },
    {
      id: 2,
      title: 'Demon Slayer: Kimetsu No Yaiba - Castelo Infinito',
      genre: 'Animação',
      duration: '2h 35min',
      rating: '18',
      imdbRating: '8.4',
      image: '/images/movies/demonslayer.jpg',
      sessions: [
        {
          time: '14:00',
          room: {
            name: 'Sala IMAX',
            type: 'IMAX',
            features: ['Tela gigante IMAX', 'Som Dolby Atmos', 'Poltronas reclináveis'],
            price: 45.00
          }
        },
        {
          time: '16:40',
          room: {
            name: 'Sala D-BOX',
            type: 'D-BOX',
            features: ['Poltronas com movimento', 'Som imersivo', 'Efeitos especiais'],
            price: 50.00
          }
        },
        {
          time: '19:20',
          room: {
            name: 'Sala 4DX',
            type: '4DX',
            features: ['Efeitos especiais 4D', 'Movimentos sincronizados', 'Experiência imersiva'],
            price: 60.00
          }
        }
      ]
    },
    {
      id: 3,
      title: 'Os caras malvados 2',
      genre: 'Animação',
      duration: '2h 32min',
      rating: '12',
      imdbRating: '8.2',
      image: '/images/movies/oscaras2.jpg',
      sessions: [
        {
          time: '13:30',
          room: {
            name: 'Sala Kids',
            type: 'KIDS',
            features: ['Poltronas coloridas', 'Playground', 'Ambiente família'],
            price: 30.00
          }
        },
        {
          time: '16:00',
          room: {
            name: 'Sala 3D',
            type: '3D',
            features: ['Projeção 3D de última geração', 'Som surround'],
            price: 35.00
          }
        },
        {
          time: '21:00',
          room: {
            name: 'Sala Standard',
            type: 'STANDARD',
            features: ['Projeção digital', 'Som digital'],
            price: 25.00
          }
        }
      ]
    },
    {
      id: 4,
      title: 'Kung Fu Panda 4',
      genre: 'Animação',
      duration: '1h 34min',
      rating: 'L',
      imdbRating: '7.9',
      image: '/images/movies/kungfu-panda4.jpg',
      sessions: [
        {
          time: '14:30',
          room: {
            name: 'Sala Kids',
            type: 'KIDS',
            features: ['Poltronas coloridas', 'Playground', 'Ambiente família'],
            price: 30.00
          }
        },
        {
          time: '16:30',
          room: {
            name: 'Sala IMAX 3D',
            type: 'IMAX3D',
            features: ['IMAX 3D', 'Som Dolby Atmos', 'Tela gigante'],
            price: 50.00
          }
        },
        {
          time: '18:30',
          room: {
            name: 'Sala D-BOX',
            type: 'D-BOX',
            features: ['Poltronas com movimento', 'Som imersivo', 'Efeitos especiais'],
            price: 50.00
          }
        }
      ]
    },
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
                className="text-white hover:text-blue-200 transition-colors underline underline-offset-4"
              >
                Filmes
              </button>
              <button
                onClick={() => router.push('/eventos')}
                className="text-white hover:text-blue-200 transition-colors"
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Todos os Filmes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allMovies.map((movie) => (
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
                  IMDb {movie.imdbRating || '?'}
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
                  {movie.sessions ? (
                    <>
                      <div className="mb-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Sessões disponíveis:</div>
                        {movie.sessions.map((session, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{session.time}</span>
                              </div>
                              <span className="text-blue-600 font-semibold">
                                R$ {session.room.price.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800 mb-1">
                                {session.room.name}
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {session.room.type}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {session.room.features.join(' • ')}
                              </div>
                            </div>
                            <button
                              onClick={() => router.push({
                                pathname: `/assentos/${movie.id}`,
                                query: {
                                  time: session.time,
                                  room: session.room.name
                                }
                              })}
                              className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              <span>Selecionar assentos</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Estreia em {movie.releaseDate}
                      </div>
                      <button
                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Mais Informações</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
