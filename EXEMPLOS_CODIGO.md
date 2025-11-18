# 💻 EXEMPLOS DE CÓDIGO - REFERÊNCIA RÁPIDA

## 🔴 Como Integrar em Sua Aplicação

### 1. Redirecionar para Pagamento (de pages/assentos/[id].js)

```javascript
function pagar() {
  if (selecionados.size === 0) { 
    alert('Nenhum assento selecionado!'); 
    return; 
  }
  if (!user) { 
    router.push('/login'); 
    return; 
  }
  
  // Preparar dados
  const ingressos = Array.from(selecionados.entries()).map(([seatId, info]) => ({
    seatId,
    sessionId: parseInt(router.query.sessionId),
    tipo: info.ingresso,
    preco: info.preco
  }));
  
  // Salvar e redirecionar
  sessionStorage.setItem('ingressoData', JSON.stringify(ingressos));
  router.push(`/pagamento?ingressos=${encodeURIComponent(JSON.stringify(ingressos))}`);
}
```

---

### 2. Processar Pagamento (no backend)

```javascript
app.post('/payment/process', async (req, res) => {
  const { userId, method, totalAmount, paymentData, ticketDetails } = req.body;
  
  // Validar
  if (!userId || !method || !totalAmount || !ticketDetails) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  if (!['CREDITO', 'DEBITO', 'PIX'].includes(method)) {
    return res.status(400).json({ error: 'Método inválido' });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Gerar PIX se necessário
    let pixCode = null;
    if (method === 'PIX') {
      pixCode = 'PIX-' + Math.random().toString(36).substring(2, 15).toUpperCase();
    }
    
    // Salvar pagamento
    const payment = await prisma.payment.create({
      data: {
        userId: parseInt(userId),
        method,
        totalAmount,
        status: 'COMPLETED',
        paymentData: JSON.stringify(paymentData || {}),
        pixCode,
        ticketDetails: JSON.stringify(ticketDetails)
      }
    });
    
    // Criar tickets
    const tickets = [];
    const ticketsData = Array.isArray(ticketDetails) ? ticketDetails : JSON.parse(ticketDetails);
    
    for (const ticketData of ticketsData) {
      const ticket = await prisma.ticket.create({
        data: {
          userId: parseInt(userId),
          sessionId: parseInt(ticketData.sessionId),
          seatId: parseInt(ticketData.seatId),
          price: parseFloat(ticketData.price)
        }
      });
      tickets.push(ticket);
    }
    
    res.status(201).json({
      message: 'Pagamento processado',
      payment,
      tickets
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});
```

---

### 3. Validar Cartão (Frontend)

```javascript
const validarNumeroCartao = (numero) => {
  const limpo = numero.replace(/\s/g, '');
  return limpo.length >= 13 && limpo.length <= 19 && /^\d+$/.test(limpo);
};

const validarDataExpiracao = (mes, ano) => {
  if (!mes || !ano) return false;
  const mesNum = parseInt(mes);
  const anoNum = parseInt(ano);
  if (mesNum < 1 || mesNum > 12) return false;
  if (anoNum < new Date().getFullYear() % 100) return false;
  return true;
};

const validarCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

// Uso
if (!validarNumeroCartao(cartao.numero)) {
  setErro('Número do cartão inválido');
  return;
}

if (!validarDataExpiracao(cartao.mes, cartao.ano)) {
  setErro('Data de expiração inválida');
  return;
}

if (!validarCVV(cartao.cvv)) {
  setErro('CVV inválido');
  return;
}
```

---

### 4. Chamar API de Pagamento

```javascript
const handlePagar = async (e) => {
  e.preventDefault();
  
  try {
    const paymentData = {
      tipo: metodo,
      ultimosDigitos: cartao.numero.slice(-4),
      titular: cartao.titular
    };
    
    const ticketDetails = ingressos.map(i => ({
      sessionId: i.sessionId,
      seatId: i.seatId,
      price: i.preco
    }));
    
    // Chamar API
    const response = await api.processPayment(
      user.id,
      metodo,
      totalPreco,
      paymentData,
      ticketDetails
    );
    
    // Sucesso
    sessionStorage.removeItem('ingressoData');
    setTimeout(() => {
      router.push(`/perfil?tab=ingressos`);
    }, 2000);
    
  } catch (erro) {
    setErro(erro.message);
  }
};
```

