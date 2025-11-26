import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import Layout from "../components/Layout";
import HeroSection from "../components/home/HeroSection";
import MovieCard from "../components/movies/MovieCard";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trending, nowPlaying, upcoming] = await Promise.all([
          api.getTMDBTrending(1, 'week'),
          api.getTMDBNowPlaying(1),
          api.getTMDBUpcoming(1)
        ]);

        setTrendingMovies(trending.results || []);
        setNowPlayingMovies(nowPlaying.results || []);
        setUpcomingMovies(upcoming.results || []);

        // Set featured movie (first trending or random)
        if (trending.results?.length > 0) {
          setFeaturedMovie(trending.results[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const MovieSection = ({ title, movies, viewAllLink }) => (
    <section className="py-12 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <div className="h-1 w-20 bg-primary rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.slice(0, 10).map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout>
      {/* Hero Section - Carousel with Top 3 Trending */}
      <HeroSection movies={trendingMovies.slice(0, 3)} />

      {/* Trending Section */}
      <MovieSection
        title="Em Alta"
        movies={trendingMovies}
        viewAllLink="/filmes?filter=trending"
      />

      {/* Now Playing Section */}
      <MovieSection
        title="Em Cartaz"
        movies={nowPlayingMovies}
        viewAllLink="/filmes?filter=now_playing"
      />

      {/* Upcoming Section */}
      <MovieSection
        title="Em Breve"
        movies={upcomingMovies}
        viewAllLink="/filmes?filter=upcoming"
      />
    </Layout>
  );
}

