const { PrismaClient } = require('@prisma/client');
const tmdbService = require('../src/tmdbService');

const prisma = new PrismaClient();

async function syncMoviesFromTMDB() {
  try {
    console.log('🌐 Sincronizando filmes da API TMDB...');
    
    // Sincronizar filmes populares
    console.log('  → Obtendo filmes populares...');
    const popularMovies = await tmdbService.getPopularMovies(1);
    let synced = 0;
    let skipped = 0;
    
    for (const tmdbMovie of popularMovies.results.slice(0, 50)) {
      try {
        // Verificar se já existe
        const existing = await prisma.movie.findUnique({
          where: { tmdbId: tmdbMovie.id }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Buscar detalhes completos
        const details = await tmdbService.getMovieDetails(tmdbMovie.id);
        const movieData = tmdbService.convertTMDBMovieToLocal(details);
        
        // Criar filme no banco
        await prisma.movie.create({ data: movieData });
        synced++;
        
        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Erro ao sincronizar filme ${tmdbMovie.id}:`, error.message);
      }
    }
    
    console.log(`  ✅ ${synced} filmes populares sincronizados, ${skipped} já existiam.`);
    
    // Sincronizar filmes em cartaz
    console.log('  → Obtendo filmes em cartaz...');
    const nowPlayingMovies = await tmdbService.getNowPlayingMovies(1);
    let syncedNowPlaying = 0;
    let skippedNowPlaying = 0;
    
    for (const tmdbMovie of nowPlayingMovies.results.slice(0, 30)) {
      try {
        // Verificar se já existe
        const existing = await prisma.movie.findUnique({
          where: { tmdbId: tmdbMovie.id }
        });
        
        if (existing) {
          skippedNowPlaying++;
          continue;
        }
        
        // Buscar detalhes completos
        const details = await tmdbService.getMovieDetails(tmdbMovie.id);
        const movieData = tmdbService.convertTMDBMovieToLocal(details);
        
        // Criar filme no banco
        await prisma.movie.create({ data: movieData });
        syncedNowPlaying++;
        
        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Erro ao sincronizar filme ${tmdbMovie.id}:`, error.message);
      }
    }
    
    console.log(`  ✅ ${syncedNowPlaying} filmes em cartaz sincronizados, ${skippedNowPlaying} já existiam.`);
    
    const total = synced + syncedNowPlaying;
    console.log(`\n🎬 Total: ${total} filmes sincronizados com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar filmes:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { syncMoviesFromTMDB };

// Se executado diretamente
if (require.main === module) {
  syncMoviesFromTMDB()
    .then(() => {
      console.log('✅ Sincronização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal na sincronização:', error);
      process.exit(1);
    });
}