---

### 5. Buscar Ingressos do Perfil

```javascript
useEffect(() => {
  if (!user) return;
  
  carregarIngressos();
}, [user]);

const carregarIngressos = async () => {
  try {
    const [tickets, eventTickets] = await Promise.all([
      api.getUserTickets(user.id),
      api.getUserEventTickets(user.id)
    ]);
    
    setIngressos(tickets);
    setIngressosEventos(eventTickets);
  } catch (erro) {
    setErro(erro.message);
  }
};
```

---

### 6. Exibir Ingressos no Perfil

```javascript
{ingressos.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-400">Nenhum ingresso comprado</p>
    <button onClick={() => router.push('/filmes')}>
      Ir para Filmes
    </button>
  </div>
) : (
  <div className="grid gap-4">
    {ingressos.map((ingresso) => (
      <div key={ingresso.id} className="bg-gray-700 p-6 rounded-lg">
        <h3>{ingresso.session?.movie?.title}</h3>
        <p>Data: {new Date(ingresso.session?.startsAt).toLocaleDateString('pt-BR')}</p>
        <p>Hora: {new Date(ingresso.session?.startsAt).toLocaleTimeString('pt-BR')}</p>
        <p>Assento: {ingresso.seat?.row}-{ingresso.seat?.number}</p>
        <p>Preço: R$ {ingresso.price?.toFixed(2)}</p>
        <p>Status: {ingresso.status}</p>
      </div>
    ))}
  </div>
)}
```

---

## 📡 Exemplos de Requisições HTTP

### Criar Pagamento com Cartão

```http
POST http://localhost:3001/payment/process
Content-Type: application/json

{
  "userId": 1,
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

**Resposta:**
```json
{
  "message": "Pagamento processado com sucesso",
  "payment": {
    "id": 100,
    "userId": 1,
    "method": "CREDITO",
    "status": "COMPLETED",
    "totalAmount": 45.00
  },
  "tickets": [
    {
      "id": 456,
      "userId": 1,
      "sessionId": 789,
      "seatId": 101,
      "price": 30.00
    },
    {
      "id": 457,
      "userId": 1,
      "sessionId": 789,
      "seatId": 102,
      "price": 15.00
    }
  ]
}
```

---

### Criar Pagamento com PIX

```http
POST http://localhost:3001/payment/process
Content-Type: application/json

