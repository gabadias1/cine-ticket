# 🎟️ Fluxo de Pagamento - Visualização Completa

## 📍 Rotas Implementadas

### Página 1: Seleção de Assentos
**Rota:** `/assentos/[id]1.js` | `/assentos/[id]2.js` | `/assentos/[id]3.js`

```
┌─────────────────────────────────────┐
│  TELA DO CINEMA                     │
│  ┌─────────────────────────┐        │
│  │ [A] [A] [A] [A] [A]     │        │
│  │ [A] [✓] [✓] [A] [A]     │  Sala │
│  │ [A] [A] [A] [A] [A]     │        │
│  │ [A] [A] [R] [A] [A]     │        │
│  │ [R] [A] [A] [A] [A]     │        │
│  └─────────────────────────┘        │
│                                     │
│  Selecionados: 2 assentos           │
│  Total: R$ 60,00                    │
│                                     │
│  [Limpar]  [➜ PAGAR]               │
└─────────────────────────────────────┘
```

**O que acontece ao clicar "Pagar":**
- ✅ Valida se há assentos selecionados
- ✅ Valida se usuário está logado
- ✅ Salva dados em `sessionStorage`
- ✅ Redireciona para `/pagamento`

---

### Página 2: Pagamento
**Rota:** `/pagamento`

```
┌─────────────────────────────────────┐
│  💳 PAGAMENTO                       │
│                                     │
│  Resumo do Pedido                   │
│  ┌─────────────────────────────────┐│
│  │ Ingresso 1 (Inteira) - R$ 30,00 ││
│  │ Ingresso 2 (Meia) - R$ 15,00    ││
│  ├─────────────────────────────────┤│
│  │ TOTAL: R$ 45,00                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Métodos de Pagamento:              │
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ 💳  │  │ 🏦  │  │ 📱  │         │
│  │ CRÉ │  │ DBT │  │ PIX │         │
│  └─────┘  └─────┘  └─────┘         │
│       (Crédito selecionado)         │
│                                     │
│  Número do Cartão                   │
│  [0000 0000 0000 0000]             │
│                                     │
│  Titular                            │
│  [_____________________]            │
│                                     │
│  Mês      Ano      CVV             │
│  [MM]     [YY]     [XXX]           │
│                                     │
│  [Pagar R$ 45,00]                  │
└─────────────────────────────────────┘
```

#### Validações Implementadas:

**Crédito/Débito:**
- ✅ Número: 13-19 dígitos
- ✅ Titular: mínimo 3 caracteres
- ✅ Mês: 01-12
- ✅ Ano: ≥ ano atual
- ✅ CVV: 3-4 dígitos

**PIX:**
```
┌─────────────────────────────────────┐
│  Nome do Titular                    │
│  [_____________________]            │
│                                     │
│  [Gerar Código PIX]                │
│                                     │
│  Seu código PIX:                    │
│  ┌─────────────────────────────────┐│
│  │ PIX-A7X9K2M5L8Q1R4P7            ││
│  ├─────────────────────────────────┤│
│  │ [Copiar Código]                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ⏱️ Processando pagamento...        │
│  Seus ingressos serão salvos em     │
│  breve!                             │
└─────────────────────────────────────┘
```

**O que acontece após pagamento bem-sucedido:**
- ✅ Cria registro em `Payment` (sem número de cartão)
- ✅ Cria registros em `Ticket` para cada assento
- ✅ Limpa dados de `sessionStorage`
- ✅ Redireciona para `/perfil?tab=ingressos`

---

### Página 3: Perfil do Usuário
**Rota:** `/perfil`

```
┌─────────────────────────────────────┐
│  👤 MEU PERFIL                      │
│                                     │
│  [🎫 Ingressos Cinema (2)]         │
│  [🎭 Ingressos de Eventos (0)]     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🎬 OPPENHEIMER                  ││
│  │ 📅 18/11/2025  ⏰ 19:30         ││
│  │ 💺 A-5                          ││
│  │ 💰 R$ 30,00                     ││
│  │ ✓ Ativo                          ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🎬 WICKED                       ││
│  │ 📅 19/11/2025  ⏰ 21:00         ││
│  │ 💺 B-8                          ││
│  │ 💰 R$ 15,00 (Meia)              ││
│  │ ✓ Ativo                          ││
│  └─────────────────────────────────┘│
│                                     │
│  [← Voltar para home]               │
└─────────────────────────────────────┘
```

**Informações Exibidas:**
- Filme/Evento
- Data e Hora
- Assento
- Preço
- Status (Ativo, Usado, Cancelado, Reembolsado)
- Data de compra

---

