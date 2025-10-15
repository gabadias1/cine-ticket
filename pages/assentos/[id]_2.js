'use client';

import { useState } from 'react';

type AssentoInfo = { ingresso: 'inteira' | 'meia'; preco: number };

export default function PageAssentos() {
  // layout base: X = vazio, A = disponível, R = reservado
  const layout = [
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
    ['A', 'A', 'A', 'A', 'A', 'A', 'X', 'A', 'A', 'A', 'A', 'A', 'A'],
  ];

  const fileiras = 'ABCDEFGHI'.split(''); // Corrigido para 9 fileiras
  const precoInteira = 30;
  const precoMeia = 15;

  const [selecionados, setSelecionados] = useState<Map<string, AssentoInfo>>(
    new Map()
  );

  // Função para calcular o número real do assento ignorando os vazios
  function getNumeroAssento(row: string[], colIndex: number): number {
    let count = 0;
    for (let i = 0; i <= colIndex; i++) {
      if (row[i] !== 'X') {
        count++;
      }
    }
    return count;
  }

  function toggleSeat(fileira: string, numero: number, idReal: string) {
    setSelecionados((prev) => {
      const novo = new Map(prev);
      if (novo.has(idReal)) {
        novo.delete(idReal);
      } else {
        novo.set(idReal, { ingresso: 'inteira', preco: precoInteira });
      }
      return novo;
    });
  }

  function alterarTipo(id: string, tipo: 'inteira' | 'meia') {
    setSelecionados((prev) => {
      const novo = new Map(prev);
      const assento = novo.get(id);
      if (assento) {
        assento.ingresso = tipo;
        assento.preco = tipo === 'inteira' ? precoInteira : precoMeia;
        novo.set(id, assento);
      }
      return novo;
    });
  }

  function limpar() {
    setSelecionados(new Map());
  }

  function pagar() {
    if (selecionados.size === 0) {
      alert('Nenhum assento selecionado!');
      return;
    }
    const pedido = Array.from(selecionados.entries()).map(([id, info]) => ({
      id,
      ...info,
    }));
    alert('Pedido:\n' + JSON.stringify(pedido, null, 2));
  }

  const total = Array.from(selecionados.values()).reduce(
    (s, v) => s + v.preco,
    0
  );

  return (
    <div className="flex gap-8 p-6 text-white bg-gray-900 min-h-screen">
      {/* Sala */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="bg-gray-700 text-center py-2 rounded-md mb-4 font-semibold">
          TELA
        </div>

        <div className="flex justify-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded-sm"></span>Disponível
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-sm"></span>Selecionado
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-500 rounded-sm"></span>Ocupado
          </div>
        </div>

        <div
          className="grid gap-2 justify-center items-center"
          style={{
            gridTemplateColumns: `30px repeat(${layout[0].length}, 34px)`,
          }}
        >
          {layout.map((row, i) => (
            <div key={`row-${i}`} className="contents">
              <div
                className="text-gray-400 font-bold text-right pr-1"
              >
                {fileiras[i]}
              </div>
              {row.map((cell, j) => {
                const numeroAssento = getNumeroAssento(row, j);
                const idReal = `${fileiras[i]}${numeroAssento}`;
                
                if (cell === 'X') return <div key={`${i}-${j}`}></div>;
                if (cell === 'R') {
                  return (
                    <div
                      key={`${i}-${j}`}
                      className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs"
                    >
                      {numeroAssento}
                    </div>
                  );
                }
                const selecionado = selecionados.has(idReal);
                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => toggleSeat(fileiras[i], numeroAssento, idReal)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer font-bold ${
                      selecionado
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-gray-900 hover:opacity-80'
                    }`}
                  >
                    {numeroAssento}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Painel lateral */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-lg w-72">
        <h3 className="text-xl font-semibold mb-1">Reserva</h3>
        <p className="text-gray-400 mb-2">
          {selecionados.size === 0
            ? 'Selecione uma poltrona'
            : `${selecionados.size} assento(s) selecionado(s)`}
        </p>
        <ul className="space-y-2 text-sm">
          {Array.from(selecionados.entries()).map(([id, info]) => (
            <li key={id} className="flex items-center justify-between">
              <span>{id}</span>
              <select
                className="bg-gray-700 border border-gray-600 rounded px-1 text-white text-xs"
                value={info.ingresso}
                onChange={(e) =>
                  alterarTipo(id, e.target.value as 'inteira' | 'meia')
                }
              >
                <option value="inteira">Inteira</option>
                <option value="meia">Meia</option>
              </select>
              <span>R$ {info.preco.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="font-bold mt-3">Total: R$ {total.toFixed(2)}</div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={limpar}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Limpar
          </button>
          <button
            onClick={pagar}
            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  );
}