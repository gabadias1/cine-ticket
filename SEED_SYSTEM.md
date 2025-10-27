# 🎬 Sistema de Seed Automático - CineTicket

## 📋 Visão Geral

O sistema agora possui um **seed automático** que sincroniza o **máximo de filmes possível** da API TMDB quando um colaborador executa `docker compose -f docker-compose.dev.yml up --build`.

## 🚀 Como Funciona

### Processo Automático

Quando alguém executa o comando de build, o sistema automaticamente:

1. **Verifica se o banco existe** - Se não existir, cria um novo
2. **Aplica migrations** - Executa todas as migrations do Prisma
3. **Executa seed básico** - Cria usuários, cinemas e dados iniciais
4. **Sincroniza MÁXIMO de filmes** - Busca filmes de múltiplas categorias da API TMDB

### Categorias de Filmes Sincronizados

O sistema sincroniza filmes de **5 categorias diferentes**:

| Categoria | Páginas | Filmes por Página | Total Máximo |
|-----------|---------|-------------------|--------------|
| 📈 **Populares** | 5 | 20 | ~100 filmes |
| 🎬 **Em Cartaz** | 3 | 20 | ~60 filmes |
| ⭐ **Melhor Avaliados** | 3 | 20 | ~60 filmes |
| 🔮 **Em Breve** | 2 | 20 | ~40 filmes |
| 🔥 **Em Alta (Trending)** | 2 | 20 | ~40 filmes |

**Total estimado: ~300 filmes únicos**

## 📊 Dados Sincronizados

Cada filme sincronizado inclui:

- ✅ **Título** (em português quando disponível)
- ✅ **Sinopse** completa
- ✅ **Duração** em minutos
- ✅ **Classificação** (12, 14, 16, 18)
- ✅ **Poster** (URL do TMDB)
- ✅ **Backdrop** (URL do TMDB)
- ✅ **Gêneros** (formato texto separado por vírgula)
- ✅ **Data de lançamento**
- ✅ **Avaliação** (nota de 0-10)
- ✅ **Contagem de votos**
- ✅ **ID do TMDB** (para referência)

## ⚡ Performance e Rate Limiting

### Delays Implementados

- **200ms** entre cada filme processado
- **1000ms** entre páginas diferentes
- **Verificação de duplicatas** antes de inserir

### Tempo Estimado

- **Sincronização completa**: ~5-10 minutos
- **Depende da velocidade da API TMDB**
- **Rate limit respeitado** para evitar bloqueios

## 🛠️ Scripts Disponíveis

### Scripts Automáticos (via Docker)

```bash
# Processo completo (recomendado para novos colaboradores)
docker compose -f docker-compose.dev.yml up --build
```

### Scripts Manuais (dentro do container)

```bash
# Sincronização básica (rápida)
npm run sync-tmdb

# Sincronização máxima (completa)
npm run sync-max-movies

# Inicialização completa do banco
npm run init-db
```

## 📈 Exemplo de Saída

```
🌐 Sincronizando MÁXIMO de filmes da API TMDB...
⚠️  Isso pode levar alguns minutos devido ao limite de rate da API...

📈 Sincronizando filmes populares (múltiplas páginas)...
  → Página 1/5 de filmes populares...
  ✅ Populares P1: 20 sincronizados, 0 já existiam, 0 erros
  → Página 2/5 de filmes populares...
  ✅ Populares P2: 18 sincronizados, 2 já existiam, 0 erros
  ...

============================================================
📊 RESUMO DA SINCRONIZAÇÃO:
✅ Filmes sincronizados: 166
⏭️  Filmes já existentes: 134
❌ Erros encontrados: 0
📈 Total processado: 300
🎬 Total de filmes no banco: 192
============================================================

🎉 Sincronização concluída com sucesso!
```

## 🔧 Configuração Técnica

### Arquivos Modificados

- `backend/scripts/syncMaximumMovies.js` - Novo script de sincronização máxima
- `backend/scripts/init-db.js` - Atualizado para usar o novo script
- `backend/package.json` - Adicionado script `sync-max-movies`
- `README.md` - Documentação atualizada

### Variáveis de Ambiente

```bash
# API TMDB (já configurada)
TMDB_API_KEY=979f6e8c0d1f3185b797c251ae26ec3c
TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...
```

## 🎯 Benefícios

### Para Novos Colaboradores

- ✅ **Setup automático** - Apenas executar `docker compose up --build`
- ✅ **Banco populado** - Centenas de filmes prontos para teste
- ✅ **Dados reais** - Filmes atuais da API TMDB
- ✅ **Sem configuração manual** - Tudo funciona automaticamente

### Para Desenvolvimento

- ✅ **Dados consistentes** - Todos têm os mesmos filmes
- ✅ **Testes realistas** - Dados reais da API
- ✅ **Performance** - Rate limiting respeitado
- ✅ **Robustez** - Tratamento de erros implementado

## 🚨 Limitações

- **Rate Limit da API TMDB** - Máximo ~40 requisições por 10 segundos
- **Tempo de sincronização** - Pode levar alguns minutos
- **Dependência da API** - Requer conexão com internet
- **Duplicatas** - Sistema evita filmes duplicados automaticamente

## 🔍 Troubleshooting

### Se a sincronização falhar

1. **Verificar conexão** com a internet
2. **Verificar logs** do backend
3. **Executar manualmente**:
   ```bash
   docker-compose exec backend npm run sync-max-movies
   ```

### Se houver muitos erros

- **Rate limit atingido** - Aguardar alguns minutos
- **API TMDB indisponível** - Tentar novamente mais tarde
- **Filmes já existem** - Normal, sistema evita duplicatas

## 📝 Notas Importantes

- O sistema **nunca duplica** filmes existentes
- A sincronização **respeita** o rate limit da API
- Os dados são **atualizados** a cada rebuild completo
- O processo é **idempotente** - pode ser executado múltiplas vezes