## 🔄 Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Assentos] → sessionStorage → [Pagamento] → API call  │
│     ↓                              ↓                    │
│  Map dados                  POST /payment/process       │
│                                    ↓                    │
└────────────────────────────────────┼────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Express/Prisma)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  POST /payment/process                                  │
│    ↓                                                    │
│  ✓ Validar dados                                        │
│    ↓                                                    │
│  ✓ Criar Payment (sem números de cartão)               │
│    ↓                                                    │
│  ✓ Criar Tickets para cada assento                     │
│    ↓                                                    │
│  ✓ Retornar sucesso                                    │
│                                                         │
└────────────────────────────────────┬────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (SQLite)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Payment {                                              │
│    id: 1                                                │
│    userId: 123                                          │
│    method: "CREDITO"                                    │
│    totalAmount: 45.00                                   │
│    status: "COMPLETED"                                  │
│    paymentData: { ... }                                 │
│    ticketDetails: [ ... ]                              │
│  }                                                      │
│                                                         │
│  Ticket {                                               │
│    id: 456                                              │
│    userId: 123                                          │
│    sessionId: 789                                       │
│    seatId: 101                                          │
│    price: 30.00                                         │
│    status: "ACTIVE"                                     │
│  }                                                      │
│                                                         │
│  Ticket {                                               │
│    id: 457                                              │
│    userId: 123                                          │
│    sessionId: 789                                       │
│    seatId: 102                                          │
│    price: 15.00                                         │
│    status: "ACTIVE"                                     │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GET /user/:userId/tickets                              │
│    ↓                                                    │
│  [Perfil] → Exibir ingressos do usuário                 │
│    ↓                                                    │
│  ✓ Filme                                                │
│  ✓ Sessão (data/hora)                                   │
│  ✓ Assento                                              │
│  ✓ Status                                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Segurança - O Que Não Salvamos

❌ **NÃO salvamos:**
- Número completo do cartão
- CVV
- Data de expiração completa

✅ **Salvamos apenas:**
- Últimos 4 dígitos (para referência)
- Tipo de pagamento (CREDITO, DEBITO, PIX)
- Código PIX (se aplicável)
- Dados ofuscados em JSON

---

## 📊 Estrutura do Banco de Dados

```sql
-- Tabela Payment (NOVA)
CREATE TABLE Payment (
  id INTEGER PRIMARY KEY,
  userId INTEGER NOT NULL,
  method TEXT,              -- CREDITO, DEBITO, PIX
  totalAmount DECIMAL,
  status TEXT,              -- PENDING, COMPLETED, FAILED, CANCELLED
  paymentData TEXT,         -- JSON ofuscado
  pixCode TEXT,            -- Código PIX único
  ticketDetails TEXT,      -- JSON com detalhes dos ingressos
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- Tabela Ticket (MODIFICADA)
-- Agora criada automaticamente ao processar pagamento
CREATE TABLE Ticket (
  id INTEGER PRIMARY KEY,
  userId INTEGER NOT NULL,
  sessionId INTEGER NOT NULL,
  seatId INTEGER NOT NULL,
  price DECIMAL,
  status TEXT,             -- ACTIVE, USED, CANCELLED, REFUNDED
  qrCode TEXT,
  createdAt DATETIME,
  validatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (sessionId) REFERENCES Session(id),
  FOREIGN KEY (seatId) REFERENCES Seat(id)
);
```

---

## 🎯 Exemplos de Requisições API

### Processar Pagamento com Cartão

```bash
POST /payment/process

{
  "userId": 123,
  "method": "CREDITO",
  "totalAmount": 45.00,
  "paymentData": {
    "tipo": "CREDITO",
    "ultimosDigitos": "1111",
    "titular": "JOAO SILVA"
  },
  "ticketDetails": [
    {
      "sessionId": 789,
      "seatId": 101,
      "price": 30.00
    },
    {
      "sessionId": 789,
      "seatId": 102,
      "price": 15.00
    }
  ]
}
```

### Processar Pagamento com PIX

```bash
POST /payment/process

{
  "userId": 123,
  "method": "PIX",
  "totalAmount": 45.00,
  "paymentData": {
    "tipo": "PIX",
    "pixCode": "PIX-A7X9K2M5L8Q1R4P7",
    "titular": "MARIA SANTOS"
  },
  "ticketDetails": [...]
}
```

### Buscar Ingressos do Usuário

```bash
GET /user/123/tickets

Resposta:
[
  {
    "id": 456,
    "userId": 123,
    "sessionId": 789,
    "seatId": 101,
    "price": 30.00,
    "status": "ACTIVE",
    "createdAt": "2025-11-18T...",
    "session": {
      "startsAt": "2025-11-18T19:30:00Z",
      "movie": {
        "id": 1,
        "title": "OPPENHEIMER"
      }
    },
    "seat": {
      "row": "A",
      "number": 5
    }
  }
]
```

---

## ✅ Testes Recomendados

### 1. Teste de Fluxo Completo

```
1. Acesse: http://localhost:3000/filmes
2. Selecione um filme
3. Escolha uma sessão
4. Clique em "Selecionar Assentos"
5. Escolha 2 assentos (um inteira, um meia)
6. Clique em "Pagar"
7. Na página de pagamento, escolha "Crédito"
8. Preencha os dados:
   - Número: 4111 1111 1111 1111
   - Titular: USUARIO TESTE
   - Mês: 12
   - Ano: 25
   - CVV: 123
9. Clique em "Pagar"
10. Será redirecionado para o perfil
11. Veja seus ingressos na aba "🎫 Ingressos de Cinema"
```

### 2. Teste PIX

```
1. Repita os passos 1-6 acima
2. Na página de pagamento, escolha "PIX"
3. Digite seu nome
4. Clique em "Gerar Código PIX"
5. Copie o código (deve aparecer "✓ Copiado!")
6. Veja a mensagem "⏱️ Processando pagamento..."
7. Aguarde 2 segundos
8. Será redirecionado para o perfil com seus ingressos
```

### 3. Teste de Validações

```
Cartão inválido:
- Menos de 13 dígitos: ❌ Erro
- Mais de 19 dígitos: ❌ Erro
- Caracteres: ❌ Erro (apenas números)
- Data expirada: ❌ Erro
- CVV com letras: ❌ Erro
- Nome vazio: ❌ Erro
```

---

## 🚀 Próximas Integrações Possíveis

1. **Stripe/PayPal** - Pagamento real
2. **SMS/Email** - Notificações
3. **QR Code** - Validação no cinema
4. **Admin Panel** - Gerenciar pagamentos
5. **Relatórios** - Dashboard de vendas
6. **Reembolso** - Sistema de devoluções
7. **Cupons** - Desconto promocional
8. **Assinatura** - Planos VIP

---

**Documentação Completa ✅**
