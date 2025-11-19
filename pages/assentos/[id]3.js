"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import LocationSelector from "../../components/LocationSelector";
import api from '../../utils/api';

export default function CinemaSeatsC() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { id } = router.query;
    // layout base: X = vazio, A = disponível, R = reservado
  const layout = [
    ['X','X','A','A','A','A','A','A','A','A','A','X','X'],
    ['X','X','A','A','A','A','A','A','A','A','A','X','X'],
    ['X','A','A','A','R','R','A','A','A','R','A','A','X'],
    ['X','A','A','A','A','A','A','A','A','A','A','A','X'],
    ['X','A','R','A','A','A','A','A','A','R','A','A','X'],
    ['X','A','A','A','A','A','A','A','A','A','A','A','X'],
    ['X','R','R','A','A','A','R','R','R','A','A','A','X'],
    ['A','A','A','A','A','A','A','A','A','A','A','A','A'],
    ['A','A','A','A','R','R','R','R','R','A','A','A','A'],
    ['A','A','A','A','A','A','A','A','A','A','A','A','A'],
    ['A','R','R','R','A','R','R','A','A','A','A','A','A'],
    ['A','A','A','A','A','A','A','A','A','A','A','A','A'],
  ];

  const fileiras = 'ABCDEFGHIJKL'.split('').slice(0, layout.length);
  const precoInteira = 30;
  const precoMeia = 15;

  const [selecionados, setSelecionados] = useState(new Map());
  const [movieTitle, setMovieTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');

  useEffect(() => {
    const { movieId } = router.query;
    if (!movieId) return;
    (async () => {
      try {
        const movies = await api.getMovies();
        const mv = movies.find(m => m.id === parseInt(movieId));
        if (mv) setMovieTitle(mv.title);
      } catch (e) {
        console.error('Erro ao buscar filme em assentos C:', e);
      }
    })();
  }, [router.query]);

  useEffect(() => {
    const { sessionId } = router.query;
    if (!sessionId) return;
    (async () => {
      try {
        const sessions = await api.getSessions();
        const s = sessions.find(x => x.id === parseInt(sessionId));
        let startsAt = null;
        if (s && s.startsAt) startsAt = s.startsAt;
        if (!startsAt && router.query.sessionStartsAt) startsAt = router.query.sessionStartsAt;
        if (startsAt) {
          const date = new Date(startsAt);
          const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
          setSessionTime(time);
        }
      } catch (e) {
        console.error('Erro ao buscar sessão em assentos C:', e);
      }
    })();
  }, [router.query]);

  const toggleSeat = (seatId) => {
    setSelecionados(prev => {
      const novo = new Map(prev);
      if (novo.has(seatId)) novo.delete(seatId); else novo.set(seatId, { ingresso: 'inteira', preco: precoInteira });
      return novo;
    });
  };

  const alterarTipo = (id, tipo) => {
    setSelecionados(prev => {
      const novo = new Map(prev);
      const assento = novo.get(id);
      if (assento) {
        assento.ingresso = tipo;
        assento.preco = tipo === 'inteira' ? precoInteira : precoMeia;
        novo.set(id, assento);
      }
      return novo;
    });
  };

  const limpar = () => setSelecionados(new Map());

  const pagar = () => {
    if (selecionados.size === 0) { 
      alert('Nenhum assento selecionado!'); 
      return; 
    }
    if (!user) { 
      alert('Você precisa estar logado para comprar ingressos!'); 
      router.push('/login'); 
      return; 
    }
    
    // Preparar dados dos ingressos
    const { movieId, sessionId } = router.query;
    const ingressos = Array.from(selecionados.entries()).map(([seatId, info]) => ({
      seatId: seatId,
      sessionId: parseInt(sessionId),
      tipo: info.ingresso,
      preco: info.preco
    }));
    
    // Salvar dados no sessionStorage para recuperar na página de pagamento
    sessionStorage.setItem('ingressoData', JSON.stringify(ingressos));
    
    // Redirecionar para a página de pagamento
    router.push(`/pagamento?ingressos=${encodeURIComponent(JSON.stringify(ingressos))}`);
  };

  const total = Array.from(selecionados.values()).reduce((s, v) => s + v.preco, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button onClick={() => router.push("/")} className="flex items-center space-x-3 h-10">
              <img src="/images/logo.png" alt="CineTicket" className="h-full w-auto object-contain" />
            </button>
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
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
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
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8 p-6 text-gray-900 bg-white rounded-xl shadow-lg">
          <div className="bg-white p-6 rounded-xl shadow-lg flex-1 flex flex-col items-center">
            <div className="w-full">
              <div className="text-gray-700 font-semibold mb-2">{movieTitle || 'Selecionando Filme'}{sessionTime ? ` — ${sessionTime}` : ''}</div>
        <div className="bg-blue-600 text-white text-center py-2 rounded-md mb-4 font-semibold">TELA</div>

        <div className="flex justify-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-500 rounded-sm"/>Disponível</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded-sm"/>Selecionado</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-gray-400 rounded-sm"/>Ocupado</div>
        </div>

        <div className="flex flex-col gap-2 items-center">
          {layout.map((row, i) => (
            <div key={`row-${i}`} className="flex gap-2 items-center">
              <div className="text-gray-400 font-bold w-6 text-right">{fileiras[i]}</div>
              {row.map((cell, j) => {
                const id = `${fileiras[i]}${j+1}`;
                if (cell === 'X') return <div key={id} className="w-8 h-8" />;
                if (cell === 'R') return <div key={id} className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">{j+1}</div>;
                const selecionado = selecionados.has(id);
                return (
                  <button key={id} onClick={() => toggleSeat(id)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selecionado ? 'bg-green-500 text-white' : 'bg-blue-500 text-gray-900 hover:bg-blue-400'}`}>
                    {j+1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
    </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-lg w-72">
            <h3 className="text-xl font-semibold mb-1">Reserva</h3>
            <p className="text-gray-500 mb-2">{selecionados.size === 0 ? 'Selecione uma poltrona' : `${selecionados.size} assento(s) selecionado(s)`}</p>
            <ul className="space-y-2 text-sm mb-4">
              {Array.from(selecionados.entries()).map(([id, info]) => (
                <li key={id} className="flex items-center justify-between">
                  <span>{id}</span>
                  <select className="bg-gray-50 border border-gray-300 rounded px-1 text-gray-900 text-xs" value={info.ingresso} onChange={(e) => alterarTipo(id, e.target.value)}>
                    <option value="inteira">Inteira</option>
                    <option value="meia">Meia</option>
                  </select>
                  <span>R$ {info.preco.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="font-bold mb-4 border-t border-gray-200 pt-3">Total: R$ {total.toFixed(2)}</div>
            <div className="flex gap-2">
              <button onClick={limpar} className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-sm flex-1 transition-colors text-white">Limpar</button>
              <button onClick={pagar} className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm flex-1 transition-colors text-white">Pagar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}