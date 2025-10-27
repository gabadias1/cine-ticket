const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const prisma = new PrismaClient();

async function initDatabase() {
  console.log('🔍 Verificando banco de dados...');
  
  let isDisconnected = false;
  
  // Verificar se o arquivo do banco existe
  const dbPath = path.join(__dirname, '../prisma/dev.db');
  const dbExists = fs.existsSync(dbPath);
  
  if (!dbExists || fs.statSync(dbPath).size === 0) {
    console.log('📦 Criando banco de dados...');
    fs.closeSync(fs.openSync(dbPath, 'w'));
  }
  
  try {
    // Tentar conectar ao banco
    await prisma.$connect();
    
    // Verificar se existem filmes no banco
    const movieCount = await prisma.movie.count();
    
    if (movieCount === 0) {
      console.log('📦 Banco de dados vazio. Aplicando migrations e populando com filmes...');
      
      // Rodar migrations
      console.log('  → Aplicando migrations...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (error) {
        console.log('  → Criando nova migration...');
        execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      }
      
      await prisma.$disconnect(); // Desconectar para evitar conflitos
      isDisconnected = true;
      
      // Rodar seed inicial (usuários, cinemas, etc)
      console.log('  → Criando dados iniciais (usuários, cinemas)...');
      execSync('npm run seed', { stdio: 'inherit' });
      
      // Sincronizar filmes do TMDB (máximo possível)
      console.log('  → Sincronizando MÁXIMO de filmes da TMDB (aguarde, pode levar alguns minutos)...');
      execSync('node scripts/syncMaximumMovies.js', { stdio: 'inherit' });
      
      console.log('✅ Banco de dados inicializado com sucesso!');
      return; // Sair da função já que finalizou
    } else {
      console.log(`✓ Banco de dados já possui ${movieCount} filmes.`);
      console.log('  → Verificando migrations pendentes...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (error) {
        // Ignorar erro se não houver migrations pendentes
        console.log('  → Nenhuma migration pendente.');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error.message);
    throw error;
  } finally {
    if (prisma && !isDisconnected) {
      await prisma.$disconnect();
    }
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal na inicialização:', error);
    process.exit(1);
  });

