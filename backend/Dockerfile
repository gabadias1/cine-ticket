FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl build-base python3

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

COPY . .

# Configurar variáveis de ambiente
ENV DATABASE_URL="file:./dev.db"
ENV PORT=3001

RUN npx prisma generate
RUN npx prisma migrate dev --name init || true
RUN npm run seed

# Mudar para usuário não-root
USER nextjs

EXPOSE 3001
CMD ["npm", "run", "dev"]
