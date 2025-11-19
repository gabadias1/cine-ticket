require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const ticketmasterService = require('../src/ticketmasterService');

const prisma = new PrismaClient();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function syncTicketmasterEvents() {
  try {
    console.log('🎫 Iniciando sincronização de eventos do Ticketmaster (Brasil)...\n');

    let page = 0; // Ticketmaster usa paginação baseada em zero
    const maxPages = 10;
    const size = 50;
    let totalSynced = 0;
    let totalSkipped = 0;
    const errors = [];
    let hasMore = true;

    while (hasMore && page < maxPages) {
      console.log(`📄 Buscando página ${page + 1} (size=${size})...`);
      try {
        const response = await ticketmasterService.searchEvents({ page, size }, false);
        const events = response?._embedded?.events || [];

        console.log(`   → ${events.length} eventos retornados`);

        if (events.length === 0) {
          console.log('   ℹ️  Nenhum evento retornado. Encerrando sincronização.');
          break;
        }

        for (const tmEvent of events) {
          const ticketmasterId = tmEvent.id;
          if (!ticketmasterId) {
            console.log('   ⚠️  Evento sem ID, ignorando.');
            totalSkipped++;
            continue;
          }

          const existing = await prisma.event.findUnique({
            where: { ticketmasterId }
          });

          if (existing) {
            totalSkipped++;
            console.log(`   ⏭️  Evento já existe: ${existing.title}`);
            continue;
          }

          try {
            const eventData = ticketmasterService.convertTicketmasterEventToLocal(tmEvent);
            const created = await prisma.event.create({ data: eventData });
            totalSynced++;
            console.log(`   ✅ Sincronizado: ${created.title} (${created.city}, ${created.state})`);
            await delay(100);
          } catch (error) {
            console.error(`   ❌ Erro ao salvar evento ${ticketmasterId}:`, error.message);
            errors.push({ ticketmasterId, error: error.message });
          }
        }

        const pageInfo = response.page || {};
        if (typeof pageInfo.totalPages === 'number') {
          hasMore = page < pageInfo.totalPages - 1;
        } else if (typeof pageInfo.totalElements === 'number') {
          const processed = (page + 1) * size;
          hasMore = processed < pageInfo.totalElements;
        } else {
          hasMore = response?._links?.next ? true : false;
        }

        page++;
        if (hasMore) {
          await delay(500);
        }
      } catch (error) {
        console.error(`   ❌ Erro ao buscar página ${page + 1}:`, error.message);
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Dados:', JSON.stringify(error.response.data, null, 2));
        }
        errors.push({ page: page + 1, error: error.message });
        break;
      }
    }

    console.log('\n✅ Sincronização concluída!');
    console.log(`   Eventos sincronizados: ${totalSynced}`);
    console.log(`   Eventos ignorados: ${totalSkipped}`);
    console.log(`   Erros: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Detalhes dos erros:');
      errors.forEach((err, index) => {
        console.log(`   ${index + 1}.`, err);
      });
    }

    return { totalSynced, totalSkipped, errors };
  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  syncTicketmasterEvents()
    .then(() => {
      console.log('\n🎉 Processo finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha na sincronização:', error);
      process.exit(1);
    });
}

module.exports = { syncTicketmasterEvents };
