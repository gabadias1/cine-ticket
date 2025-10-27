const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function syncExtendedMovies() {
  try {
    console.log('🎬 Iniciando sincronização estendida de filmes...\n');

    let totalSynced = 0;
    const errors = [];

    // 1. Buscar filmes de páginas mais distantes do TMDB
    console.log('📖 Buscando filmes de páginas distantes...');
    const pages = [5, 10, 15, 20, 25, 30, 40, 50];
    
    for (const page of pages) {
      try {
        console.log(`   Buscando página ${page}...`);
        
        // Buscar filmes populares da página
        const tmdbResponse = await axios.get(`${API_BASE_URL}/tmdb/popular?page=${page}`);
        const movies = tmdbResponse.data.results.slice(0, 10); // Pegar 10 filmes por página

        let pageSynced = 0;
        for (const movie of movies) {
          try {
            const syncResponse = await axios.post(`${API_BASE_URL}/movies/sync-tmdb`, {
              tmdbId: movie.id
            });
            if (syncResponse.data.movie) {
              pageSynced++;
              totalSynced++;
              console.log(`     ✅ ${movie.title} (⭐ ${movie.vote_average?.toFixed(1)})`);
            }
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            // Filme já existe - continua
          }
        }
        console.log(`   Página ${page}: ${pageSynced} novos filmes`);
        
        // Pausa entre páginas para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`   Página ${page}: Erro - ${error.message}`);
        errors.push(`Página ${page}: ${error.message}`);
      }
    }

    // 2. Buscar filmes em cartaz de páginas distantes
    console.log('\n🎭 Buscando filmes em cartaz de páginas distantes...');
    const nowPlayingPages = [3, 5, 8, 10];
    
    for (const page of nowPlayingPages) {
      try {
        console.log(`   Buscando página ${page}...`);
        
        const tmdbResponse = await axios.get(`${API_BASE_URL}/tmdb/now-playing?page=${page}`);
        const movies = tmdbResponse.data.results.slice(0, 8);

        let pageSynced = 0;
        for (const movie of movies) {
          try {
            const syncResponse = await axios.post(`${API_BASE_URL}/movies/sync-tmdb`, {
              tmdbId: movie.id
            });
            if (syncResponse.data.movie) {
              pageSynced++;
              totalSynced++;
              console.log(`     ✅ ${movie.title} (⭐ ${movie.vote_average?.toFixed(1)})`);
            }
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            // Filme já existe - continua
          }
        }
        console.log(`   Página ${page}: ${pageSynced} novos filmes`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`   Página ${page}: Erro - ${error.message}`);
        errors.push(`Now Playing Página ${page}: ${error.message}`);
      }
    }

    // 3. Buscar filmes com diferentes gêneros específicos
    console.log('\n🎨 Buscando filmes de gêneros específicos...');
    const specificGenres = [
      { id: 16, name: 'Animação' },
      { id: 99, name: 'Documentário' },
      { id: 10751, name: 'Família' },
      { id: 14, name: 'Fantasia' },
      { id: 36, name: 'História' },
      { id: 10402, name: 'Música' },
      { id: 9648, name: 'Mistério' },
      { id: 10749, name: 'Romance' },
      { id: 10752, name: 'Guerra' },
      { id: 37, name: 'Faroeste' }
    ];

    for (const genre of specificGenres) {
      try {
        console.log(`   Buscando filmes de ${genre.name}...`);
        
        // Buscar filmes do gênero específico
        const tmdbResponse = await axios.get(`${API_BASE_URL}/tmdb/popular?page=1`);
        const genreMovies = tmdbResponse.data.results.filter(movie => 
          movie.genre_ids.includes(genre.id)
        ).slice(0, 5);

        let genreSynced = 0;
        for (const movie of genreMovies) {
          try {
            const syncResponse = await axios.post(`${API_BASE_URL}/movies/sync-tmdb`, {
              tmdbId: movie.id
            });
            if (syncResponse.data.movie) {
              genreSynced++;
              totalSynced++;
              console.log(`     ✅ ${movie.title} (${genre.name})`);
            }
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            // Filme já existe - continua
          }
        }
        console.log(`   ${genre.name}: ${genreSynced} novos filmes`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`   ${genre.name}: Erro - ${error.message}`);
        errors.push(`${genre.name}: ${error.message}`);
      }
    }

    // 4. Verificar total final
    console.log('\n📊 Verificando total final...');
    const moviesResponse = await axios.get(`${API_BASE_URL}/movies`);
    const totalMovies = moviesResponse.data.length;
    
    console.log(`\n🎉 Sincronização estendida concluída!`);
    console.log(`📽️ Total de filmes no banco: ${totalMovies}`);
    console.log(`🆕 Novos filmes adicionados nesta execução: ${totalSynced}`);
    
    if (errors.length > 0) {
      console.log(`⚠️ Erros encontrados: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // 5. Mostrar estatísticas finais
    console.log('\n📈 Estatísticas finais:');
    const movies = moviesResponse.data;
    
    // Contar por ano de lançamento
    const years = {};
    movies.forEach(movie => {
      if (movie.releaseDate) {
        const year = new Date(movie.releaseDate).getFullYear();
        years[year] = (years[year] || 0) + 1;
      }
    });

    console.log('\n📅 Filmes por ano:');
    Object.entries(years)
      .sort(([a], [b]) => b - a)
      .slice(0, 10)
      .forEach(([year, count]) => {
        console.log(`   ${year}: ${count} filmes`);
      });

    // Mostrar alguns filmes aleatórios
    console.log('\n🎬 Alguns filmes do catálogo:');
    const randomMovies = movies
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);
    
    randomMovies.forEach((movie, index) => {
      const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A';
      console.log(`${index + 1}. ${movie.title} (${year}) - ⭐ ${movie.voteAverage?.toFixed(1) || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncExtendedMovies();
}

module.exports = syncExtendedMovies;
