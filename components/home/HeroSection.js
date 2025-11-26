import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { useRouter } from 'next/router';

export default function HeroSection({ movies = [] }) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-play
    useEffect(() => {
        if (movies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [movies.length]);

    if (!movies || movies.length === 0) return null;

    const movie = movies[currentIndex];
    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null;

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

    return (
        <div className="relative h-[85vh] w-full overflow-hidden group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        {backdropUrl && (
                            <img
                                src={backdropUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover animate-ken-burns"
                            />
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="max-w-7xl mx-auto px-6 w-full pt-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="max-w-2xl space-y-6"
                            >
                                {/* Badge */}
                                <motion.span
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-primary text-sm font-semibold backdrop-blur-sm"
                                >
                                    Em Destaque #{currentIndex + 1}
                                </motion.span>

                                {/* Title */}
                                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                                    {movie.title}
                                </h1>

                                {/* Meta Info */}
                                <div className="flex items-center gap-4 text-gray-300 text-sm md:text-base">
                                    <span className="text-green-400 font-bold">{movie.vote_average?.toFixed(1)} Match</span>
                                    <span>{movie.release_date?.split('-')[0]}</span>
                                    <span className="border border-gray-600 px-2 py-0.5 rounded text-xs">HD</span>
                                </div>

                                {/* Overview */}
                                <p className="text-gray-300 text-lg line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow-md">
                                    {movie.overview}
                                </p>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        icon={Play}
                                        onClick={() => router.push(`/sessoes/${movie.id}`)}
                                    >
                                        Comprar Ingresso
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        icon={Info}
                                        onClick={() => router.push(`/filmes/${movie.id}`)}
                                    >
                                        Mais Detalhes
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-primary/80 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-primary/80 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {movies.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-primary' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
