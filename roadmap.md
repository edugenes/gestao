# 🗺️ ROADMAP DE DESENVOLVIMENTO

## Sistema de Gerenciamento de Patrimônio

> Documento técnico completo para desenvolvimento assistido por IA (Cursor), equipes humanas ou mistas.
> Foco em boas práticas, escalabilidade, segurança, manutenção e ambiente corporativo.

---

## 🎯 VISÃO DO PRODUTO

Sistema web corporativo para **gestão completa do patrimônio institucional**, cobrindo todo o ciclo de vida dos bens:

Aquisição → Cadastro → Uso → Movimentação → Manutenção → Inventário → Depreciação → Baixa

Aplicável a ambientes:

* Hospitalares
* Educacionais
* Órgãos públicos
* Empresas privadas

---

## 🧱 ARQUITETURA GERAL

### Estilo

* Arquitetura **Modular Monolítica** (evolutiva para microserviços)
* Backend desacoplado do frontend
* API RESTful

### Princípios

* SOLID
* Clean Architecture
* Separation of Concerns
* Domain-Driven Design (DDD leve)

---

## 🧑‍💻 STACK TECNOLÓGICO RECOMENDADO

### Backend

* **Linguagem:** TypeScript
* **Framework:** NestJS
* **ORM:** Prisma
* **Validação:** Zod
* **Auth:** JWT + RBAC
* **Documentação API:** Swagger/OpenAPI

### Frontend

* **Framework:** React
* **Linguagem:** TypeScript
* **UI:** Tailwind + shadcn/ui
* **State:** React Query / TanStack
* **Formulários:** React Hook Form + Zod

### Banco de Dados

* **PostgreSQL**
* Versionamento com migrations

### Infraestrutura

* **Docker não será utilizado.** Ambiente local (Node, PostgreSQL instalados na máquina ou conforme política da instituição).
* Servidor web (ex.: Nginx ou equivalente) conforme deploy.

---

## 🔐 SEGURANÇA E GOVERNANÇA

* Autenticação JWT
* Controle de acesso baseado em papéis (RBAC)
* Logs de auditoria imutáveis
* Soft delete em entidades críticas
* Versionamento de registros sensíveis
* Preparado para integração LDAP/AD

---

## 📦 FASES DE DESENVOLVIMENTO

---

### 🟢 FASE 0 – Planejamento e Setup

**Objetivo:** preparar o terreno.

#### Atividades

* Criar repositório Git
* Definir convenções de commit (Conventional Commits)
* Configurar lint (ESLint, Prettier)
* Configurar CI básico
* Definir padrão de branches

#### Entregáveis

* Repositório versionado
* Ambiente de desenvolvimento local funcional (backend + frontend + banco)

---

### 🟢 FASE 1 – Autenticação e Usuários

#### Funcionalidades

* Login
* Refresh token
* Usuários
* Perfis
* Permissões

#### Boas práticas

* Nunca armazenar senha em texto puro
* Hash com bcrypt
* Guards no backend

---

### 🟢 FASE 2 – Estrutura Organizacional

#### Entidades

* Unidades
* Prédios
* Andares
* Setores
* Centros de custo

#### Regras

* Nenhum bem existe sem vínculo organizacional

---

### 🟢 FASE 3 – Cadastro de Bens Patrimoniais

#### Campos essenciais

* Número patrimonial (único)
* Categoria / Subcategoria
* Marca / Modelo
* Nº de série
* Valor de aquisição
* Data de aquisição
* Vida útil
* Estado de conservação
* Situação

#### Regras

* Número patrimonial imutável
* Histórico automático de alterações

---

### 🟢 FASE 4 – Movimentações Patrimoniais

#### Tipos

* Transferência
* Empréstimo
* Manutenção
* Devolução

#### Regras

* Nenhuma alteração direta no bem
* Toda mudança gera movimentação

---

### 🟢 FASE 5 – Inventário Patrimonial

#### Funcionalidades

* Inventários periódicos
* Leitura por QR Code
* Status de conferência

#### Regras

* Inventário não altera dados
* Apenas registra divergências

---

### 🟢 FASE 6 – Manutenção

* Preventiva
* Corretiva
* Custos
* Fornecedores
* Histórico completo

---

### 🟢 FASE 7 – Depreciação

#### Métodos

* Linear
* Acelerada

#### Regras

* Cálculo mensal automático
* Registro histórico

---

### 🟢 FASE 8 – Baixa Patrimonial

#### Motivos

* Obsolescência
* Perda
* Doação
* Venda

#### Regras

* Baixa é irreversível
* Bloqueio total de movimentações

---

### 🟢 FASE 9 – Relatórios e Dashboards

* Patrimônio total
* Depreciação
* Inventário
* Bens por setor

---

### 🟢 FASE 10 – Testes e Qualidade

* Testes unitários
* Testes de integração
* Testes de regressão

---

## 🧪 PADRÕES DE TESTE

* Jest (backend)
* Testes por domínio
* Cobertura mínima: 70%

---

## 🧠 REGRAS PARA O CURSOR (AI RULES)

### O Cursor deve:

* Seguir Clean Architecture
* Não gerar código sem tipagem
* Não acessar banco diretamente em controllers
* Sempre usar services
* Validar DTOs

### O Cursor não deve:

* Criar lógica em controllers
* Ignorar regras de negócio
* Criar SQL direto sem ORM

---

## 📁 PADRÃO DE PASTAS (BACKEND)

```
src/
 ├── modules/
 │    ├── bens/
 │    ├── movimentacoes/
 │    ├── inventarios/
 │    ├── manutencoes/
 │    ├── depreciacoes/
 │    └── usuarios/
 ├── shared/
 │    ├── auth/
 │    ├── database/
 │    └── logs/
 └── main.ts
```

---

## 🚀 CONSIDERAÇÕES FINAIS

Este roadmap foi projetado para:

* Evolução contínua
* Manutenção simples
* Uso intensivo de IA (Cursor)
* Ambiente corporativo crítico

Documento pronto para virar **repositório base**.
