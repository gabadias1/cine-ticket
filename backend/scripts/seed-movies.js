const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Limpar dados anteriores (opcional)
    // await prisma.movie.deleteMany({});
    // await prisma.session.deleteMany({});

    // Criar filmes de exemplo
    const moviesData = [
      {
        title: 'OPPENHEIMER',
        synopsis: 'A história de J. Robert Oppenheimer, o físico que desenvolveu a primeira bomba atômica durante a Segunda Guerra Mundial.',
        duration: 180,
        rating: '12',
        imageUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8kSQNmjT8rXrP2LeBiWymQV.jpg',
        posterPath: '/8Gxv8kSQNmjT8rXrP2LeBiWymQV.jpg',
        trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
        releaseDate: new Date('2023-07-21'),
        genres: 'Drama, História, Thriller',
        voteAverage: 8.1,
        voteCount: 5000,
        originalLanguage: 'en'
      },
      {
        title: 'WICKED',
        synopsis: 'A história de como a Bruxa Má do Oeste se tornou má, focando em sua amizade transformadora com Glinda, a Bruxa Boa.',
        duration: 160,
        rating: '12',
        imageUrl: 'https://image.tmdb.org/t/p/w500/4M86NpDrj4MzqLRwc4L2n67P5UY.jpg',
        posterPath: '/4M86NpDrj4MzqLRwc4L2n67P5UY.jpg',
        trailerUrl: 'https://www.youtube.com/embed/6COivy-jAEA',
        releaseDate: new Date('2024-11-22'),
        genres: 'Musical, Drama, Fantasia',
        voteAverage: 7.9,
        voteCount: 3000,
        originalLanguage: 'en'
      },
      {
        title: 'DUNE: PARTE DOIS',
        synopsis: 'Paul Atreides viaja para o planeta perigoso Arrakis para vingar a conspiração que destruiu sua família.',
        duration: 166,
        rating: '12',
        imageUrl: 'https://image.tmdb.org/t/p/w500/u3bVo7HM7MwURL69yPvMad5DBZE.jpg',
        posterPath: '/u3bVo7HM7MwURL69yPvMad5DBZE.jpg',
        trailerUrl: 'https://www.youtube.com/embed/_rpAsKiMHmY',
        releaseDate: new Date('2024-02-28'),
        genres: 'Ficção Científica, Ação, Aventura',
        voteAverage: 8.0,
        voteCount: 4500,
        originalLanguage: 'en'
      },
      {
        title: 'INSIDIOUS: A PORTA VERMELHA',
        synopsis: 'A família Lambert continua sendo atormentada por forças sobrenaturais em sua luta pela sobrevivência.',
        duration: 124,
        rating: '14',
        imageUrl: 'https://image.tmdb.org/t/p/w500/fz0rVSHw7GFowBfMN1pWHyHqGxc.jpg',
        posterPath: '/fz0rVSHw7GFowBfMN1pWHyHqGxc.jpg',
        trailerUrl: 'https://www.youtube.com/embed/4VsWzVNP9w8',
        releaseDate: new Date('2023-07-07'),
        genres: 'Terror, Thriller, Sobrenatural',
        voteAverage: 6.5,
        voteCount: 2000,
        originalLanguage: 'en'
      },
      {
        title: 'BARBIE',
        synopsis: 'Barbie é a rainha do mundo rosa de Barbie Land. Quando recebe uma identidade complexa, ela embarca em uma jornada no mundo real.',
        duration: 114,
        rating: 'L',
        imageUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xwRQVXFwMKrPIkN.jpg',
        posterPath: '/iuFNMS8U5cb6xwRQVXFwMKrPIkN.jpg',
        trailerUrl: 'https://www.youtube.com/embed/FCbWMUJPh9E',
        releaseDate: new Date('2023-07-21'),
        genres: 'Comédia, Fantasia, Aventura',
        voteAverage: 7.9,
        voteCount: 3500,
        originalLanguage: 'en'
      },
      {
        title: 'HOMEM-ARANHA: ATRAVÉS DO MULTIVERSO',
        synopsis: 'Miles Morales enfrenta uma nova ameaça e é convocado para enfrentar um grande mistério que abre caminho para o Multiverso.',
        duration: 140,
        rating: '10',
        imageUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4Cmn7ly0VHkaDNC11Yd.jpg',
        posterPath: '/1g0dhYtq4Cmn7ly0VHkaDNC11Yd.jpg',
        trailerUrl: 'https://www.youtube.com/embed/cqNjbERG8n0',
        releaseDate: new Date('2023-05-31'),
        genres: 'Ação, Ficção Científica, Aventura',
        voteAverage: 8.3,
        voteCount: 5500,
        originalLanguage: 'en'
      }
    ];

    let createdCount = 0;
    for (const movieData of moviesData) {
      try {
        await prisma.movie.create({
          data: movieData
        });
        createdCount++;
      } catch (error) {
        // Ignora se já existe
        console.log(`Filme ${movieData.title} já existe`);
      }
    }

    console.log(`${createdCount} filmes criados/atualizados`);

    // Verificar se há cinemas e salas para criar sessões
    const cinemas = await prisma.cinema.findMany();
    const halls = await prisma.hall.findMany();

    if (cinemas.length === 0) {
      console.log('Criando cinema de exemplo...');
      await prisma.cinema.create({
        data: {
          name: 'Cinemark Downtown',
          city: 'São Paulo',
          state: 'SP',
          address: 'Av. Paulista, 1000',
          latitude: -23.5505,
          longitude: -46.6333
        }
      });
    }

    // Criar algumas sessões para os filmes
    const allMovies = await prisma.movie.findMany();
    const cinema = await prisma.cinema.findFirst();

    if (cinema && halls.length === 0) {
      console.log('Criando salas de exemplo...');
      const templates = await prisma.hallTemplate.findMany();
      
      let template = templates[0];
      if (!template) {
        template = await prisma.hallTemplate.create({
          data: {
            name: 'Sala Standard',
            type: 'Standard',
            layout: JSON.stringify([['A', 'A', 'A', 'A', 'A']]),
            rowCount: 10,
            seatsPerRow: 10,
            features: 'Padrão'
          }
        });
      }

      const hall = await prisma.hall.create({
        data: {
          name: 'Sala 1',
          cinemaId: cinema.id,
          templateId: template.id,
          capacity: 100,
          features: 'Padrão'
        }
      });

      console.log('Criando sessões de exemplo...');
      for (let i = 0; i < allMovies.length && i < 3; i++) {
        const movie = allMovies[i];
        
        // Criar 2 sessões por filme em horários diferentes
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const session1 = new Date(tomorrow);
        session1.setHours(14, 0, 0, 0);
        
        const session2 = new Date(tomorrow);
        session2.setHours(19, 30, 0, 0);
        
        try {
          await prisma.session.create({
            data: {
              movieId: movie.id,
              hallId: hall.id,
              startsAt: session1,
              price: 30.00,
              language: 'Legendado'
            }
          });
          
          await prisma.session.create({
            data: {
              movieId: movie.id,
              hallId: hall.id,
              startsAt: session2,
              price: 40.00,
              language: 'Dublado'
            }
          });
        } catch (error) {
          console.log(`Sessões do filme ${movie.title} já existem`);
        }
      }

      console.log('Sessões criadas com sucesso!');
    }

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
