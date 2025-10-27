const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function syncComprehensiveMovies() {
  try {
    console.log('🎬 Iniciando sincronização abrangente de filmes...\n');

    let totalSynced = 0;
    const errors = [];

    // 1. Filmes populares (múltiplas páginas)
    console.log('📈 Sincronizando filmes populares (páginas 1-3)...');
    for (let page = 1; page <= 3; page++) {
      try {
        const response = await axios.post(`${API_BASE_URL}/movies/sync-popular`, {
          limit: 20
        });
        const newMovies = response.data.synced.filter(m => m.status === 'created').length;
        totalSynced += newMovies;
        console.log(`   Página ${page}: ${newMovies} novos filmes`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre páginas
      } catch (error) {
        console.log(`   Página ${page}: Erro - ${error.message}`);
        errors.push(`Página ${page}: ${error.message}`);
      }
    }

    // 2. Filmes em cartaz (múltiplas páginas)
    console.log('\n🎭 Sincronizando filmes em cartaz (páginas 1-2)...');
    for (let page = 1; page <= 2; page++) {
      try {
        const response = await axios.post(`${API_BASE_URL}/movies/sync-now-playing`, {
          limit: 20
        });
        const newMovies = response.data.synced.filter(m => m.status === 'created').length;
        totalSynced += newMovies;
        console.log(`   Página ${page}: ${newMovies} novos filmes`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`   Página ${page}: Erro - ${error.message}`);
        errors.push(`Now Playing Página ${page}: ${error.message}`);
      }
    }

    // 3. Buscar filmes por gêneros populares
    console.log('\n🎨 Sincronizando filmes por gêneros...');
    const popularGenres = [
      { id: 28, name: 'Ação' },
      { id: 35, name: 'Comédia' },
      { id: 18, name: 'Drama' },
      { id: 27, name: 'Terror' },
      { id: 878, name: 'Ficção Científica' }
    ];

    for (const genre of popularGenres) {
      try {
        console.log(`   Buscando filmes de ${genre.name}...`);
        
        // Buscar filmes do gênero no TMDB
        const tmdbResponse = await axios.get(`${API_BASE_URL}/tmdb/popular?page=1`);
        const genreMovies = tmdbResponse.data.results.filter(movie => 
          movie.genre_ids.includes(genre.id)
        ).slice(0, 10); // Pegar até 10 filmes por gênero

        let genreSynced = 0;
        for (const movie of genreMovies) {
          try {
            const syncResponse = await axios.post(`${API_BASE_URL}/movies/sync-tmdb`, {
              tmdbId: movie.id
            });
            if (syncResponse.data.movie) {
              genreSynced++;
              totalSynced++;
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // Pausa entre filmes
          } catch (error) {
            // Filme já existe ou erro - continua
          }
        }
        console.log(`   ${genre.name}: ${genreSynced} novos filmes`);
      } catch (error) {
        console.log(`   ${genre.name}: Erro - ${error.message}`);
        errors.push(`${genre.name}: ${error.message}`);
      }
    }

    // 4. Verificar total final
    console.log('\n📊 Verificando total final...');
    const moviesResponse = await axios.get(`${API_BASE_URL}/movies`);
    const totalMovies = moviesResponse.data.length;
    
    console.log(`\n🎉 Sincronização abrangente concluída!`);
    console.log(`📽️ Total de filmes no banco: ${totalMovies}`);
    console.log(`🆕 Novos filmes adicionados nesta execução: ${totalSynced}`);
    
    if (errors.length > 0) {
      console.log(`⚠️ Erros encontrados: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // 5. Mostrar estatísticas dos filmes
    console.log('\n📈 Estatísticas dos filmes:');
    const movies = moviesResponse.data;
    const genres = {};
    const ratings = {};
    
    movies.forEach(movie => {
      // Contar gêneros
      if (movie.genres) {
        try {
          const movieGenres = JSON.parse(movie.genres);
          movieGenres.forEach(genre => {
            genres[genre.name] = (genres[genre.name] || 0) + 1;
          });
        } catch (e) {}
      }
      
      // Contar classificações
      ratings[movie.rating] = (ratings[movie.rating] || 0) + 1;
    });

    console.log('\n🎭 Gêneros mais comuns:');
    Object.entries(genres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([genre, count]) => {
        console.log(`   ${genre}: ${count} filmes`);
      });

    console.log('\n⭐ Classificações:');
    Object.entries(ratings)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([rating, count]) => {
        console.log(`   ${rating}: ${count} filmes`);
      });

  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncComprehensiveMovies();
}

module.exports = syncComprehensiveMovies;
