'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';

export default function TeatroPage() {
  const router = useRouter();
  const { id } = router.query;
  // Áreas do teatro
  const areas = [
    { nome: 'Plateia Premium', precoBase: 150, cor: 'bg-purple-600', descricao: 'Melhor vista do palco' },
    { nome: 'Plateia', precoBase: 100, cor: 'bg-orange-500', descricao: 'Vista privilegiada' },
    { nome: 'Balcão A', precoBase: 80, cor: 'bg-green-600', descricao: 'Vista superior frontal' },
    { nome: 'Balcão B', precoBase: 60, cor: 'bg-blue-600', descricao: 'Vista superior lateral' },
    { nome: 'Acessível', precoBase: 40, cor: 'bg-red-600', descricao: 'Acesso facilitado' },
  ];

  const tipos = {
    inteira: { multiplicador: 1.0, label: 'Inteira' },
    meia: { multiplicador: 0.5, label: 'Meia Entrada' },
    estudante: { multiplicador: 0.4, label: 'Estudante' },
    idoso: { multiplicador: 0.5, label: 'Idoso' },
    vip: { multiplicador: 1.5, label: 'VIP' },
  };

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
        console.error('Erro ao buscar filme em assentos 4:', e);
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
        console.error('Erro ao buscar sessão em assentos 4:', e);
      }
    })();
  }, [router.query]);

  function toggleArea(area) {
    setSelecionados(prev => {
      const novo = new Map(prev);
      if (novo.has(area.nome)) novo.delete(area.nome); else novo.set(area.nome, { area, tipo: 'inteira', qtd: 1 });
      return novo;
    });
  }

  function alterarTipo(areaNome, tipo) {
    setSelecionados(prev => {
      const novo = new Map(prev);
      const atual = novo.get(areaNome);
      if (atual) { atual.tipo = tipo; novo.set(areaNome, atual); }
      return novo;
    });
  }

  function alterarQtd(areaNome, qtd) {
    if (qtd < 1) qtd = 1;
    if (qtd > 10) qtd = 10;
    setSelecionados(prev => {
      const novo = new Map(prev);
      const atual = novo.get(areaNome);
      if (atual) { atual.qtd = qtd; novo.set(areaNome, atual); }
      return novo;
    });
  }

  function limpar() { setSelecionados(new Map()); }

  function pagar() {
    if (selecionados.size === 0) { 
      alert('Nenhuma área selecionada!'); 
      return; 
    }
    if (!user) {
      alert('Você precisa estar logado para comprar ingressos!');
      router.push('/login');
      return;
    }

    // Preparar dados dos ingressos de evento
    const { eventId } = router.query;
    const ingressos = Array.from(selecionados.entries()).map(([areaNome, info]) => {
      const preco = info.area.precoBase * tipos[info.tipo].multiplicador;
      return {
        areaNome: areaNome,
        tipo: tipos[info.tipo].label,
        eventId: parseInt(eventId),
        quantidade: info.qtd,
        precoUnitario: preco,
        preco: preco * info.qtd
      };
    });

    // Salvar dados no sessionStorage
    sessionStorage.setItem('ingressoData', JSON.stringify(ingressos));

    // Redirecionar para a página de pagamento
    router.push(`/pagamento?ingressos=${encodeURIComponent(JSON.stringify(ingressos))}`);
  }

  const total = Array.from(selecionados.values()).reduce((s, v) => s + v.area.precoBase * tipos[v.tipo].multiplicador * v.qtd, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 p-6 flex gap-6">
      {/* Mapa Visual do Teatro */}
      <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col items-center shadow-xl">
  <h2 className="text-xl font-bold mb-2 text-center">{movieTitle || 'Selecionando Filme'}{sessionTime ? ` — ${sessionTime}` : ''}</h2>
  <h3 className="text-sm text-gray-600 mb-4">Visual do Teatro</h3>

        <div className="w-full max-w-2xl space-y-4">
          {/* Palco */}
          <div className="bg-gray-700 py-8 rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-500">
            <span className="text-2xl font-bold tracking-wider">PALCO</span>
          </div>


          {/* Áreas do Teatro */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-4">
              <div className={`flex-1 h-24 rounded-xl ${areas[0].cor} p-4 flex flex-col justify-center shadow-lg ${selecionados.has(areas[0].nome) ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
                <div className="font-bold text-sm">{areas[0].nome}</div>
                <div className="text-xs opacity-90">{areas[0].descricao}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`flex-1 h-20 rounded-xl ${areas[1].cor} p-4 flex flex-col justify-center shadow-lg ${selecionados.has(areas[1].nome) ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
                <div className="font-bold text-sm">{areas[1].nome}</div>
                <div className="text-xs opacity-90">{areas[1].descricao}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className={`h-20 rounded-xl ${areas[2].cor} p-3 flex flex-col justify-center shadow-lg ${selecionados.has(areas[2].nome) ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
                <div className="font-bold text-xs">{areas[2].nome}</div>
              </div>
              <div className={`h-20 rounded-xl ${areas[4].cor} p-3 flex flex-col justify-center shadow-lg ${selecionados.has(areas[4].nome) ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
                <div className="font-bold text-xs">{areas[4].nome}</div>
              </div>
              <div className={`h-20 rounded-xl ${areas[3].cor} p-3 flex flex-col justify-center shadow-lg ${selecionados.has(areas[3].nome) ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
                <div className="font-bold text-xs">{areas[3].nome}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seleção de Áreas */}
      <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-center">Selecionar Áreas</h2>

        <div className="grid grid-cols-1 gap-4">
          {areas.map((area) => {
            const ativo = selecionados.has(area.nome);
            return (
              <button key={area.nome} onClick={() => toggleArea(area)} className={`${area.cor} rounded-xl p-4 text-left transition-all duration-300 shadow-lg ${ativo ? 'ring-4 ring-white ring-opacity-70 transform scale-105' : 'hover:opacity-90 hover:transform hover:scale-102'}`}>
                <div className="font-bold text-lg">{area.nome}</div>
                <div className="text-sm opacity-90">{area.descricao}</div>
                <div className="font-semibold mt-2 text-lg">R$ {area.precoBase.toFixed(2)}</div>
                {ativo && <div className="text-xs mt-1 bg-black bg-opacity-20 px-2 py-1 rounded">Selecionada</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel de Reserva */}
      <div className="w-80 bg-white rounded-2xl p-6 flex flex-col shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center"> Reserva</h2>

        {selecionados.size === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500"><p className="text-center">Selecione uma área para começar sua reserva</p></div>
        ) : (
          <>
            <div className="flex-1 space-y-4">
              {Array.from(selecionados.values()).map((sel) => (
                <div key={sel.area.nome} className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <div className="font-bold text-lg mb-2">{sel.area.nome}</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Tipo:</label>
                      <select className="bg-white border border-gray-300 rounded px-3 py-1 text-sm w-32" value={sel.tipo} onChange={(e) => alterarTipo(sel.area.nome, e.target.value)}>
                        {Object.entries(tipos).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Quantidade:</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => alterarQtd(sel.area.nome, sel.qtd - 1)} className="w-6 h-6 bg-gray-100 text-gray-700 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-200">-</button>
                        <span className="w-8 text-center font-bold">{sel.qtd}</span>
                        <button onClick={() => alterarQtd(sel.area.nome, sel.qtd + 1)} className="w-6 h-6 bg-gray-100 text-gray-700 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-200">+</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-bold text-green-600">R$ {(sel.area.precoBase * tipos[sel.tipo].multiplicador * sel.qtd).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Total:</span>
                <span className="text-green-600 text-xl">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={limpar} className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg font-semibold transition-colors text-white">Limpar</button>
                <button onClick={pagar} className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-semibold transition-colors text-white">Finalizar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}