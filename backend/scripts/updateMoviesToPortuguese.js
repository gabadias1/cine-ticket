require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const tmdbService = require('../src/tmdbService');

const prisma = new PrismaClient();

async function updateMoviesToPortuguese() {
  try {
    console.log('🇧🇷 Atualizando filmes para português...\n');

    // Buscar todos os filmes que têm tmdbId (podem ser atualizados)
    const movies = await prisma.movie.findMany({
      where: {
        tmdbId: { not: null }
      }
    });

    console.log(`📊 Encontrados ${movies.length} filmes com tmdbId para atualizar\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const movie of movies) {
      try {
        console.log(`🔄 Atualizando: ${movie.title} (ID: ${movie.tmdbId})...`);

        // Buscar dados atualizados do TMDB em português
        const tmdbMovie = await tmdbService.getMovieDetails(movie.tmdbId);
        const movieData = tmdbService.convertTMDBMovieToLocal(tmdbMovie);

        // Atualizar apenas se houver mudanças
        const hasChanges = 
          movie.title !== movieData.title ||
          movie.synopsis !== movieData.synopsis ||
          movie.genres !== movieData.genres;

        if (hasChanges) {
          await prisma.movie.update({
            where: { id: movie.id },
            data: {
              title: movieData.title,
              synopsis: movieData.synopsis,
              genres: movieData.genres,
              posterPath: movieData.posterPath || movie.posterPath,
              backdropPath: movieData.backdropPath || movie.backdropPath,
              voteAverage: movieData.voteAverage ?? movie.voteAverage,
              voteCount: movieData.voteCount ?? movie.voteCount,
              originalLanguage: movieData.originalLanguage || movie.originalLanguage
            }
          });

          updated++;
          console.log(`   ✅ Atualizado: "${movie.title}" → "${movieData.title}"`);
        } else {
          skipped++;
          console.log(`   ⏭️  Sem mudanças: ${movie.title}`);
        }

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        errors++;
        console.error(`   ❌ Erro ao atualizar filme ${movie.id}:`, error.message);
      }
    }

    console.log('\n✅ Atualização concluída!');
    console.log(`   📝 Atualizados: ${updated}`);
    console.log(`   ⏭️  Sem mudanças: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);

    return { updated, skipped, errors };
  } catch (error) {
    console.error('❌ Erro geral na atualização:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateMoviesToPortuguese()
    .then(() => {
      console.log('\n🎉 Processo finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha na atualização:', error);
      process.exit(1);
    });
}

module.exports = { updateMoviesToPortuguese };

