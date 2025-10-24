const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function syncDiverseMovies() {
  try {
    console.log('🎬 Iniciando sincronização de filmes diversos...\n');

    let totalSynced = 0;
    const errors = [];

    // 1. Buscar filmes de diferentes décadas
    console.log('📅 Buscando filmes de diferentes décadas...');
    const decades = [
      { year: '2024', name: '2024' },
      { year: '2023', name: '2023' },
      { year: '2022', name: '2022' },
      { year: '2021', name: '2021' },
      { year: '2020', name: '2020' }
    ];

    for (const decade of decades) {
      try {
        console.log(`   Buscando filmes de ${decade.name}...`);
        
        // Buscar filmes populares do ano
        const tmdbResponse = await axios.get(`${API_BASE_URL}/tmdb/popular?page=1`);
        const yearMovies = tmdbResponse.data.results.filter(movie => 
          movie.release_date && movie.release_date.startsWith(decade.year)
        ).slice(0, 15); // Pegar até 15 filmes por ano

        let yearSynced = 0;
        for (const movie of yearMovies) {
          try {
            const syncResponse = await axios.post(`${API_BASE_URL}/movies/sync-tmdb`, {
              tmdbId: movie.id
            });
            if (syncResponse.data.movie) {
              yearSynced++;
              totalSynced++;
              console.log(`     ✅ ${movie.title}`);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            // Filme já existe - continua
          }
        }
        console.log(`   ${decade.name}: ${yearSynced} novos filmes`);
      } catch (error) {
        console.log(`   ${decade.name}: Erro - ${error.message}`);
        errors.push(`${decade.name}: ${error.message}`);
      }
    }

    // 2. Buscar filmes com diferentes classificações
    console.log('\n🎯 Buscando filmes com diferentes classificações...');
    const ratingCategories = [
      { min: 8.0, max: 10.0, name: 'Alta Avaliação (8.0+)' },
      { min: 7.0, max: 8.0, name: 'Boa Avaliação (7.0-8.0)' },
      { min: 6.0, max: 7.0, name: 'Avaliação Média (6.0-7.0)' }
    ];

    for (const category of ratingCategories) {
      try {
        console.log(`   Buscando ${category.name}...`);
        
        const tmdbResponse = await axios.get(`${API_BASE_URL}/tmdb/popular?page=1`);
        const ratedMovies = tmdbResponse.data.results.filter(movie => 
          movie.vote_average >= category.min && movie.vote_average < category.max
        ).slice(0, 10);

        let categorySynced = 0;
        for (const movie of ratedMovies) {
          try {
            const syncResponse = await axios.post(`${API_BASE_URL}/movies/sync-tmdb`, {
              tmdbId: movie.id
            });
            if (syncResponse.data.movie) {
              categorySynced++;
              totalSynced++;
              console.log(`     ✅ ${movie.title} (⭐ ${movie.vote_average})`);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            // Filme já existe - continua
          }
        }
        console.log(`   ${category.name}: ${categorySynced} novos filmes`);
      } catch (error) {
        console.log(`   ${category.name}: Erro - ${error.message}`);
        errors.push(`${category.name}: ${error.message}`);
      }
    }

    // 3. Buscar filmes de diferentes idiomas
    console.log('\n🌍 Buscando filmes de diferentes idiomas...');
    const languages = [
      { code: 'pt-BR', name: 'Português' },
      { code: 'es', name: 'Espanhol' },
      { code: 'fr', name: 'Francês' },
      { code: 'de', name: 'Alemão' },
      { code: 'ja', name: 'Japonês' }
    ];

    for (const lang of languages) {
      try {
        console.log(`   Buscando filmes em ${lang.name}...`);
        
        const tmdbResponse = await axios.get(`${API_BASE_URL}/tmdb/popular?page=1`);
        const langMovies = tmdbResponse.data.results.filter(movie => 
          movie.original_language === lang.code
        ).slice(0, 8);

        let langSynced = 0;
        for (const movie of langMovies) {
          try {
            const syncResponse = await axios.post(`${API_BASE_URL}/movies/sync-tmdb`, {
              tmdbId: movie.id
            });
            if (syncResponse.data.movie) {
              langSynced++;
              totalSynced++;
              console.log(`     ✅ ${movie.title} (${lang.name})`);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            // Filme já existe - continua
          }
        }
        console.log(`   ${lang.name}: ${langSynced} novos filmes`);
      } catch (error) {
        console.log(`   ${lang.name}: Erro - ${error.message}`);
        errors.push(`${lang.name}: ${error.message}`);
      }
    }

    // 4. Verificar total final
    console.log('\n📊 Verificando total final...');
    const moviesResponse = await axios.get(`${API_BASE_URL}/movies`);
    const totalMovies = moviesResponse.data.length;
    
    console.log(`\n🎉 Sincronização diversa concluída!`);
    console.log(`📽️ Total de filmes no banco: ${totalMovies}`);
    console.log(`🆕 Novos filmes adicionados nesta execução: ${totalSynced}`);
    
    if (errors.length > 0) {
      console.log(`⚠️ Erros encontrados: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // 5. Mostrar alguns filmes recentes
    console.log('\n🎬 Filmes mais recentes adicionados:');
    const recentMovies = moviesResponse.data
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    recentMovies.forEach((movie, index) => {
      const date = new Date(movie.createdAt).toLocaleDateString('pt-BR');
      console.log(`${index + 1}. ${movie.title} (⭐ ${movie.voteAverage?.toFixed(1) || 'N/A'}) - ${date}`);
    });

  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncDiverseMovies();
}

module.exports = syncDiverseMovies;
