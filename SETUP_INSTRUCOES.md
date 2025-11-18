# 🚀 Como Executar o Projeto

## ✅ Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Git (opcional)

## 📦 Instalação

### 1. Instale as dependências do projeto raiz

```bash
cd c:\Users\gabri\Desktop\cine-ticket
npm install
```

### 2. Instale as dependências do backend

```bash
cd backend
npm install
```

## ⚙️ Configuração do Banco de Dados

### 1. Setup do Prisma

```bash
cd backend

# Gerar cliente Prisma
npx prisma generate

# Aplicar migrations (já foram executadas)
npx prisma migrate deploy

# (Opcional) Resetar banco de dados
# npx prisma migrate reset
```

## 🏃 Executar o Projeto

### Opção 1: Rodando Backend e Frontend Separadamente

#### Terminal 1 - Backend (API)
```bash
cd backend
npm run dev
```
Saída esperada:
```
CineTicket backend running on http://localhost:3001
```

#### Terminal 2 - Frontend (Web)
```bash
npm run dev
```
Saída esperada:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Opção 2: Rodando Tudo de Uma Vez (Do diretório raiz)

```bash
npm run dev:all
```

## 🌐 Acessar a Aplicação

Abra seu navegador e acesse:

```
http://localhost:3000
```

## 🧪 Primeiros Passos

1. **Criar uma Conta**
   - Clique em "Entrar" → "Cadastre-se"
   - Preencha: Nome, Email, Senha
   - Clique em "Criar Conta"

2. **Navegar para Filmes**
   - Clique em "Filmes" no menu
   - Selecione um filme
   - Escolha uma sessão

3. **Selecionar Assentos**
   - Escolha 2-3 assentos
   - Defina tipo (Inteira/Meia)
   - Clique em "Pagar"

4. **Processar Pagamento**
   
   **Com Cartão (Crédito/Débito):**
   - Número: `4111111111111111`
   - Titular: `SEU NOME`
   - Mês: `12`
   - Ano: `25`
   - CVV: `123`
   - Clique em "Pagar"

   **Com PIX:**
   - Digite seu nome
   - Clique em "Gerar Código PIX"
   - Copie o código
   - Aguarde processamento

5. **Ver Ingressos no Perfil**
   - Será redirecionado automaticamente
   - Veja seus ingressos na aba "🎫 Ingressos de Cinema"

## 📁 Estrutura de Pastas

```
cine-ticket/
├── pages/
│   ├── pagamento.js           ✨ NOVO - Página de pagamento
│   ├── perfil.js              ✨ NOVO - Perfil do usuário
│   ├── filmes.js
│   ├── eventos.js
│   ├── login.js
│   ├── register.js
│   └── assentos/
│       ├── [id]1.js           ✏️ MODIFICADO
│       ├── [id]2.js           ✏️ MODIFICADO
│       ├── [id]3.js           ✏️ MODIFICADO
│       └── [id]4.js           ✏️ MODIFICADO
│
├── backend/
│   ├── src/
│   │   └── index.js           ✏️ MODIFICADO - Novos endpoints
│   ├── prisma/
│   │   ├── schema.prisma      ✏️ MODIFICADO - Modelo Payment
│   │   └── migrations/
│   │       └── 20251118204137_add_payment_model/
│   └── .env                   ✓ Configurado
│
├── utils/
│   └── api.js                 ✏️ MODIFICADO - Novos métodos
│
├── contexts/
│   └── AuthContext.js         ✓ Sem alterações
│
├── PAGAMENTO_README.md        ✨ NOVO - Documentação
├── FLUXO_PAGAMENTO.md         ✨ NOVO - Fluxo detalhado
└── SETUP_INSTRUCOES.md        ✨ NOVO - Este arquivo
```

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

```env
DATABASE_URL="file:./dev.db"
TMDB_API_KEY="sua_chave_aqui"
TMDB_ACCESS_TOKEN="seu_token_aqui"
PORT=3001
```

### Frontend (variáveis implícitas)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### Erro: "Port 3000 is already in use"

```bash
# Windows - Liberar porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou use porta diferente
npm run dev -- -p 3001
```

### Erro: "Port 3001 is already in use"

```bash
# Windows - Liberar porta 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Erro: "Cannot find module '@prisma/client'"

```bash
cd backend
npm install @prisma/client prisma
npx prisma generate
```

### Erro: "Database file not found"

```bash
cd backend
npx prisma migrate deploy
# ou
npx prisma migrate reset --force
```

### API retorna 404

- Certifique-se de que o backend está rodando em `http://localhost:3001`
- Verifique a variável `NEXT_PUBLIC_API_URL` em `utils/api.js`
- Reinicie o frontend após iniciar o backend

## 📝 Logs Úteis

### Frontend
Abra o console do navegador (F12) para ver logs de:
- Requisições de API
- Erros de validação
- Redirecionamentos

### Backend
```bash
# Ativar verbose logging
DEBUG=* npm run dev

# Ou verificar logs específicos
npm run dev 2>&1 | grep -i "payment\|error"
```

## 🧹 Limpeza

### Resetar Banco de Dados

```bash
cd backend
npx prisma migrate reset --force
```

### Limpar Cache do Node

```bash
# Frontend
rm -r node_modules .next
npm install

# Backend
cd backend
rm -r node_modules
npm install
```

## 📊 Verificar Status

### Saúde do Backend

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{ "ok": true }
```

### Listar Filmes

```bash
curl http://localhost:3001/movies
```

### Listar Sessões

```bash
curl http://localhost:3001/sessions
```

## 🎮 Teste Rápido (Sem UI)

### 1. Criar Usuário

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@email.com",
    "password": "123456"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "123456"
  }'
```

### 3. Processar Pagamento

```bash
curl -X POST http://localhost:3001/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "method": "CREDITO",
    "totalAmount": 45.00,
    "paymentData": {
      "tipo": "CREDITO",
      "ultimosDigitos": "1111",
      "titular": "TESTE"
    },
    "ticketDetails": [
      {
        "sessionId": 1,
        "seatId": 1,
        "price": 30.00
      }
    ]
  }'
```

### 4. Buscar Ingressos

```bash
curl http://localhost:3001/user/1/tickets
```

## ✅ Checklist de Setup

- [ ] Node.js 16+ instalado
- [ ] npm install (projeto raiz)
- [ ] npm install (backend)
- [ ] .env configurado (backend)
- [ ] npx prisma migrate deploy
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] Navegador acessando http://localhost:3000
- [ ] Painel do navegador aberto (F12 para ver logs)

## 🎯 Próximos Passos Após Setup

1. **Teste a página de login**
   - Crie uma conta
   - Faça login

2. **Teste o fluxo de compra**
   - Navegue para Filmes
   - Selecione assentos
   - Complete o pagamento

3. **Verifique o perfil**
   - Acesse /perfil
   - Veja os ingressos salvos

4. **Explore as integrações**
   - Teste PIX
   - Teste cartão
   - Veja as validações

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do backend e frontend
2. Certifique-se de que as portas 3000 e 3001 estão livres
3. Reinicie o servidor (Ctrl+C e npm run dev novamente)
4. Limpe o cache do navegador (Ctrl+Shift+Delete)
5. Verifique o arquivo .env no backend

## 📚 Documentação Adicional

- `PAGAMENTO_README.md` - Funcionalidades do sistema de pagamento
- `FLUXO_PAGAMENTO.md` - Visualização e fluxo de dados
- `README.md` - Documentação geral do projeto (se existir)

---

**Setup Completo! Você está pronto para começar! 🎉**
