require('dotenv').config();
const ticketmasterService = require('../src/ticketmasterService');

async function diagnoseTicketmaster() {
  console.log('🔍 Diagnóstico da integração Ticketmaster\n');
  console.log('='.repeat(60));

  const apiKey = process.env.TICKETMASTER_API_KEY || '';
  console.log('\n📝 Informações da API Key:');
  console.log(`   ✅ Key presente: ${apiKey ? 'Sim' : 'Não'}`);
  console.log(`   📏 Comprimento: ${apiKey ? apiKey.length : 0} caracteres`);
  console.log('   📍 Fonte: Variável de ambiente TICKETMASTER_API_KEY');

  if (!apiKey) {
    console.log('\n⚠️  Configure TICKETMASTER_API_KEY em backend/.env ou nas variáveis do container antes de continuar.');
    return;
  }

  try {
    console.log('\n🔐 Teste 1: Autenticação e busca básica');
    const basicSearch = await ticketmasterService.searchEvents({ page: 0, size: 1 }, true);
    const eventCount = basicSearch?._embedded?.events?.length || 0;
    console.log(`   ✅ API respondeu com sucesso (${eventCount} evento(s) na página 1)`);

    console.log('\n🌆 Teste 2: Busca filtrada por cidade (São Paulo)');
    const spSearch = await ticketmasterService.searchEvents({ city: 'São Paulo', size: 5 }, false);
    const spEvents = spSearch?._embedded?.events || [];
    if (spEvents.length > 0) {
      console.log(`   ✅ Encontrados ${spEvents.length} eventos em São Paulo`);
      console.log(`   → Primeiro evento: ${spEvents[0].name} (${spEvents[0].id})`);
    } else {
      console.log('   ⚠️  Nenhum evento encontrado para São Paulo (verifique filtros).');
    }

    if (spEvents[0]?.id) {
      console.log('\n📄 Teste 3: Detalhes do primeiro evento encontrado');
      const details = await ticketmasterService.getEventDetails(spEvents[0].id, false);
      console.log(`   ✅ Detalhes carregados: ${details?.name || 'Sem nome'} (${details?.id})`);
      console.log(`   🕒 Data: ${details?.dates?.start?.localDate || 'N/D'} ${details?.dates?.start?.localTime || ''}`);
      console.log(`   📍 Local: ${details?._embedded?.venues?.[0]?.name || 'N/D'}`);
    }

    console.log('\n🎉 Diagnóstico concluído com sucesso!');
  } catch (error) {
    console.error('\n💥 Falha em algum teste:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Erro:', error.message);
    }
  }
}

if (require.main === module) {
  diagnoseTicketmaster().catch((error) => {
    console.error('\n❌ Erro inesperado no diagnóstico:', error);
    process.exit(1);
  });
}

module.exports = { diagnoseTicketmaster };
