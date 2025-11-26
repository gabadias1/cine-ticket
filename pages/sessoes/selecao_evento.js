import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { Calendar, MapPin, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PageCinemas() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const filmeId = searchParams?.get('filmeId') || 'filme-teste';
  const filmeTitulo = searchParams?.get('titulo') || 'Filme de Teste';

  // Próximos 3 dias
  const [dataSelecionada, setDataSelecionada] = useState(0); // 0 = hoje, 1 = amanhã, etc.

  const datas = [
    { label: 'Hoje', date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' }) },
    { label: 'Amanhã', date: new Date(Date.now() + 86400000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' }) },
    { label: new Date(Date.now() + 172800000).toLocaleDateString('pt-BR', { weekday: 'short' }), date: new Date(Date.now() + 172800000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' }) }
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
        cor: 'from-blue-600 to-blue-800',
        horarios: ['14:30', '17:00', '19:30']
      },
      {
        numero: 2,
        nome: 'Sala 2',
        layout: 2, // Usa [id]2.js
        descricao: 'Capacidade: 108 lugares',
        cor: 'from-purple-600 to-purple-800',
        horarios: ['15:00', '18:00', '21:00']
      },
      {
        numero: 3,
        nome: 'Sala 3',
        layout: 3, // Usa [id]3.js
        descricao: 'Capacidade: 120 lugares',
        cor: 'from-pink-600 to-pink-800',
        horarios: ['16:30', '19:00', '21:30']
      }
    ]
  };

  return (
    <Layout title={`${filmeTitulo} - Sessões`}>
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">{filmeTitulo}</h1>
          <p className="text-gray-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {cinema.nome} • {cinema.endereco}
          </p>
        </div>

        {/* Date Selector */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Selecione a Data
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {datas.map((data, index) => (
              <button
                key={index}
                onClick={() => setDataSelecionada(index)}
                className={`flex flex-col items-center min-w-[100px] p-4 rounded-xl border transition-all ${dataSelecionada === index
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'bg-surface border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                  }`}
              >
                <span className="text-xs font-bold mb-1 uppercase">{data.label}</span>
                <span className="text-lg font-bold">{data.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cinema Halls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cinema.salas.map((sala) => (
            <motion.div
              key={sala.numero}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className={`p-6 bg-gradient-to-br ${sala.cor} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Info className="w-24 h-24" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">Sala {sala.numero}</h3>
                <p className="text-white/80 text-sm">{sala.nome}</p>
                <p className="text-white/60 text-xs mt-2">{sala.descricao}</p>
              </div>

              <div className="p-6 space-y-3">
                {sala.horarios.map((horario) => (
                  <Link
                    key={horario}
                    href={`/assentos/${sala.layout}?filmeId=${filmeId}&titulo=${filmeTitulo}&sala=${sala.numero}&horario=${horario}&data=${datas[dataSelecionada].date}`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-between group-hover:bg-white/5"
                    >
                      <span className="font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {horario}
                      </span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">
                        2D / DUB
                      </span>
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-surface border border-white/10 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Informações Gerais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <p>• Todas as salas possuem ar condicionado e poltronas reclináveis</p>
            <p>• Classificação indicativa conforme indicado na programação</p>
            <p>• Chegue com 15 minutos de antecedência</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}