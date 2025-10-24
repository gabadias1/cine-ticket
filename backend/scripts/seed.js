const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.ticket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário de teste
  const user = await prisma.user.create({
    data: {
      email: 'teste@mail.com',
      name: 'Usuário Teste',
      password: '123456'
    }
  });

  // Criar cinemas
  const cinema1 = await prisma.cinema.create({
    data: {
      name: 'Cine Center',
      city: 'Campo Mourão'
    }
  });

  const cinema2 = await prisma.cinema.create({
    data: {
      name: 'Cinemark',
      city: 'Campo Mourão'
    }
  });

  // Criar salas
  const hall1 = await prisma.hall.create({
    data: {
      name: 'Sala 1',
      capacity: 150,
      cinemaId: cinema1.id
    }
  });

  const hall2 = await prisma.hall.create({
    data: {
      name: 'Sala 2',
      capacity: 200,
      cinemaId: cinema2.id
    }
  });

  // Criar assentos para a sala 1
  const seats1 = [];
  for (let row = 0; row < 10; row++) {
    for (let seat = 1; seat <= 15; seat++) {
      if (row === 0 && (seat < 3 || seat > 12)) continue; // Pular assentos vazios
      if (row === 1 && (seat === 1 || seat === 15)) continue; // Pular assentos vazios
      
      seats1.push({
        hallId: hall1.id,
        row: String.fromCharCode(65 + row), // A, B, C, etc.
        number: seat
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
        number: seat
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
      rating: '14'
    }
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'Demon Slayer: Kimetsu No Yaiba - Castelo Infinito',
      synopsis: 'Animação japonesa baseada no mangá',
      duration: 155, // 2h 35min
      rating: '18'
    }
  });

  const movie3 = await prisma.movie.create({
    data: {
      title: 'Os caras malvados 2',
      synopsis: 'Animação de comédia',
      duration: 152, // 2h 32min
      rating: '12'
    }
  });

  // Criar sessões
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessions = [
    {
      movieId: movie1.id,
      hallId: hall1.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
      price: 30.00
    },
    {
      movieId: movie1.id,
      hallId: hall1.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
      price: 30.00
    },
    {
      movieId: movie1.id,
      hallId: hall1.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 30),
      price: 30.00
    },
    {
      movieId: movie2.id,
      hallId: hall2.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      price: 25.00
    },
    {
      movieId: movie2.id,
      hallId: hall2.id,
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 40),
      price: 25.00
    },
    {
      movieId: movie3.id,
      hallId: hall1.id,
      startsAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 13, 30),
      price: 20.00
    }
  ];

  for (const session of sessions) {
    await prisma.session.create({
      data: session
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`👤 Usuário criado: ${user.email}`);
  console.log(`🎬 Filmes criados: ${movie1.title}, ${movie2.title}, ${movie3.title}`);
  console.log(`🏢 Cinemas criados: ${cinema1.name}, ${cinema2.name}`);
  console.log(`🎭 Sessões criadas: ${sessions.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
