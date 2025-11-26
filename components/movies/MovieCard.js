import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/router';

export default function MovieCard({ movie, index = 0 }) {
    const router = useRouter();

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Poster';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer bg-surface"
            onClick={() => router.push(`/filmes/${movie.id}`)}
        >
            {/* Image */}
            <img
                src={posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Gradient Overlay (Always visible but stronger on hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Hover Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {movie.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span>{movie.vote_average?.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{movie.release_date?.split('-')[0]}</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {movie.overview}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
