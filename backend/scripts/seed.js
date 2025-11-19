require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { syncMaximumMoviesFromTMDB } = require('./syncMaximumMovies');
const { syncTicketmasterEvents } = require('./syncTicketmasterEvents');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.ticket.deleteMany();
  await prisma.eventTicket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.event.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário de teste
  const user = await prisma.user.create({
    data: {
      name: 'Usuário Teste',
      email: 'teste@mail.com',
      password: '123456'
    }
  });

  // Criar cinemas
  const cinema1 = await prisma.cinema.create({
    data: {
      name: 'Cine Center',
      city: 'Campo Mourão',
      state: 'PR',
      address: 'Rua Principal, 123'
    }
  });

  const cinema2 = await prisma.cinema.create({
    data: {
      name: 'Cinemark',
      city: 'Campo Mourão',
      state: 'PR',
      address: 'Avenida Central, 456'
    }
  });

  // Criar template de sala
  const template1 = await prisma.hallTemplate.create({
    data: {
      name: 'Template Standard',
      type: 'STANDARD',
      layout: '{"rows": 10, "seatsPerRow": 15}',
      rowCount: 10,
      seatsPerRow: 15,
      features: 'Som digital, Projeção HD'
    }
  });

  // Criar salas
  const hall1 = await prisma.hall.create({
    data: {
      name: 'Sala 1',
      capacity: 150,
      cinemaId: cinema1.id,
      templateId: template1.id,
      features: 'Som digital, Projeção HD'
    }
  });

  const hall2 = await prisma.hall.create({
    data: {
      name: 'Sala 2',
      capacity: 200,
      cinemaId: cinema2.id,
      templateId: template1.id,
      features: 'Som digital, Projeção HD'
    }
  });

  const sessionConfigs = [
    { hallId: hall1.id, hour: 15, minute: 30, language: 'Dublado', price: 32.5 },
    { hallId: hall2.id, hour: 19, minute: 45, language: 'Legendado', price: 34.9 }
  ];

  const ensureSessionsForMovies = async () => {
    const movies = await prisma.movie.findMany({
      include: { sessions: true }
    });

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const sessionsToCreate = [];

    for (const [movieIndex, movie] of movies.entries()) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date(baseDate);
        targetDate.setDate(baseDate.getDate() + dayOffset);

        const hasSessionForDay = movie.sessions.some((session) => {
          const sessionDate = new Date(session.startsAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === targetDate.getTime();
        });

        if (!hasSessionForDay) {
          const config = sessionConfigs[(movieIndex + dayOffset) % sessionConfigs.length];
          const startsAt = new Date(targetDate);
          startsAt.setHours(config.hour, config.minute, 0, 0);

          sessionsToCreate.push({
            movieId: movie.id,
            hallId: config.hallId,
            startsAt,
            price: config.price,
            language: config.language
          });
        }
      }
    }

    if (sessionsToCreate.length) {
      await prisma.session.createMany({ data: sessionsToCreate });
    }

    console.log(`🎟️ Sessões garantidas: ${sessionsToCreate.length} novas para ${movies.length} filmes.`);
  };

  // Criar assentos para a sala 1
  const seats1 = [];
  for (let row = 0; row < 10; row++) {
    for (let seat = 1; seat <= 15; seat++) {
      if (row === 0 && (seat < 3 || seat > 12)) continue; // Pular assentos vazios
      if (row === 1 && (seat === 1 || seat === 15)) continue; // Pular assentos vazios
      
      seats1.push({
        hallId: hall1.id,
        row: String.fromCharCode(65 + row), // A, B, C, etc.
        number: seat,
        position: JSON.stringify({ x: seat, y: row })
      });
    }
  }

  await prisma.seat.createMany({
    data: seats1
  });

  // Criar assentos para a sala 2
  const seats2 = [];
  for (let row = 0; row < 10; row++) {
    for (let seat = 1; seat <= 15; seat++) {
      if (row === 0 && (seat < 3 || seat > 12)) continue;
      if (row === 1 && (seat === 1 || seat === 15)) continue;
      
      seats2.push({
        hallId: hall2.id,
        row: String.fromCharCode(65 + row),
        number: seat,
        position: JSON.stringify({ x: seat, y: row })
      });
    }
  }

  await prisma.seat.createMany({
    data: seats2
  });

  // Criar filmes
  const movie1 = await prisma.movie.create({
    data: {
      title: 'Invocação do mal 4',
      synopsis: 'Filme de terror baseado em eventos reais',
      duration: 166, // 2h 46min
      rating: '14',
      releaseDate: new Date('2024-01-01'),
      genres: 'Terror, Suspense'
    }
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'Demon Slayer: Kimetsu No Yaiba - Castelo Infinito',
      synopsis: 'Animação japonesa baseada no mangá',
      duration: 155, // 2h 35min
      rating: '18',
      releaseDate: new Date('2024-02-01'),
      genres: 'Anime, Ação, Aventura'
    }
  });

  const movie3 = await prisma.movie.create({
    data: {
      title: 'Os caras malvados 2',
      synopsis: 'Animação de comédia',
      duration: 152, // 2h 32min
      rating: '12',
      releaseDate: new Date('2024-03-01'),
      genres: 'Animação, Comédia'
    }
  });

  await ensureSessionsForMovies();

  const hasTMDBCredentials = process.env.TMDB_API_KEY && process.env.TMDB_ACCESS_TOKEN;
  const hasTicketmasterCredentials = process.env.TICKETMASTER_API_KEY;

  if (hasTMDBCredentials) {
    console.log('\n🎬 Sincronizando catálogo completo da TMDB...');
    try {
      await syncMaximumMoviesFromTMDB();

      console.log('\n🎟️ Garantindo sessões para todos os filmes...');
      await ensureSessionsForMovies();
    } catch (error) {
      console.error('❌ Falha ao sincronizar catálogo TMDB:', error.message);
    }
  } else {
    console.warn('\n⚠️  Variáveis TMDB_API_KEY/TMDB_ACCESS_TOKEN não presentes. Pulando sincronização TMDB.');
  }

  if (hasTicketmasterCredentials) {
    console.log('\n🎪 Sincronizando eventos do Ticketmaster (Brasil)...');
    try {
      await syncTicketmasterEvents();
    } catch (error) {
      console.error('❌ Falha ao sincronizar eventos do Ticketmaster:', error.message);
    }
  } else {
    console.warn('\n⚠️  Variável TICKETMASTER_API_KEY não presente. Pulando sincronização de eventos do Ticketmaster.');
  }

  console.log('\nSeed concluído com sucesso!');
  console.log(`Usuário criado: ${user.email}`);
  console.log(`Filmes manuais criados: ${movie1.title}, ${movie2.title}, ${movie3.title}`);
  console.log(`Cinemas criados: ${cinema1.name}, ${cinema2.name}`);

  const totalMovies = await prisma.movie.count();
  const totalSessions = await prisma.session.count();
  const totalEvents = await prisma.event.count();
  console.log(`🎬 Total de filmes no banco: ${totalMovies}`);
  console.log(`🎭 Total de sessões geradas (7 dias): ${totalSessions}`);
  console.log(`🎪 Total de eventos no banco: ${totalEvents}`);
}

main()
  .catch((e) => {
    console.error(' Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
