#!/bin/sh

set -e

echo "🚀 Iniciando CineTicket Backend..."

# Executar inicialização do banco de dados
echo "📦 Verificando banco de dados..."
npm run init-db

# Iniciar o servidor
echo "▶️  Iniciando servidor..."
exec "$@"

