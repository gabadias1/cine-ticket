import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, User, LogOut, Menu, X, Search, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import Link from 'next/link';

export default function Layout({ children, title = 'CineTicket - Premium Experience' }) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Location State
    const [location, setLocation] = useState('São Paulo, SP');
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const locations = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Brasília, DF', 'Curitiba, PR', 'Salvador, BA'];

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ movies: [], events: [] });
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 2) {
                setIsSearching(true);
                try {
                    // Import API dynamically to avoid circular deps if any, or just use the global import
                    const api = (await import('../utils/api')).default;

                    const [moviesRes, eventsRes] = await Promise.all([
                        api.searchTMDBMovies(searchQuery),
                        api.getTicketmasterEvents({ keyword: searchQuery, size: 3 })
                    ]);

                    setSearchResults({
                        movies: moviesRes.results?.slice(0, 3) || [],
                        events: eventsRes._embedded?.events?.slice(0, 3) || []
                    });
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults({ movies: [], events: [] });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleResultClick = (path) => {
        router.push(path);
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults({ movies: [], events: [] });
    };

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-4'
                }`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/images/logo.png" alt="CineTicket Logo" className="h-16 w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-105 brightness-0 invert" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/filmes" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                            Filmes
                        </Link>
                        <Link href="/eventos" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                            Eventos
                        </Link>

                        <div className="h-6 w-px bg-white/10" />

                        {/* Location Selector - Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLocationOpen(!isLocationOpen)}
                                className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer transition-colors"
                            >
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">{location}</span>
                            </button>

                            <AnimatePresence>
                                {isLocationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 right-0 w-48 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden py-2 z-50"
                                    >
                                        {locations.map((loc) => (
                                            <button
                                                key={loc}
                                                onClick={() => {
                                                    setLocation(loc);
                                                    setIsLocationOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${location === loc ? 'text-primary font-medium' : 'text-gray-300'
                                                    }`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-6 w-px bg-white/10" />

                        {/* Search Bar */}
                        <div className="relative">
                            {isSearchOpen ? (
                                <div className="relative">
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Buscar filme ou evento..."
                                            className="bg-white/10 border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-primary w-64 transition-all"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="absolute right-3 text-gray-400 hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Search Results Dropdown */}
                                    <AnimatePresence>
                                        {(searchQuery.length > 2 && (searchResults.movies.length > 0 || searchResults.events.length > 0 || isSearching)) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full mt-2 right-0 w-80 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                                            >
                                                {isSearching ? (
                                                    <div className="p-4 text-center text-gray-400 text-sm">Buscando...</div>
                                                ) : (
                                                    <>
                                                        {searchResults.movies.length > 0 && (
                                                            <div className="p-2">
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-1">Filmes</h4>
                                                                {searchResults.movies.map(movie => (
                                                                    <button
                                                                        key={movie.id}
                                                                        onClick={() => handleResultClick(`/filmes/${movie.id}`)}
                                                                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                                                                    >
                                                                        {movie.poster_path ? (
                                                                            <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} className="w-8 h-12 object-cover rounded" />
                                                                        ) : (
                                                                            <div className="w-8 h-12 bg-white/10 rounded flex items-center justify-center"><Film className="w-4 h-4 text-gray-500" /></div>
                                                                        )}
                                                                        <div>
                                                                            <p className="text-sm font-medium text-white line-clamp-1">{movie.title}</p>
                                                                            <p className="text-xs text-gray-400">{movie.release_date?.split('-')[0]}</p>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {searchResults.events.length > 0 && (
                                                            <div className="p-2 border-t border-white/5">
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-1">Eventos</h4>
                                                                {searchResults.events.map(event => (
                                                                    <button
                                                                        key={event.id}
                                                                        onClick={() => handleResultClick(`/eventos/${event.id}`)}
                                                                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                                                                    >
                                                                        {event.images?.[0]?.url ? (
                                                                            <img src={event.images[0].url} alt={event.name} className="w-8 h-8 object-cover rounded-full" />
                                                                        ) : (
                                                                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><MapPin className="w-4 h-4 text-gray-500" /></div>
                                                                        )}
                                                                        <div>
                                                                            <p className="text-sm font-medium text-white line-clamp-1">{event.name}</p>
                                                                            <p className="text-xs text-gray-400">{event.dates?.start?.localDate}</p>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/perfil" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                                        {user.name[0]}
                                    </div>
                                    <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={logout} icon={LogOut}>
                                    Sair
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Entrar</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm">Criar Conta</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-center">
                            <Link href="/filmes" className="text-xl font-medium text-white">Filmes</Link>
                            <Link href="/eventos" className="text-xl font-medium text-white">Eventos</Link>
                            <hr className="border-white/10" />
                            {user ? (
                                <>
                                    <span className="text-gray-400">Olá, {user.name}</span>
                                    <Button variant="secondary" onClick={logout} className="w-full">Sair</Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login"><Button variant="ghost" className="w-full">Entrar</Button></Link>
                                    <Link href="/register"><Button variant="primary" className="w-full">Criar Conta</Button></Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-24 pb-20 min-h-screen">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-surface/30 backdrop-blur-sm py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Film className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-white">CineTicket</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            A melhor experiência de cinema, agora na palma da sua mão.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Navegação</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/filmes" className="hover:text-primary transition-colors">Em Cartaz</Link></li>
                            <li><Link href="/filmes" className="hover:text-primary transition-colors">Em Breve</Link></li>
                            <li><Link href="/eventos" className="hover:text-primary transition-colors">Eventos</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Conta</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/perfil" className="hover:text-primary transition-colors">Meu Perfil</Link></li>
                            <li><Link href="/meus-ingressos" className="hover:text-primary transition-colors">Meus Ingressos</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Contato</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>São Paulo, SP</span>
                            </li>
                            <li>suporte@cineticket.com.br</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
                    © 2025 CineTicket. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
