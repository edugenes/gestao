# Convenção de Commits

O projeto usa **Conventional Commits** para mensagens de commit.

## Formato

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

## Tipos

| Tipo       | Uso |
|------------|-----|
| `feat`     | Nova funcionalidade |
| `fix`      | Correção de bug |
| `docs`     | Apenas documentação |
| `style`    | Formatação (ex.: Prettier), sem mudança de lógica |
| `refactor` | Refatoração de código |
| `test`     | Inclusão ou ajuste de testes |
| `chore`    | Tarefas de build, CI, dependências |

## Exemplos

- `feat(usuarios): login com JWT`
- `fix(bens): número patrimonial único na validação`
- `docs(roadmap): remover Docker da infra`
- `chore(backend): adicionar ESLint e Prettier`

## Branches

- `main` – produção / estável  
- `develop` – integração para desenvolvimento  
- `feat/nome-da-funcionalidade` – features  
- `fix/nome-do-bug` – correções  

Commits diretos em `main` devem ser evitados; preferir merge via PR a partir de `develop` ou de branches de feature/fix.
