# NotariusIA

Plataforma web com os assistentes de IA do tabelionato, migrados dos GPTs
personalizados para a API da Claude (Anthropic).

## O que já está pronto

- **NotariusIA-Urbano** (`/dashboard/urbano`): upload de PDF/imagem →
  extração de dados na ordem exata da minuta, com seção de pendências
  separada. Suporta envio de documentos em etapas.
- **NotariusIA-Rural** (`/dashboard/rural`): mesmo padrão do Urbano, com o
  prompt de extração para imóveis rurais (matrícula, CCIR, INCRA, CAR,
  certidões ambientais/fiscais, pessoas físicas e jurídicas).
- **QualiFlash** (`/dashboard/qualiflash`): chat que monta a qualificação
  pessoal, perguntando dados faltantes antes de fechar o texto.
- Schema de banco de dados multi-tenant (`prisma/schema.prisma`): cada
  Tabelionato tem seus Usuários, Atendimentos e Mensagens isolados, com
  campo de plano e limite mensal.

## Como rodar localmente

```bash
npm install
cp .env.example .env
# edite .env e cole sua ANTHROPIC_API_KEY

npx prisma migrate dev --name init
npm run dev
```

Acesse `http://localhost:3000`.

## O que NÃO está pronto (e precisa antes de vender para clientes)

Fui direto ao ponto no que faz o produto funcionar (os 3 agentes chamando a
Claude corretamente) para você já poder testar. Mas para operar como SaaS
com tabelionatos pagantes, faltam três blocos importantes:

### 1. Autenticação real
`/login` hoje é só um esqueleto visual (não tem sessão, não tem hashing de
senha, não tem nada plugado no banco). Recomendo:
- **Clerk** ou **Auth.js (NextAuth)** para login/sessão/e-mail de verificação
- Isolar por `tabelionatoId` em toda query (o schema já foi desenhado
  pensando nisso)

### 2. Cobrança e planos
O campo `plano` e `limiteMensal` já existem no modelo `Tabelionato`, mas não
há integração de cobrança ainda. Passo natural: **Stripe Billing** com um
webhook que atualiza o `plano` do tabelionato e um middleware que barra o
uso quando o limite mensal de atendimentos for atingido.

### 3. Segurança e LGPD para os dados extraídos
Os agentes lidam com CPF, RG, dados bancários e matrícula de imóveis — dados
sensíveis. Antes de produção:
- Criptografar em repouso os campos sensíveis no banco (ou não persistir o
  conteúdo bruto, só metadados)
- Job de limpeza automática usando o campo `excluirEm` de `Atendimento`
  (política de retenção, já modelada no schema)
- Revisão de política de privacidade / termos de uso com um advogado
  especializado em LGPD, já que o próprio QualiFlash cita a lei

## Estrutura do projeto

```
src/
  app/
    dashboard/          → seletor de agentes + telas de cada agente
    api/agents/urbano/   → rota da API que chama a Claude (Urbano)
    api/agents/qualiflash/ → rota da API que chama a Claude (QualiFlash)
    login/               → stub de login (ver acima)
  lib/
    anthropic.ts          → cliente da API da Claude + montagem de anexos
    agents/prompts.ts     → os 3 prompts de sistema (Urbano, QualiFlash, Rural)
prisma/
  schema.prisma          → modelo de dados multi-tenant
```

## Próximos passos sugeridos

1. Decidir provedor de autenticação (Clerk é o mais rápido de integrar).
2. Definir os planos (ex.: Básico = X atendimentos/mês, Pro = Y) para eu
   montar a integração com Stripe.
3. Deploy: o jeito mais simples é [Vercel](https://vercel.com) para o
   Next.js + um Postgres gerenciado (Supabase, Neon ou Railway).
