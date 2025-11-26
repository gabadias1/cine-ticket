import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { ArrowLeft, Check, Info, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function SeatSelection() {
    const router = useRouter();
    const { user } = useAuth();
    const { id } = router.query;
    const isCinema = !!router.query.sessionId;

    // --- Common State ---
    const [movieTitle, setMovieTitle] = useState('');
    const [sessionTime, setSessionTime] = useState('');
    const [eventMeta, setEventMeta] = useState({});
    const [processing, setProcessing] = useState(false);

    // --- Cinema State ---
    const [selectedSeats, setSelectedSeats] = useState([]);

    // --- Theater State ---
    const [selecionados, setSelecionados] = useState(new Map());

    // Theater Data
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

    const resolvedTitle = useMemo(() => {
        if (eventMeta.name) return eventMeta.name;
        return movieTitle || 'Evento';
    }, [eventMeta.name, movieTitle]);

    const resolvedTime = useMemo(() => {
        if (eventMeta.date && eventMeta.time) {
            return `${eventMeta.date.split('-').reverse().join('/') || eventMeta.date} — ${eventMeta.time}`;
        }
        return sessionTime;
    }, [eventMeta.date, eventMeta.time, sessionTime]);

    useEffect(() => {
        const { movieId } = router.query;
        if (!movieId) return;
        (async () => {
            try {
                const movies = await api.getMovies();
                const mv = movies.find(m => m.id === parseInt(movieId));
                if (mv) setMovieTitle(mv.title);
            } catch (e) {
                console.error('Erro ao buscar filme:', e);
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
                console.error('Erro ao buscar sessão:', e);
            }
        })();
    }, [router.query]);

    useEffect(() => {
        if (!router.isReady) return;
        const {
            eventName,
            eventCategory,
            eventDate,
            eventTime,
            basePrice
        } = router.query;

        setEventMeta({
            name: eventName,
            category: eventCategory,
            date: eventDate,
            time: eventTime,
            basePrice: (basePrice !== undefined && basePrice !== '') ? Number(basePrice) : null
        });
    }, [router.isReady, router.query]);

    // --- Cinema Logic ---
    const ticketPrice = parseFloat(router.query.price || router.query.basePrice || 0);

    const rows = useMemo(() => {
        if (!isCinema) return [];
        const rowCount = 10;
        const seatsPerRow = 12;
        const generatedRows = [];
        for (let i = 0; i < rowCount; i++) {
            const rowLabel = String.fromCharCode(65 + i);
            const seats = [];
            for (let j = 1; j <= seatsPerRow; j++) {
                const isOccupied = Math.random() < 0.2; // Mock occupancy
                seats.push({
                    id: `${rowLabel}${j}`,
                    label: `${rowLabel}${j}`,
                    status: isOccupied ? 'occupied' : 'available',
                    price: ticketPrice
                });
            }
            generatedRows.push({ label: rowLabel, seats });
        }
        return generatedRows;
    }, [isCinema, ticketPrice]);

    const toggleSeat = (seat) => {
        if (seat.status === 'occupied') return;
        const isSelected = selectedSeats.find(s => s.id === seat.id);
        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            if (selectedSeats.length >= 8) { alert('Máximo de 8 ingressos.'); return; }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    // --- Theater Logic ---
    const pricingForArea = (area) => {
        if (eventMeta.basePrice !== null && eventMeta.basePrice !== undefined) {
            return { ...area, precoBase: eventMeta.basePrice };
        }
        return area;
    };

    function toggleArea(areaDef) {
        const area = pricingForArea(areaDef);
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

    function limpar() {
        if (isCinema) setSelectedSeats([]);
        else setSelecionados(new Map());
    }

    function pagar() {
        if (isCinema && selectedSeats.length === 0) { alert('Selecione pelo menos um assento.'); return; }
        if (!isCinema && selecionados.size === 0) { alert('Nenhuma área selecionada!'); return; }

        if (!user) {
            alert('Você precisa estar logado para comprar ingressos!');
            router.push('/login');
            return;
        }

        setProcessing(true);

        let ingressos = [];
        if (isCinema) {
            ingressos = selectedSeats.map(seat => ({
                sessionId: parseInt(router.query.sessionId),
                seatId: undefined, // Backend expects ID but we have mock strings. Let's send undefined and handle in backend or ignore relation
                seatLabel: seat.label,
                price: seat.price,
                tipo: 'Inteira',
                preco: seat.price,
                quantidade: 1
            }));
        } else {
            ingressos = Array.from(selecionados.entries()).map(([areaNome, info]) => {
                const preco = info.area.precoBase * tipos[info.tipo].multiplicador;
                return {
                    areaNome: areaNome,
                    tipo: tipos[info.tipo].label,
                    eventId: parseInt(id),
                    quantidade: info.qtd,
                    precoUnitario: preco,
                    preco: preco * info.qtd
                };
            });
        }

        sessionStorage.setItem('ingressoData', JSON.stringify(ingressos));
        router.push(`/pagamento?ingressos=${encodeURIComponent(JSON.stringify(ingressos))}`);
    }

    const total = isCinema
        ? selectedSeats.length * ticketPrice
        : Array.from(selecionados.values()).reduce((s, v) => s + v.area.precoBase * tipos[v.tipo].multiplicador * v.qtd, 0);

    return (
        <Layout title={`${resolvedTitle} - Seleção de Assentos`}>
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Visual Map Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{resolvedTitle}</h1>
                                <p className="text-gray-400">{resolvedTime}</p>
                            </div>
                        </div>

                        <GlassCard className="p-8 relative overflow-hidden flex flex-col items-center">
                            <h3 className="text-sm text-gray-400 mb-8 uppercase tracking-widest">
                                {isCinema ? 'Tela' : 'Mapa do Evento'}
                            </h3>

                            <div className="w-full max-w-2xl space-y-6">
                                {/* Stage/Screen */}
                                <div className="bg-white/10 py-8 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/10 mb-8">
                                    <span className="text-2xl font-bold tracking-wider text-white/50">
                                        {isCinema ? 'TELA' : 'PALCO'}
                                    </span>
                                </div>

                                {isCinema ? (
                                    /* Cinema Layout */
                                    <div className="flex flex-col gap-3 items-center overflow-x-auto pb-4">
                                        {rows.map((row) => (
                                            <div key={row.label} className="flex items-center gap-3">
                                                <span className="w-6 text-center text-gray-500 font-medium text-sm">{row.label}</span>
                                                <div className="flex gap-2">
                                                    {row.seats.map((seat) => {
                                                        const isSelected = selectedSeats.find(s => s.id === seat.id);
                                                        let seatColor = 'bg-white/10 hover:bg-white/20 border-white/10 text-gray-400';

                                                        if (seat.status === 'occupied') {
                                                            seatColor = 'bg-white/5 border-transparent opacity-30 cursor-not-allowed';
                                                        } else if (isSelected) {
                                                            seatColor = 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]';
                                                        }

                                                        return (
                                                            <button
                                                                key={seat.id}
                                                                onClick={() => toggleSeat(seat)}
                                                                disabled={seat.status === 'occupied'}
                                                                className={`w-8 h-8 rounded-t-lg rounded-b-md border transition-all flex items-center justify-center text-xs ${seatColor}`}
                                                                title={`${seat.label} - R$ ${seat.price.toFixed(2)}`}
                                                            >
                                                                {isSelected && <Check className="w-4 h-4" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <span className="w-6 text-center text-gray-500 font-medium text-sm">{row.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Theater Layout */
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex gap-4">
                                            <div className={`flex-1 h-24 rounded-xl ${areas[0].cor} p-4 flex flex-col justify-center shadow-lg transition-all ${selecionados.has(areas[0].nome) ? 'ring-4 ring-white/50 scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
                                                <div className="font-bold text-white text-sm">{areas[0].nome}</div>
                                                <div className="text-xs text-white/80">{areas[0].descricao}</div>
                                            </div>
                                        </div>
                                        {/* ... other theater areas ... */}
                                        <div className="flex gap-4">
                                            <div className={`flex-1 h-20 rounded-xl ${areas[1].cor} p-4 flex flex-col justify-center shadow-lg transition-all ${selecionados.has(areas[1].nome) ? 'ring-4 ring-white/50 scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
                                                <div className="font-bold text-white text-sm">{areas[1].nome}</div>
                                                <div className="text-xs text-white/80">{areas[1].descricao}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className={`h-20 rounded-xl ${areas[2].cor} p-3 flex flex-col justify-center shadow-lg transition-all ${selecionados.has(areas[2].nome) ? 'ring-4 ring-white/50 scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
                                                <div className="font-bold text-white text-xs">{areas[2].nome}</div>
                                            </div>
                                            <div className={`h-20 rounded-xl ${areas[4].cor} p-3 flex flex-col justify-center shadow-lg transition-all ${selecionados.has(areas[4].nome) ? 'ring-4 ring-white/50 scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
                                                <div className="font-bold text-white text-xs">{areas[4].nome}</div>
                                            </div>
                                            <div className={`h-20 rounded-xl ${areas[3].cor} p-3 flex flex-col justify-center shadow-lg transition-all ${selecionados.has(areas[3].nome) ? 'ring-4 ring-white/50 scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
                                                <div className="font-bold text-white text-xs">{areas[3].nome}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {!isCinema && (
                            <GlassCard className="p-6">
                                <h2 className="text-xl font-bold text-white mb-6">Selecione a Área</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {areas.map((area) => {
                                        const ativo = selecionados.has(area.nome);
                                        const areaWithPrice = pricingForArea(area);
                                        return (
                                            <button
                                                key={area.nome}
                                                onClick={() => toggleArea(areaWithPrice)}
                                                className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 border ${ativo ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-1 h-full ${area.cor}`} />
                                                <div className="pl-3">
                                                    <div className="font-bold text-white text-lg">{area.nome}</div>
                                                    <div className="text-sm text-gray-400">{area.descricao}</div>
                                                    <div className="font-semibold mt-2 text-primary text-lg">R$ {areaWithPrice.precoBase.toFixed(2)}</div>
                                                </div>
                                                {ativo && (
                                                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                                                        Selecionado
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        )}
                    </div>

                    {/* Summary/Checkout Section */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-6">Resumo da Compra</h3>

                            {(isCinema ? selectedSeats.length === 0 : selecionados.size === 0) ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Selecione {isCinema ? 'um assento' : 'uma área'} para continuar</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {isCinema ? (
                                        /* Cinema Summary */
                                        <div className="space-y-2">
                                            {selectedSeats.map(seat => (
                                                <div key={seat.id} className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Assento {seat.label}</span>
                                                    <span className="text-white">R$ {seat.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Theater Summary */
                                        Array.from(selecionados.values()).map((sel) => (
                                            <div key={sel.area.nome} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="font-bold text-white">{sel.area.nome}</span>
                                                    <button onClick={() => toggleArea(sel.area)} className="text-red-400 hover:text-red-300 text-xs">Remover</button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm text-gray-400">Tipo</label>
                                                        <select
                                                            className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                                                            value={sel.tipo}
                                                            onChange={(e) => alterarTipo(sel.area.nome, e.target.value)}
                                                        >
                                                            {Object.entries(tipos).map(([key, value]) => (
                                                                <option key={key} value={key}>{value.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm text-gray-400">Qtd.</label>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => alterarQtd(sel.area.nome, sel.qtd - 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">-</button>
                                                            <span className="w-8 text-center font-bold text-white">{sel.qtd}</span>
                                                            <button onClick={() => alterarQtd(sel.area.nome, sel.qtd + 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">+</button>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                                        <span className="text-sm text-gray-400">Subtotal</span>
                                                        <span className="font-bold text-primary">R$ {(sel.area.precoBase * tipos[sel.tipo].multiplicador * sel.qtd).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-gray-300">Total</span>
                                            <span className="text-3xl font-bold text-primary">
                                                R$ {total.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={limpar}
                                                className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
                                            >
                                                Limpar
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={pagar}
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                {processing ? '...' : 'Finalizar'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
