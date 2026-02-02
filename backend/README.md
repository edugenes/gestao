# Backend – Sistema de Gerenciamento de Patrimônio

API REST em NestJS, Prisma e PostgreSQL. Ambiente local (sem Docker).

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm (ou bun)

## Setup

1. **Instalar dependências**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite `.env` e defina `DATABASE_URL` (PostgreSQL local).

3. **Gerar cliente Prisma e rodar migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Criar usuário admin (seed)**
   ```bash
   npx prisma db seed
   ```
   Cria usuário com **login:** `admin` e **senha:** `admin` (role ADMIN).

5. **Subir o servidor**
   ```bash
   npm run start:dev
   ```

- API: http://localhost:3000  
- Swagger: http://localhost:3000/api/docs  

## Scripts

| Script           | Descrição                    |
|------------------|------------------------------|
| `npm run start:dev` | Desenvolvimento (watch)   |
| `npm run build`     | Build de produção         |
| `npm run start:prod`| Rodar build               |
| `npm run lint`      | ESLint                    |
| `npm run format`    | Prettier                  |
| `npm run test`      | Jest                      |
| `npx prisma studio` | UI do banco              |

## Estrutura (roadmap)

- `src/modules/` – usuários, bens, movimentações, inventários, manutenções, depreciações  
- `src/shared/` – auth, database, logs  

Regras de negócio e acesso a dados ficam em **services** e **repositórios**; controllers apenas orquestram.
