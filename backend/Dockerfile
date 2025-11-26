FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl build-base python3 dos2unix

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

COPY . .

# Converter entrypoint para LF (Unix) para evitar erros no Windows
RUN dos2unix /app/docker-entrypoint.sh

# Configurar variáveis de ambiente
ENV DATABASE_URL="file:./dev.db"
ENV PORT=3001

# Mudar para usuário não-root
USER nextjs

EXPOSE 3001

# Executar inicialização do banco no entrypoint e depois iniciar o servidor
USER root
RUN chmod +x /app/docker-entrypoint.sh
USER nextjs
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
