require('dotenv').config();
const ticketmasterService = require('../src/ticketmasterService');

async function testTicketmasterAPI() {
  console.log('🧪 Testando integração com a Ticketmaster...');

  if (!process.env.TICKETMASTER_API_KEY) {
    console.error('❌ TICKETMASTER_API_KEY não configurada. Configure-a em backend/.env.');
    process.exit(1);
  }

  try {
    console.log('\n1️⃣  Teste: Buscar eventos (Brasil, tamanho 5)');
    const response = await ticketmasterService.searchEvents({ size: 5 }, false);
    const events = response?._embedded?.events || [];
    console.log(`   → ${events.length} evento(s) retornados.`);

    if (events.length === 0) {
      throw new Error('A API respondeu, mas não retornou eventos. Verifique se há eventos disponíveis.');
    }

    const firstEvent = events[0];
    console.log(`   → Primeiro evento: ${firstEvent.name} (${firstEvent.id})`);

    console.log('\n2️⃣  Teste: Buscar detalhes do primeiro evento');
    const details = await ticketmasterService.getEventDetails(firstEvent.id, false);
    console.log(`   → Detalhes obtidos: ${details.name} | Local: ${details._embedded?.venues?.[0]?.name || 'N/D'}`);

    console.log('\n✅ Todos os testes concluídos com sucesso!');
  } catch (error) {
    console.error('\n❌ Falha nos testes Ticketmaster.');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Erro:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  testTicketmasterAPI();
}

module.exports = { testTicketmasterAPI };
