'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function PageCinemas() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const filmeId = searchParams?.get('filmeId') || 'filme-teste';
  const filmeTitulo = searchParams?.get('titulo') || 'Filme de Teste';
  
  const focusSearchInput = () => {
    router.push({
      pathname: '/filmes',
      query: { focusSearch: true }
    });
  };

  // Próximos 3 dias
  const [dataSelecionada, setDataSelecionada] = useState(0); // 0 = hoje, 1 = amanhã, etc.
  
  const datas = [
    new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'numeric' }),
    new Date(Date.now() + 86400000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'numeric' }),
    new Date(Date.now() + 172800000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'numeric' })
  ];

  const cinema = {
    id: 'cinemax-center',
    nome: 'Cinemax Center',
    endereco: 'Av. Principal, 1000 - Centro',
    salas: [
      {
        numero: 1,
        nome: 'Sala 1',
        layout: 1, // Usa [id]1.js
        descricao: 'Capacidade: 114 lugares',
        cor: 'bg-blue-600',
        horarios: ['14:30', '17:00', '19:30']
      },
      {
        numero: 2,
        nome: 'Sala 2',
        layout: 2, // Usa [id]2.js
        descricao: 'Capacidade: 108 lugares',
        cor: 'bg-blue-600',
        horarios: ['15:00', '18:00', '21:00']
      },
      {
        numero: 3,
        nome: 'Sala 3',
        layout: 3, // Usa [id]3.js
        descricao: 'Capacidade: 120 lugares',
        cor: 'bg-blue-600',
        horarios: ['16:30', '19:00', '21:30']
      }
    ]
};

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 4l2 4h-7l-2-4h7zM4 4l2 4H2l2-4zm2 16l-2-4h7l2 4H6zm14-4l2-4h-7l-2 4h7z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>CineTicket</h1>
            </div>
            
            {/* Location Selector */}
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="text-blue-600 font-medium text-sm">São Paulo</span>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            
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
              onClick={focusSearchInput}
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
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{filmeTitulo}</h1>
          <p className="text-gray-600">Escolha uma sala e horário</p>
        </div>
        
        {/* Seleção de data */}
        <div className="mb-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {datas.map((data, index) => (
              <button
                key={index}
                onClick={() => setDataSelecionada(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  dataSelecionada === index ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {data}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cinema e suas salas */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1 text-gray-900">{cinema.nome}</h2>
            <p className="text-gray-600 text-sm">{cinema.endereco}</p>
          </div>

          {/* Grid de salas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cinema.salas.map((sala) => (
              <div key={sala.numero} className={`${sala.cor} rounded-xl p-6 shadow-lg`}>
                <h3 className="text-lg font-bold mb-2">Sala {sala.numero} - {sala.nome}</h3>
                <p className="text-sm mb-4 opacity-90">{sala.descricao}</p>
                
                <div className="space-y-2">
                  {sala.horarios.map((horario) => (
                    <Link
                      key={horario}
                      href={`/assentos/${sala.layout}?filmeId=${filmeId}&titulo=${filmeTitulo}&sala=${sala.numero}&horario=${horario}&data=${datas[dataSelecionada]}`}
                      className="block"
                    >
                      <button 
                        className="w-full bg-black bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg transition-all duration-200 hover:transform hover:scale-105 flex items-center justify-between"
                        title={`${filmeTitulo} - Sala ${sala.numero} - ${horario}`}
                      >
                        <span className="font-bold">{horario}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Informações Gerais */}
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-800 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Informações Gerais</h3>
        <div className="space-y-2 text-gray-400">
          <p className="text-sm">• Todas as salas possuem ar condicionado</p>
          <p className="text-sm">• Classificação indicativa conforme indicado na programação</p>
          <p className="text-sm">• Compre com antecedência para garantir os melhores lugares</p>
        </div>
      </div>
    </div>
  );
}