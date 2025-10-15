'use client';

import { useState } from 'react';

type TipoIngresso = 'inteira' | 'meia' | 'estudante' | 'idoso' | 'vip';

interface Area {
  nome: string;
  precoBase: number;
  cor: string;
  descricao: string;
}

interface Selecionado {
  area: Area;
  tipo: TipoIngresso;
  qtd: number;
}

export default function TeatroPage() {
  // Áreas do teatro
  const areas: Area[] = [
    {
      nome: 'Plateia Premium',
      precoBase: 150,
      cor: 'bg-purple-600',
      descricao: 'Melhor vista do palco'
    },
    {
      nome: 'Plateia',
      precoBase: 100,
      cor: 'bg-orange-500',
      descricao: 'Vista privilegiada'
    },
    {
      nome: 'Balcão A',
      precoBase: 80,
      cor: 'bg-green-600',
      descricao: 'Vista superior frontal'
    },
    {
      nome: 'Balcão B',
      precoBase: 60,
      cor: 'bg-blue-600',
      descricao: 'Vista superior lateral'
    },
    {
      nome: 'Acessível',
      precoBase: 40,
      cor: 'bg-red-600',
      descricao: 'Acesso facilitado'
    },
  ];

  const tipos: Record<TipoIngresso, { multiplicador: number; label: string }> =
    {
      inteira: { multiplicador: 1.0, label: 'Inteira' },
      meia: { multiplicador: 0.5, label: 'Meia Entrada' },
      estudante: { multiplicador: 0.4, label: 'Estudante' },
      idoso: { multiplicador: 0.5, label: 'Idoso' },
      vip: { multiplicador: 1.5, label: 'VIP' },
    };

  const [selecionados, setSelecionados] = useState<Map<string, Selecionado>>(
    new Map()
  );

  function toggleArea(area: Area) {
    setSelecionados((prev) => {
      const novo = new Map(prev);
      if (novo.has(area.nome)) {
        novo.delete(area.nome);
      } else {
        novo.set(area.nome, { area, tipo: 'inteira', qtd: 1 });
      }
      return novo;
    });
  }

  function alterarTipo(area: string, tipo: TipoIngresso) {
    setSelecionados((prev) => {
      const novo = new Map(prev);
      const atual = novo.get(area);
      if (atual) {
        atual.tipo = tipo;
        novo.set(area, atual);
      }
      return novo;
    });
  }

  function alterarQtd(area: string, qtd: number) {
    if (qtd < 1) qtd = 1;
    if (qtd > 10) qtd = 10;

    setSelecionados((prev) => {
      const novo = new Map(prev);
      const atual = novo.get(area);
      if (atual) {
        atual.qtd = qtd;
        novo.set(area, atual);
      }
      return novo;
    });
  }

  function limpar() {
    setSelecionados(new Map());
  }

  function pagar() {
    if (selecionados.size === 0) {
      alert('Nenhuma área selecionada!');
      return;
    }

    const pedido = Array.from(selecionados.entries()).map(([nome, info]) => ({
      area: nome,
      tipo: tipos[info.tipo].label,
      quantidade: info.qtd,
      valorUnitario: `R$ ${(
        info.area.precoBase * tipos[info.tipo].multiplicador
      ).toFixed(2)}`,
      total: `R$ ${(
        info.area.precoBase *
        tipos[info.tipo].multiplicador *
        info.qtd
      ).toFixed(2)}`,
    }));

    const mensagem = ` PEDIDO CONFIRMADO \n\n${pedido
      .map(
        (item) =>
          `• ${item.area}\n  ${item.tipo} - ${item.quantidade}x (${item.valorUnitario})\n  Total: ${item.total}`
      )
      .join('\n\n')}\n\nTOTAL GERAL: R$ ${total.toFixed(2)}`;

    alert(mensagem);
  }

  const total = Array.from(selecionados.values()).reduce(
    (s, v) => s + v.area.precoBase * tipos[v.tipo].multiplicador * v.qtd,
    0
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex gap-6">
      {/* Mapa Visual do Teatro */}
      <div className="flex-1 bg-gray-800 rounded-2xl p-6 flex flex-col items-center shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-center">Visual do Teatro</h2>

        <div className="w-full max-w-2xl space-y-4">
          {/* Palco */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <span className="text-2xl font-bold tracking-wider">
              PALCO
            </span>
          </div>

          {/* Áreas do Teatro */}
          <div className="grid grid-cols-1 gap-4">
            {/* Plateia Premium */}
            <div className="flex gap-4">
              <div
                className={`flex-1 h-24 rounded-xl ${
                  areas[0].cor
                } p-4 flex flex-col justify-center shadow-lg ${
                  selecionados.has(areas[0].nome)
                    ? 'ring-4 ring-white ring-opacity-50'
                    : ''
                }`}
              >
                <div className="font-bold text-sm">{areas[0].nome}</div>
                <div className="text-xs opacity-90">{areas[0].descricao}</div>
              </div>
            </div>

            {/* Plateia */}
            <div className="flex gap-4">
              <div
                className={`flex-1 h-20 rounded-xl ${
                  areas[1].cor
                } p-4 flex flex-col justify-center shadow-lg ${
                  selecionados.has(areas[1].nome)
                    ? 'ring-4 ring-white ring-opacity-50'
                    : ''
                }`}
              >
                <div className="font-bold text-sm">{areas[1].nome}</div>
                <div className="text-xs opacity-90">{areas[1].descricao}</div>
              </div>
            </div>

            {/* Balcões e Acessível */}
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`h-20 rounded-xl ${
                  areas[2].cor
                } p-3 flex flex-col justify-center shadow-lg ${
                  selecionados.has(areas[2].nome)
                    ? 'ring-4 ring-white ring-opacity-50'
                    : ''
                }`}
              >
                <div className="font-bold text-xs">{areas[2].nome}</div>
              </div>

              <div
                className={`h-20 rounded-xl ${
                  areas[4].cor
                } p-3 flex flex-col justify-center shadow-lg ${
                  selecionados.has(areas[4].nome)
                    ? 'ring-4 ring-white ring-opacity-50'
                    : ''
                }`}
              >
                <div className="font-bold text-xs">{areas[4].nome}</div>
              </div>

              <div
                className={`h-20 rounded-xl ${
                  areas[3].cor
                } p-3 flex flex-col justify-center shadow-lg ${
                  selecionados.has(areas[3].nome)
                    ? 'ring-4 ring-white ring-opacity-50'
                    : ''
                }`}
              >
                <div className="font-bold text-xs">{areas[3].nome}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seleção de Áreas */}
      <div className="flex-1 bg-gray-800 rounded-2xl p-6 flex flex-col shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-center">Selecionar Áreas</h2>

        <div className="grid grid-cols-1 gap-4">
          {areas.map((area) => {
            const ativo = selecionados.has(area.nome);
            return (
              <button
                key={area.nome}
                onClick={() => toggleArea(area)}
                className={`${
                  area.cor
                } rounded-xl p-4 text-left transition-all duration-300 shadow-lg ${
                  ativo
                    ? 'ring-4 ring-white ring-opacity-70 transform scale-105'
                    : 'hover:opacity-90 hover:transform hover:scale-102'
                }`}
              >
                <div className="font-bold text-lg">{area.nome}</div>
                <div className="text-sm opacity-90">{area.descricao}</div>
                <div className="font-semibold mt-2 text-lg">
                  R$ {area.precoBase.toFixed(2)}
                </div>
                {ativo && (
                  <div className="text-xs mt-1 bg-black bg-opacity-20 px-2 py-1 rounded">
                   Selecionada
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel de Reserva */}
      <div className="w-80 bg-gray-800 rounded-2xl p-6 flex flex-col shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center"> Reserva</h2>

        {selecionados.size === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <p className="text-center">
              Selecione uma área para começar sua reserva
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4">
              {Array.from(selecionados.values()).map((sel) => (
                <div
                  key={sel.area.nome}
                  className="bg-gray-700 rounded-lg p-4 shadow-lg"
                >
                  <div className="font-bold text-lg mb-2">{sel.area.nome}</div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Tipo:</label>
                      <select
                        className="bg-gray-600 border border-gray-500 rounded px-3 py-1 text-sm w-32"
                        value={sel.tipo}
                        onChange={(e) =>
                          alterarTipo(
                            sel.area.nome,
                            e.target.value as TipoIngresso
                          )
                        }
                      >
                        {Object.entries(tipos).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Quantidade:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alterarQtd(sel.area.nome, sel.qtd - 1)}
                          className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">
                          {sel.qtd}
                        </span>
                        <button
                          onClick={() => alterarQtd(sel.area.nome, sel.qtd + 1)}
                          className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-bold text-green-400">
                        R${' '}
                        {(
                          sel.area.precoBase *
                          tipos[sel.tipo].multiplicador *
                          sel.qtd
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Total:</span>
                <span className="text-green-400 text-xl">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={limpar}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={pagar}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 roundedtext-sm"
                >
                  Pagar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}