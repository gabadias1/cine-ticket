"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function CinemaSeatsC() {
  const router = useRouter();
  const { user } = useAuth();
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
    if (selecionados.size === 0) { alert('Nenhum assento selecionado!'); return; }
    if (!user) { alert('Você precisa estar logado para comprar ingressos!'); router.push('/login'); return; }
    const pedido = Array.from(selecionados.entries()).map(([id, info]) => ({ id, ...info }));
    alert('Pedido:\n' + JSON.stringify(pedido, null, 2));
  };

  const total = Array.from(selecionados.values()).reduce((s, v) => s + v.preco, 0);

  return (
    <div className="flex gap-8 p-6 text-gray-900 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-lg">
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
  );
}