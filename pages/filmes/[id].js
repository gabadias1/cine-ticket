import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { Play, Calendar, Clock, Star, MapPin, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MovieDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const loadMovie = async () => {
            try {
                // Try to get from local API first (for sessions)
                try {
                    const localMovie = await api.getMovie(id);
                    setMovie(localMovie);
                } catch (e) {
                    // If not in local DB, fetch from TMDB
                    const tmdbMovie = await api.getTMDBMovieDetails(id);
                    setMovie(tmdbMovie);
                }
            } catch (error) {
                console.error('Erro ao carregar filme:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMovie();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!movie) return null;

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null;

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Poster';

    return (
        <Layout title={`${movie.title} - CineTicket`}>
            {/* Hero Backdrop */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    {backdropUrl && (
                        <img
                            src={backdropUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover opacity-50"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>

                <div className="absolute top-8 left-8 z-20">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={ChevronLeft}
                        onClick={() => router.back()}
                    >
                        Voltar
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-64 relative z-10 pb-20">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Poster */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full md:w-80 flex-shrink-0"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10">
                            <img src={posterUrl} alt={movie.title} className="w-full" />
                        </div>

                        <Button
                            variant="primary"
                            className="w-full mt-6 shadow-xl shadow-primary/20"
                            size="lg"
                            icon={Play}
                            onClick={() => router.push(`/sessoes/${movie.id}`)}
                        >
                            Comprar Ingresso
                        </Button>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 pt-12"
                    >
                        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">{movie.title}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="text-lg font-semibold text-white">{movie.vote_average?.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{movie.release_date?.split('-')[0]}</span>
                            </div>
                            {movie.adult && (
                                <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-sm font-bold">18+</span>
                            )}
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xl font-semibold text-white mb-3">Sinopse</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-3">Gêneros</h3>
                                <div className="flex flex-wrap gap-3">
                                    {movie.genres?.map(genre => (
                                        <span
                                            key={genre.id}
                                            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
