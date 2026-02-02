# Contribuindo com o Ventrys

Obrigado por contribuir com o projeto. Siga as convenções abaixo para manter o histórico e o fluxo de trabalho consistentes.

## Branches

- **`main`** — branch principal; código em produção ou estável.
- **`develop`** — desenvolvimento integrado (opcional).
- **`feature/nome-da-funcionalidade`** — novas funcionalidades.
- **`fix/descricao`** — correções de bugs.
- **`docs/assunto`** — apenas documentação.

Faça pull requests para `main` (ou para `develop`, se o time usar). Evite commits diretos em `main`.

## Conventional Commits

Use o formato [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit:

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos

| Tipo       | Uso |
|------------|-----|
| `feat`     | Nova funcionalidade |
| `fix`      | Correção de bug |
| `docs`     | Apenas documentação |
| `style`    | Formatação, sem mudança de lógica |
| `refactor` | Refatoração de código |
| `test`     | Adição ou ajuste de testes |
| `chore`    | Tarefas de build, CI, dependências |

### Exemplos

```bash
feat(bens): adicionar filtro por categoria na listagem
fix(auth): corrigir renovação do refresh token
docs: atualizar README com variáveis de ambiente
test(depreciacoes): testes unitários do DepreciacoesService
chore(ci): adicionar job de lint no GitHub Actions
```

### Escopo (opcional)

Use o módulo ou pasta afetada: `auth`, `bens`, `inventarios`, `frontend`, `backend`, etc.

## Desenvolvimento local

1. Clone o repositório e crie uma branch a partir de `main`.
2. Backend: `cd backend && npm install && cp .env.example .env` — configure `DATABASE_URL`.
3. Frontend: `cd asset-guardian && npm install && cp .env.example .env` — configure `VITE_API_URL`.
4. Rode `npm run lint` e `npm run test` antes de abrir o PR.

## Code review

Os PRs serão revisados quanto a:

- Adequação às regras de negócio e arquitetura (Clean Architecture, serviços/repositórios).
- Presença de testes para regras críticas, quando aplicável.
- Ausência de credenciais ou dados sensíveis no código.
