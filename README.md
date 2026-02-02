# Ventrys

**Sistema de Gestão de Patrimônio** — Controle de bens, movimentações, inventários, manutenções, depreciação e baixas para ambientes institucionais (hospitalar, educacional e administrativo).

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## Sobre o projeto

O **Ventrys** é um sistema corporativo de gerenciamento de patrimônio que permite cadastrar bens, organizá-los por estrutura (unidades, prédios, andares, setores), registrar movimentações, realizar inventários, controlar manutenções, calcular depreciações e dar baixa em itens. O código segue **Clean Architecture**, com regras de negócio em serviços, acesso a dados via repositórios e APIs REST documentadas (Swagger).

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Autenticação** | Login com JWT, refresh token e controle de perfis (Admin, Gestor, Operador, Consulta) |
| **Estrutura organizacional** | Unidades → Prédios → Andares → Setores e Centros de Custo |
| **Bens** | Cadastro com número patrimonial (imutável), categorias/subcategorias, valor de aquisição, vida útil, estado de conservação e histórico de alterações |
| **Movimentações** | Transferências, empréstimos, devoluções e manutenção entre setores |
| **Inventário** | Abertura de inventários, conferência de itens e registro de divergências (sem alterar dados do bem) |
| **Manutenção** | Preventiva e corretiva, com vínculo a fornecedores |
| **Depreciação** | Métodos linear e acelerado, com mês de referência e rastreabilidade |
| **Baixa patrimonial** | Motivos (obsolescência, perda, doação, venda), irreversível, com valor realizado |
| **Dashboard** | Total de bens, valor patrimonial, depreciação mensal, pendências de conferência, gráficos e movimentações recentes |

---

## Stack tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | NestJS, Prisma, PostgreSQL, JWT (Passport), Zod, Swagger, bcrypt |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui (Radix), React Query, React Router, Recharts, next-themes |
| **Banco** | PostgreSQL 14+ |

---

## Estrutura do repositório

```
.
├── backend/                 # API REST (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de dados
│   │   └── seed.ts          # Seed (admin + dados de demonstração)
│   └── src/
│       ├── modules/         # Auth, Usuários, Estrutura, Bens, Movimentações,
│       │                    # Inventários, Manutenções, Depreciações, Baixas, Dashboard
│       └── shared/          # Database (Prisma), Auth (JWT, guards, roles)
│
├── asset-guardian/          # Frontend (React + Vite)
│   ├── public/
│   └── src/
│       ├── components/      # UI, dashboard, layout, assets
│       ├── contexts/        # Auth
│       ├── lib/             # API client, configurações
│       └── pages/           # Telas da aplicação
│
├── .gitignore
└── README.md
```

---

## Pré-requisitos

- **Node.js** 18 ou superior  
- **PostgreSQL** 14 ou superior  
- **npm** (ou yarn/bun)

---

## Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/edugenes/gestao.git
cd gestao
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o arquivo `.env` e configure a `DATABASE_URL` para o seu PostgreSQL, por exemplo:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/patrimonio?schema=public"
```

Em seguida:

```bash
npx prisma generate
npx prisma migrate deploy
# Ou, se o banco já existir (ex.: criado com db push): npx prisma migrate resolve --applied 20250202000000_init
npm run prisma:seed
npm run start:dev
```

- **API:** http://localhost:3000  
- **Swagger:** http://localhost:3000/api/docs  

O seed cria o usuário **admin** (login: `admin`, senha: `admin`) e, se o banco tiver menos de 500 bens, popula dados de demonstração (bens, movimentações, inventários, manutenções, depreciações e baixas).

### 3. Frontend

Em outro terminal:

```bash
cd asset-guardian
npm install
cp .env.example .env
```

No `.env` do frontend, deixe a URL da API apontando para o backend:

```env
VITE_API_URL=http://localhost:3000
```

Subir o frontend:

```bash
npm run dev
```

Acesse **http://localhost:5173** (ou a porta exibida no terminal). Faça login com `admin` / `admin`.

---

## Variáveis de ambiente

| Arquivo | Variável | Descrição |
|---------|----------|-----------|
| `backend/.env` | `DATABASE_URL` | URL de conexão PostgreSQL |
| `backend/.env` | `JWT_SECRET` | Chave para assinatura do JWT |
| `backend/.env` | `JWT_REFRESH_SECRET` | Chave para refresh token |
| `asset-guardian/.env` | `VITE_API_URL` | URL base da API (ex.: http://localhost:3000) |

Consulte os arquivos `.env.example` em cada pasta para a lista completa.

---

## Scripts úteis

**Backend** (`backend/`)

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Servidor em modo desenvolvimento (watch) |
| `npm run build` | Build de produção |
| `npm run start:prod` | Executar build de produção |
| `npm run prisma:seed` | Executar seed (admin + demo) |
| `npx prisma studio` | Interface visual do banco |

**Frontend** (`asset-guardian/`)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build |

---

## Regras de negócio (resumo)

- Número patrimonial é **imutável**.  
- Toda alteração em bem gera registro em **histórico**.  
- Toda movimentação é **registrada** (origem, destino, tipo, data).  
- Inventário **não altera** dados do bem; apenas registra conferência e divergências.  
- Baixa patrimonial é **irreversível**.  
- Depreciação é **rastreável** por mês de referência e método.

---

## Contribuindo

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para convenções de commits (Conventional Commits) e padrão de branches.

---

## Desenvolvido por

**Eduardo Genes Vieira**

Repositório: [github.com/edugenes/gestao](https://github.com/edugenes/gestao)