{
  "userId": 1,
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

---

### Buscar Ingressos

```http
GET http://localhost:3001/user/1/tickets
```

**Resposta:**
```json
[
  {
    "id": 456,
    "userId": 1,
    "sessionId": 789,
    "seatId": 101,
    "price": 30.00,
    "status": "ACTIVE",
    "createdAt": "2025-11-18T14:30:00Z",
    "session": {
      "id": 789,
      "startsAt": "2025-11-18T19:30:00Z",
      "movie": {
        "id": 1,
        "title": "OPPENHEIMER"
      },
      "hall": {
        "id": 1,
        "name": "SALA 1"
      }
    },
    "seat": {
      "id": 101,
      "row": "A",
      "number": 5
    }
  }
]
```

---

## 🎯 Integração com API Client

### Adicionar Método ao api.js

```javascript
class ApiService {
  // ... outros métodos ...

  async processPayment(userId, method, totalAmount, paymentData, ticketDetails) {
    return this.request('/payment/process', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        method,
        totalAmount,
        paymentData,
        ticketDetails
      }),
    });
  }

  async getUserTickets(userId) {
    return this.request(`/user/${userId}/tickets`);
  }

  async getUserEventTickets(userId) {
    return this.request(`/user/${userId}/event-tickets`);
  }

  async purchaseEventTicket(userId, eventId, price, ticketType, seatNumber = null) {
    return this.request('/purchase-event', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        eventId,
        price,
        ticketType,
        seatNumber
      }),
    });
  }
}
```

---

## 📋 Estrutura de Dados Esperada

### Ingressos para Pagamento

```javascript
{
  sessionId: 789,           // ID da sessão do filme
  seatId: 101,             // ID do assento
  tipo: "inteira",         // "inteira" ou "meia"
  preco: 30.00            // Preço do ingresso
}
```

### Dados de Pagamento Cartão

```javascript
{
  tipo: "CREDITO",                    // CREDITO ou DEBITO
  ultimosDigitos: "1111",             // Últimos 4 dígitos
  titular: "JOAO SILVA"               // Nome do titular
}
```

### Dados de Pagamento PIX

```javascript
{
  tipo: "PIX",                        // Sempre PIX
  pixCode: "PIX-A7X9K2M5L8Q1R4P7",   // Código único gerado
  titular: "MARIA SANTOS"             // Nome do titular
}
```

---

## 🔄 Fluxo de Função Completo

```javascript
// 1. Usuário clica "Pagar" na página de assentos
async function pagar() {
  // 2. Validar seleção
  if (selecionados.size === 0) return;
  
  // 3. Verificar autenticação
  if (!user) router.push('/login');
  
  // 4. Preparar dados
  const ingressos = Array.from(selecionados.entries()).map(...);
  
  // 5. Salvar em sessionStorage
  sessionStorage.setItem('ingressoData', JSON.stringify(ingressos));
  
  // 6. Redirecionar para pagamento
  router.push(`/pagamento?ingressos=${encodeURIComponent(...)}`);
}

// 7. Na página de pagamento
useEffect(() => {
  // 8. Recuperar dados do sessionStorage
  const ingresso = sessionStorage.getItem('ingressoData');
  setIngressos(JSON.parse(ingresso));
}, []);

// 9. Usuário preenche dados e clica pagar
async function handlePagar() {
  // 10. Validar dados
  if (!validarNumeroCartao(...)) {
    setErro('Inválido');
    return;
  }
  
  // 11. Chamar API
  const response = await api.processPayment(...);
  
  // 12. Sucesso - limpar e redirecionar
  sessionStorage.removeItem('ingressoData');
  router.push('/perfil?tab=ingressos');
}

// 13. Na página de perfil
useEffect(() => {
  // 14. Buscar ingressos
  const tickets = await api.getUserTickets(user.id);
  
  // 15. Exibir ao usuário
  setIngressos(tickets);
}, [user]);
```

---

## ✅ Checklist de Implementação

Se está criando do zero:

```javascript
// 1. Schema Prisma
✓ Model Payment
✓ Relação User → Payment

// 2. Backend
✓ POST /payment/process
✓ GET /user/:id/tickets
✓ GET /user/:id/event-tickets
✓ POST /purchase-event

// 3. Frontend
✓ pages/pagamento.js
✓ pages/perfil.js
✓ Validações de cartão
✓ Geração de PIX

// 4. API Client
✓ processPayment()
✓ getUserTickets()
✓ getUserEventTickets()
✓ purchaseEventTicket()

// 5. Redirecionamentos
✓ Assentos → Pagamento
✓ Pagamento → Perfil
✓ Erro → Voltar

// 6. Banco de Dados
✓ Migration criada
✓ Tabelas criadas
✓ Relacionamentos OK
```

---

## 🚀 Deploy em Produção

```javascript
// Antes de fazer deploy, certifique-se de:

1. API_URL correto
   NEXT_PUBLIC_API_URL=https://seu-api.com

2. Banco de dados migrado
   npx prisma migrate deploy

3. Variáveis de ambiente
   .env.production

4. HTTPS ativo
   Stripe, PayPal etc requerem HTTPS

5. Rate limiting configurado
   Para proteger endpoints de pagamento

6. Logs ativados
   Para auditoria de transações

7. Backup do banco
   Daily backups recomendado

8. CORS correto
   origin: ['https://seu-site.com']
```

---

**Exemplos Práticos Completos ✅**
