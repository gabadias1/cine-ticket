"use client";

import { useState } from "react";

export default function PageAssentos() {
    const layouts = {
        imax: {
            name: "IMAX Premium",
            description: "Tela gigante de 300m² com som Dolby Atmos",
            features: ["Som Dolby Atmos", "Poltronas reclináveis premium", "Tela IMAX"],
            basePrice: 45,
            layout: [
                ["X", "X", "X", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "X", "X", "X"],
                ["X", "X", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "X", "X"],
                ["X", "W", "W", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "W", "W", "X"],
                ["A", "A", "A", "L", "L", "A", "A", "A", "A", "A", "A", "L", "L", "A", "A", "A"],
                ["A", "A", "A", "L", "L", "A", "A", "A", "A", "A", "A", "L", "L", "A", "A", "A"],
                ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
                ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
                ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
            ]
        },

        vip: {
            name: "VIP Experience",
            description: "Sala exclusiva com serviço de comida no assento",
            features: ["Serviço de comida", "Poltronas super premium", "Menu gourmet"],
            basePrice: 60,
            layout: [
                ["X", "X", "V", "V", "V", "V", "X", "X", "X", "V", "V", "V", "V", "X", "X"],
                ["X", "V", "V", "V", "V", "V", "X", "X", "X", "V", "V", "V", "V", "V", "X"],
                ["W", "W", "V", "V", "V", "V", "X", "X", "X", "V", "V", "V", "V", "W", "W"],
                ["V", "V", "L", "L", "V", "V", "X", "X", "X", "V", "V", "L", "L", "V", "V"],
                ["V", "V", "L", "L", "V", "V", "X", "X", "X", "V", "V", "L", "L", "V", "V"],
                ["V", "V", "V", "V", "V", "V", "X", "X", "X", "V", "V", "V", "V", "V", "V"],
            ]
        },

        standard3d: {
            name: "3D Standard",
            description: "Sala com projeção 3D de última geração",
            features: ["Projeção 3D Digital", "Som Surround 7.1", "Poltronas reclináveis"],
            basePrice: 35,
            layout: [
                ["X", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "X"],
                ["A", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "A"],
                ["W", "W", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "W", "W"],
                ["A", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "A"],
                ["A", "A", "L", "L", "A", "A", "X", "X", "A", "A", "L", "L", "A", "A"],
                ["A", "A", "L", "L", "A", "A", "X", "X", "A", "A", "L", "L", "A", "A"],
                ["A", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "A"],
                ["A", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "A"],
            ]
        },

        stadium: {
            name: "Mega Stadium",
            description: "Sala stadium com tela gigante curva",
            features: ["Tela curva gigante", "Som surround personalizado", "Visão perfeita"],
            basePrice: 40,
            layout: [
                ["X", "X", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "X", "X"],
                ["X", "A", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "A", "X"],
                ["A", "A", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "A", "A"],
                ["W", "W", "A", "A", "A", "A", "A", "X", "X", "A", "A", "A", "A", "A", "W", "W"],
                ["A", "A", "L", "L", "A", "A", "A", "X", "X", "A", "A", "A", "L", "L", "A", "A"],
                ["A", "A", "L", "L", "A", "A", "A", "X", "X", "A", "A", "A", "L", "L", "A", "A"],
                ["P", "P", "P", "P", "P", "P", "P", "X", "X", "P", "P", "P", "P", "P", "P", "P"],
                ["P", "P", "P", "P", "P", "P", "P", "X", "X", "P", "P", "P", "P", "P", "P", "P"],
                ["P", "P", "P", "P", "P", "P", "P", "X", "X", "P", "P", "P", "P", "P", "P", "P"],
                ["P", "P", "P", "P", "P", "P", "P", "X", "X", "P", "P", "P", "P", "P", "P", "P"],
            ]
        }
    };

    const [currentLayout, setCurrentLayout] = useState('standard3d');
    const layout = layouts[currentLayout].layout;

    const fileiras = "ABCDEFGHIJKLMNO".split("");
    const currentHall = layouts[currentLayout];
    const precoInteira = currentHall.basePrice;
    const precoMeia = currentHall.basePrice / 2;

    const seatPrices = {
        'P': precoInteira * 1.5, // Premium
        'V': precoInteira * 2,   // VIP
        'L': precoInteira * 1.8, // Love Seat
        'A': precoInteira,       // Standard
        'W': precoInteira,       // Wheelchair
    };

    const seatTypes = {
        'P': 'Premium',
        'V': 'VIP',
        'L': 'Love Seat',
        'A': 'Standard',
        'W': 'Wheelchair',
        'X': 'Empty',
        'R': 'Reserved'
    };

    const [selecionados, setSelecionados] = useState(new Map());

    function toggleSeat(id) {
        setSelecionados(prev => {
            const novo = new Map(prev);
            if (novo.has(id)) {
                novo.delete(id);
            } else {
                novo.set(id, { ingresso: "inteira", preco: precoInteira });
            }
            return novo;
        });
    }

    function alterarTipo(id, tipo) {
        setSelecionados(prev => {
            const novo = new Map(prev);
            const assento = novo.get(id);
            if (assento) {
                assento.ingresso = tipo;
                assento.preco = tipo === "inteira" ? precoInteira : precoMeia;
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
            alert("Nenhum assento selecionado!");
            return;
        }
        const pedido = Array.from(selecionados.entries()).map(([id, info]) => ({ id, ...info }));
        alert("Pedido:\n" + JSON.stringify(pedido, null, 2));
    }

    const total = Array.from(selecionados.values()).reduce((s, v) => s + v.preco, 0);

    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 text-white bg-gray-900 min-h-screen">
            {/* Sala */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex-1">
                {/* Seletor de Sala */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">{currentHall.name}</h2>
                        <p className="text-gray-400 text-sm">{currentHall.description}</p>
                    </div>
                    <select 
                        value={currentLayout}
                        onChange={(e) => {
                            setCurrentLayout(e.target.value);
                            setSelecionados(new Map());
                        }}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    >
                        {Object.entries(layouts).map(([key, sala]) => (
                            <option key={key} value={key}>
                                {sala.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Características da Sala */}
                <div className="flex gap-4 mb-6">
                    {currentHall.features.map((feature, index) => (
                        <span key={index} className="bg-blue-900 text-xs px-3 py-1 rounded-full">
                            {feature}
                        </span>
                    ))}
                </div>

                {/* Tela */}
                <div className="bg-gray-700 text-center py-3 rounded-t-3xl mb-8 font-semibold transform -rotate-1 shadow-lg">
                    TELA
                </div>

                {/* Legenda */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-blue-500 rounded-sm"></span>Standard
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-purple-500 rounded-sm"></span>Premium
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-yellow-500 rounded-sm"></span>VIP
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-pink-500 rounded-sm"></span>Love Seat
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-sm"></span>Selecionado
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-gray-500 rounded-sm"></span>Ocupado
                    </div>
                </div>

                {/* Assentos */}
                <div
                    className="grid gap-2 justify-center items-center"
                    style={{ gridTemplateColumns: `30px repeat(${layout[0].length}, 34px)` }}
                >
                    {layout.map((row, i) => (
                        <>
                            <div key={`label-${i}`} className="text-gray-400 font-bold text-right pr-1">{fileiras[i]}</div>
                            {row.map((cell, j) => {
                                const id = `${fileiras[i]}${j + 1}`;
                                if (cell === "X") return <div key={id}></div>;
                                if (cell === "R") return (
                                    <div
                                        key={id}
                                        className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-xs"
                                        title="Ocupado"
                                    >
                                        {j + 1}
                                    </div>
                                );
                                
                                const selecionado = selecionados.has(id);
                                const getSeatColor = (type) => {
                                    if (selecionado) return "bg-green-500";
                                    switch(type) {
                                        case 'P': return "bg-purple-500";
                                        case 'V': return "bg-yellow-500";
                                        case 'L': return "bg-pink-500";
                                        case 'W': return "bg-blue-300";
                                        default: return "bg-blue-500";
                                    }
                                };

                                const isLoveSeat = cell === 'L';
                                const price = seatPrices[cell] || precoInteira;
                                
                                return (
                                    <div
                                        key={id}
                                        onClick={() => toggleSeat(id)}
                                        className={`${isLoveSeat ? 'w-8' : 'w-8'} h-8 
                                            ${isLoveSeat ? 'rounded-xl' : 'rounded-lg'}
                                            flex items-center justify-center text-xs 
                                            cursor-pointer font-bold transform hover:scale-105 
                                            transition-all duration-200 ${getSeatColor(cell)}
                                            ${selecionado ? 'ring-2 ring-white' : ''}`}
                                        title={`${seatTypes[cell]} - R$ ${price.toFixed(2)}`}
                                    >
                                        {j + 1}
                                    </div>
                                );
                            })}
                        </>

                    ))}
                </div>
            </div>

            {/* Painel lateral */}
            <div className="bg-gray-800 p-5 rounded-xl shadow-lg w-full md:w-80 flex-shrink-0">
                <h3 className="text-xl font-semibold mb-1">Reserva</h3>
                <div className="text-sm text-gray-400 mb-4">
                    <p className="mb-1">{currentHall.name}</p>
                    <p>{selecionados.size === 0 ? "Selecione uma poltrona" : `${selecionados.size} assento(s) selecionado(s)`}</p>
                </div>

                {selecionados.size > 0 && (
                    <div className="bg-gray-700 p-3 rounded-lg mb-4">
                        <h4 className="text-sm font-semibold mb-2">Assentos selecionados:</h4>
                        <ul className="space-y-3 text-sm max-h-64 overflow-y-auto">
                            {Array.from(selecionados.entries()).map(([id, info]) => {
                                const [row, number] = [id[0], id.slice(1)];
                                const seatType = layout[fileiras.indexOf(row)][number - 1];
                                const basePrice = seatPrices[seatType];
                                
                                return (
                                    <li key={id} className="bg-gray-800 p-2 rounded">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">
                                                Assento {id}
                                                <span className="ml-2 text-xs px-2 py-1 bg-gray-700 rounded-full">
                                                    {seatTypes[seatType]}
                                                </span>
                                            </span>
                                            <button 
                                                onClick={() => toggleSeat(id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <select
                                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                                                value={info.ingresso}
                                                onChange={(e) => alterarTipo(id, e.target.value)}
                                            >
                                                <option value="inteira">Inteira</option>
                                                <option value="meia">Meia</option>
                                            </select>
                                            <span className="text-green-400">
                                                R$ {(info.ingresso === "meia" ? basePrice/2 : basePrice).toFixed(2)}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Subtotal</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={limpar} 
                            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm w-full transition-colors"
                        >
                            Limpar seleção
                        </button>
                        <button 
                            onClick={pagar}
                            disabled={selecionados.size === 0}
                            className={`px-4 py-2 rounded-lg text-sm w-full transition-colors
                                ${selecionados.size === 0 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Continuar para pagamento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
