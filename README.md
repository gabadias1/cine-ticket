# CineTicket – Plataforma de compra de ingressos

Projeto Integrador (PI) – Universidade Tecnológica Federal do Paraná – Câmpus Campo Mourão (UTFPR-CM)
Curso: Bacharelado em Ciência da Computação (BCC)

## Sobre o Projeto

CineTicket é uma plataforma web em desenvolvimento, com o objetivo de facilitar a compra de ingressos de cinema e eventos em geral.

Com o site, é possível:
- Navegar pelos filmes em cartaz por cidade e cinemas
- Selecionar sessões e assentos disponíveis
- Comprar ingressos de forma rápida e segura
- Gerenciar o Perfil do usuário

## Objetivos

- Criar uma experiência simples e intuitiva para usuários finais
- Disponibilizar informações atualizadas sobre filmes, sessões e salas
- Permitir reserva de assentos
- Oferecer painel administrativo para gerenciamento de filmes, sessões e relatórios de vendas

## Tecnologias

### Frontend
- Next.js (React)
- React 18
- Tailwind CSS
- @tailwindcss/aspect-ratio

### Backend
- Node.js (Express)
- CORS, Body Parser

### Banco de Dados
- Atualmente: API em memória (sem persistência)
- Referência de esquema SQL: `database/init.sql`

## Funcionalidades

- Visualização de filmes em cartaz
- Consulta de horários e sessões
- Compra de ingressos online
- Gerenciamento de Perfil
- Seleção de assentos
- Busca e filtros de filmes

## Como executar

```bash
# Subir frontend + backend
docker-compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

## Requisitos

- Docker e Docker Compose
- Navegador web moderno

## Equipe

- Gabriel Dias
- João Pedro
- Kalil

## Licença

Este projeto está sob a licença MIT.

