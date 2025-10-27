#!/bin/sh

echo "🔍 Verificando banco de dados..."

# Verificar se o banco existe e tem dados
if [ ! -f "prisma/dev.db" ] || [ ! -s "prisma/dev.db" ]; then
  echo "📦 Banco de dados vazio ou não existe. Criando..."
  npx prisma migrate deploy
  
  # Verificar se tem tabelas e dados
  if ! sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Movie;" > /dev/null 2>&1; then
    echo "🌱 Populando banco de dados com seed..."
    npm run seed
  fi
else
  echo "✓ Banco de dados já existe, verificando migrations..."
  npx prisma migrate deploy
fi

echo "✅ Banco de dados pronto!"

