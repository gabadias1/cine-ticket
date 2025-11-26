import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { useRouter } from 'next/router';

export default function EventCard({ event }) {
    const router = useRouter();

    const handleClick = () => {
        // Se for evento do Ticketmaster, pode precisar de tratamento especial ou ir para detalhes
        // Por enquanto, vamos assumir que existe uma página de detalhes ou modal
        // O componente pai (Eventos.js) lida com o clique se passarmos onClick, mas aqui vamos fazer navegação direta se possível
        // Mas o Eventos.js usa modal... então talvez esse card deva receber um onClick prop.
        // Vamos fazer ele aceitar onClick ou navegar se não tiver.
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            className="group relative bg-surface border border-white/5 rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col"
            onClick={event.onClick}
        >
            {/* Image Container */}
            <div className="aspect-[16/9] overflow-hidden relative">
                <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x338?text=Evento'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />

                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {event.source === 'ticketmaster' && (
                        <span className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium backdrop-blur-sm">
                            Ticketmaster
                        </span>
                    )}
                    <span className="px-2 py-1 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-medium backdrop-blur-sm">
                        {event.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {event.name}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                    {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{event.date.split('-').reverse().join('/')} às {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1">{event.location}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400">A partir de</span>
                        <span className="text-lg font-bold text-white">
                            {event.price > 0 ? `R$ ${event.price.toFixed(2)}` : 'Grátis'}
                        </span>
                    </div>
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-primary hover:text-white text-gray-300 transition-all">
                        <Ticket className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
