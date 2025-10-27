const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function syncMoreMovies() {
  try {
    console.log('🎬 Iniciando sincronização de mais filmes...\n');

    // 1. Sincronizar filmes populares (50 filmes)
    console.log('📈 Sincronizando filmes populares...');
    const popularResponse = await axios.post(`${API_BASE_URL}/movies/sync-popular`, {
      limit: 50
    });
    console.log(`✅ ${popularResponse.data.synced.length} filmes populares processados`);

    // 2. Sincronizar filmes em cartaz (30 filmes)
    console.log('\n🎭 Sincronizando filmes em cartaz...');
    const nowPlayingResponse = await axios.post(`${API_BASE_URL}/movies/sync-now-playing`, {
      limit: 30
    });
    console.log(`✅ ${nowPlayingResponse.data.synced.length} filmes em cartaz processados`);

    // 3. Verificar total de filmes no banco
    console.log('\n📊 Verificando total de filmes no banco...');
    const moviesResponse = await axios.get(`${API_BASE_URL}/movies`);
    const totalMovies = moviesResponse.data.length;
    
    console.log(`\n🎉 Sincronização concluída!`);
    console.log(`📽️ Total de filmes no banco: ${totalMovies}`);
    console.log(`🆕 Novos filmes adicionados: ${totalMovies - 20}`); // Assumindo que começamos com 20

    // 4. Mostrar alguns exemplos dos novos filmes
    console.log('\n🎬 Alguns dos novos filmes:');
    moviesResponse.data.slice(-10).forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (⭐ ${movie.voteAverage?.toFixed(1) || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error.response?.data || error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncMoreMovies();
}

module.exports = syncMoreMovies;
