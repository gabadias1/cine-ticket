const { PrismaClient } = require('@prisma/client');
const tmdbService = require('../src/tmdbService');

const prisma = new PrismaClient();

async function updateMoviesToPortuguese() {
  try {
    console.log('🔄 Iniciando atualização dos filmes para português...');
    
    // Buscar todos os filmes que têm tmdbId
    const movies = await prisma.movie.findMany({
      where: {
        tmdbId: {
          not: null
        }
      }
    });

    console.log(`📽️ Encontrados ${movies.length} filmes para atualizar`);

    let updated = 0;
    let errors = 0;

    for (const movie of movies) {
      try {
        console.log(`\n🎬 Atualizando: ${movie.title} (ID: ${movie.tmdbId})`);
        
        // Buscar dados atualizados do TMDB
        const tmdbData = await tmdbService.getMovieDetails(movie.tmdbId);
        
        // Converter para formato local
        const updatedData = tmdbService.convertTMDBMovieToLocal(tmdbData);
        
        // Atualizar no banco
        const updatedMovie = await prisma.movie.update({
          where: { id: movie.id },
          data: {
            title: updatedData.title,
            synopsis: updatedData.synopsis,
            genres: updatedData.genres,
            voteAverage: updatedData.voteAverage,
            voteCount: updatedData.voteCount,
            originalLanguage: updatedData.originalLanguage
          }
        });

        console.log(`✅ Atualizado: ${updatedMovie.title}`);
        console.log(`   Sinopse: ${updatedMovie.synopsis?.substring(0, 100)}...`);
        
        updated++;
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar filme ${movie.title}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 Atualização concluída!`);
    console.log(`✅ Filmes atualizados: ${updated}`);
    console.log(`❌ Erros: ${errors}`);

  } catch (error) {
    console.error('Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateMoviesToPortuguese();
}

module.exports = updateMoviesToPortuguese;
