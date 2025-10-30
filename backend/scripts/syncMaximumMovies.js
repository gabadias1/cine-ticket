const { PrismaClient } = require('@prisma/client');
const tmdbService = require('../src/tmdbService');

const prisma = new PrismaClient();

async function syncMaximumMoviesFromTMDB() {
  try {
    console.log('🌐 Sincronizando MÁXIMO de filmes da API TMDB...');
    console.log('⚠️  Isso pode levar alguns minutos devido ao limite de rate da API...\n');
    
    let totalSynced = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const processedIds = new Set();
    
    // Função para processar uma lista de filmes
    const processMovies = async (movies, category) => {
      let synced = 0;
      let skipped = 0;
      let errors = 0;
      
      for (const tmdbMovie of movies) {
        try {
          // Evitar reprocessar o mesmo filme dentro desta execução
          if (processedIds.has(tmdbMovie.id)) {
            skipped++;
            continue;
          }

          // Verificar se já existe
          const existing = await prisma.movie.findUnique({
            where: { tmdbId: tmdbMovie.id }
          });
          
          if (existing) {
            skipped++;
            processedIds.add(tmdbMovie.id);
            continue;
          }
          
          // Buscar detalhes completos
          const details = await tmdbService.getMovieDetails(tmdbMovie.id);
          const movieData = tmdbService.convertTMDBMovieToLocal(details);
          
          // Criar filme no banco (ou ignorar se já existir) usando upsert para evitar conflitos de unicidade
          await prisma.movie.upsert({
            where: { tmdbId: movieData.tmdbId },
            update: {},
            create: movieData
          });
          synced++;
          processedIds.add(tmdbMovie.id);
          
          // Pequeno delay para não sobrecarregar a API (rate limit)
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`  ❌ Erro ao sincronizar filme ${tmdbMovie.id}:`, error.message);
          errors++;
        }
      }
      
      console.log(`  ✅ ${category}: ${synced} sincronizados, ${skipped} já existiam, ${errors} erros`);
      return { synced, skipped, errors };
    };
    
    // 1. Filmes Populares (múltiplas páginas)
    console.log('📈 Sincronizando filmes populares (múltiplas páginas)...');
    for (let page = 1; page <= 5; page++) {
      try {
        console.log(`  → Página ${page}/5 de filmes populares...`);
        const popularMovies = await tmdbService.getPopularMovies(page);
        const result = await processMovies(popularMovies.results, `Populares P${page}`);
        totalSynced += result.synced;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
        
        // Delay entre páginas
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Erro na página ${page} de populares:`, error.message);
        totalErrors++;
      }
    }
    
    // 2. Filmes em Cartaz (múltiplas páginas)
    console.log('\n🎬 Sincronizando filmes em cartaz (múltiplas páginas)...');
    for (let page = 1; page <= 3; page++) {
      try {
        console.log(`  → Página ${page}/3 de filmes em cartaz...`);
        const nowPlayingMovies = await tmdbService.getNowPlayingMovies(page);
        const result = await processMovies(nowPlayingMovies.results, `Em Cartaz P${page}`);
        totalSynced += result.synced;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
        
        // Delay entre páginas
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Erro na página ${page} de em cartaz:`, error.message);
        totalErrors++;
      }
    }
    
    // 3. Filmes Melhor Avaliados (múltiplas páginas)
    console.log('\n⭐ Sincronizando filmes melhor avaliados (múltiplas páginas)...');
    for (let page = 1; page <= 3; page++) {
      try {
        console.log(`  → Página ${page}/3 de filmes melhor avaliados...`);
        const topRatedMovies = await tmdbService.getTopRatedMovies(page);
        const result = await processMovies(topRatedMovies.results, `Top Rated P${page}`);
        totalSynced += result.synced;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
        
        // Delay entre páginas
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Erro na página ${page} de top rated:`, error.message);
        totalErrors++;
      }
    }
    
    // 4. Filmes em Breve (múltiplas páginas)
    console.log('\n🔮 Sincronizando filmes em breve (múltiplas páginas)...');
    for (let page = 1; page <= 2; page++) {
      try {
        console.log(`  → Página ${page}/2 de filmes em breve...`);
        const upcomingMovies = await tmdbService.getUpcomingMovies(page);
        const result = await processMovies(upcomingMovies.results, `Em Breve P${page}`);
        totalSynced += result.synced;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
        
        // Delay entre páginas
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Erro na página ${page} de em breve:`, error.message);
        totalErrors++;
      }
    }
    
    // 5. Filmes em Alta (Trending)
    console.log('\n🔥 Sincronizando filmes em alta (trending)...');
    for (let page = 1; page <= 2; page++) {
      try {
        console.log(`  → Página ${page}/2 de filmes em alta...`);
        const trendingMovies = await tmdbService.getTrendingMovies('week', page);
        const result = await processMovies(trendingMovies.results, `Trending P${page}`);
        totalSynced += result.synced;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
        
        // Delay entre páginas
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Erro na página ${page} de trending:`, error.message);
        totalErrors++;
      }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA SINCRONIZAÇÃO:');
    console.log(`✅ Filmes sincronizados: ${totalSynced}`);
    console.log(`⏭️  Filmes já existentes: ${totalSkipped}`);
    console.log(`❌ Erros encontrados: ${totalErrors}`);
    console.log(`📈 Total processado: ${totalSynced + totalSkipped + totalErrors}`);
    
    // Verificar total de filmes no banco
    const totalMovies = await prisma.movie.count();
    console.log(`🎬 Total de filmes no banco: ${totalMovies}`);
    console.log('='.repeat(60));
    
    if (totalSynced > 0) {
      console.log('\n🎉 Sincronização concluída com sucesso!');
      console.log('💡 Dica: Os filmes sincronizados incluem dados completos como:');
      console.log('   - Título, sinopse, duração, classificação');
      console.log('   - Poster e backdrop do TMDB');
      console.log('   - Gêneros, data de lançamento');
      console.log('   - Avaliação e contagem de votos');
    }
    
  } catch (error) {
    console.error('❌ Erro fatal na sincronização:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { syncMaximumMoviesFromTMDB };

// Se executado diretamente
if (require.main === module) {
  syncMaximumMoviesFromTMDB()
    .then(() => {
      console.log('\n✅ Sincronização máxima concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal na sincronização:', error);
      process.exit(1);
    });
}
