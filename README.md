# CineTicket – Plataforma de Compra de Ingressos

**Projeto Integrador (PI)** – Universidade Tecnológica Federal do Paraná – Câmpus Campo Mourão (UTFPR-CM)  
**Curso:** Bacharelado em Ciência da Computação (BCC)

## Sobre o Projeto

CineTicket é uma plataforma web completa para compra de ingressos de cinema e eventos, desenvolvida com tecnologias modernas e arquitetura full-stack.

### Funcionalidades

- **Catálogo de Filmes**: Visualização de filmes em cartaz
- **Sistema de Ingressos**: Compra online com seleção de assentos
- **Autenticação**: Login e registro de usuários
- **Múltiplos Cinemas**: Suporte a diferentes locais
- **Interface Responsiva**: Design moderno e intuitivo
- **Filtros e Busca**: Encontre filmes e eventos facilmente

## Tecnologias

### Frontend
- **Next.js 14** - Framework React
- **React 18** - Biblioteca de interface
- **Tailwind CSS** - Framework de estilos
- **React Slick** - Carrossel de imagens
- **Context API** - Gerenciamento de estado

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - Gerenciamento de banco de dados
- **SQLite** - Banco de dados
- **CORS** - Cross-origin resource sharing

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Navegador web moderno

### Execução 
```bash
# Clone o repositório
git clone <repository-url>
cd cine-ticket

# Execute com Docker
docker compose -f docker-compose.dev.yml up --build

# Acesse a aplicação
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```


## 🔧 API Endpoints

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de usuário

### Filmes
- `GET /movies` - Listar filmes
- `POST /movies` - Criar filme

### Cinemas
- `GET /cinemas` - Listar cinemas
- `POST /cinemas` - Criar cinema

### Sessões
- `GET /sessions` - Listar sessões
- `POST /sessions` - Criar sessão

### Ingressos
- `POST /purchase` - Comprar ingresso


## Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (SQLite)      │
│   Port: 3000    │    │   Port: 3001    │    │   (Prisma)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Equipe

- **Gabriel Dias**
- **João Pedro** 
- **Kalil**

## Licença

Este projeto está sob a licença MIT.

---

**🎬 CineTicket** - Sua plataforma completa para compra de ingressos!

