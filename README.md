# 🐱 Cat-Tchau

Loja virtual de hardware e periféricos com catálogo de produtos, carrinho de compras e o configurador **Monte seu PC**.

**🔗 Demo:** https://cat-tchau7.vercel.app

---

## Sobre o projeto

O Cat-Tchau é uma aplicação de e-commerce focada em componentes de computador. O catálogo reúne 120 produtos, cada um com a URL da própria imagem, e a compra é simulada, sem cobrança real.

## Funcionalidades

- **Catálogo de produtos** com navegação por categorias
- **Carrinho de compras** com fluxo de compra validado
- **Monte seu PC**: seleção de componentes, resumo da configuração, persistência e envio ao carrinho
- **Páginas institucionais** (rodapé com pedidos, categorias e contato)
- **Identidade visual**: ícone Catchau no cabeçalho e na aba do navegador

## Tecnologias

| Camada | Stack |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| UI | React 19, [Tailwind CSS 4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [shadcn/ui](https://ui.shadcn.com) |
| Dados | [Supabase](https://supabase.com), [Drizzle ORM](https://orm.drizzle.team), TanStack Query |
| Formulários | React Hook Form + Zod |
| Build | Vite, Bun |
| Qualidade | TypeScript, ESLint, Prettier, Vitest |

## Começando

### Pré-requisitos

- [Bun](https://bun.sh) (ou Node.js 20+ com npm)
- Um projeto [Supabase](https://supabase.com) para as variáveis de ambiente

### Instalação

```sh
git clone https://github.com/rian72891/cat-tchau.git
cd cat-tchau
bun install      # ou: npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto Supabase. Nunca versione chaves privadas.

### Executando

```sh
bun run dev      # ou: npm run dev
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `dev` | Servidor de desenvolvimento |
| `build` | Build de produção |
| `build:dev` | Build em modo desenvolvimento |
| `preview` | Pré-visualização do build |
| `lint` | Análise estática com ESLint |
| `format` | Formatação com Prettier |
| `test` | Executa os testes (Vitest) |
| `test:watch` | Testes em modo observação |

## Estrutura

```text
├── src/
│   ├── routes/        # Rotas (página inicial, páginas institucionais)
│   ├── components/    # Componentes de interface
│   ├── hooks/         # Hooks customizados
│   ├── integrations/  # Integrações (Supabase)
│   ├── lib/           # Utilitários e dados
│   └── test/          # Testes
├── drizzle/           # Migrações do banco
├── supabase/          # Configuração do Supabase
└── public/            # Arquivos estáticos
```

## Roadmap

**Concluído**

- [x] 120 produtos no catálogo, preservando os 48 anteriores e suas URLs
- [x] Validação de catálogo e compra
- [x] Monte seu PC com seleção, resumo, persistência e carrinho
- [x] Ícone Catchau no cabeçalho e na aba do navegador
- [x] Rodapé com páginas institucionais, pedidos, categorias e contato

**Próximos passos**

- [ ] Página inicial completa: banners rotativos, mais vendidos, ofertas do dia e marcas em destaque
- [ ] Menu de departamentos e sugestões na busca
- [ ] Checkout em etapas: endereço, frete, pagamento e resumo (sem cobrança real)
- [ ] Comparador de produtos, favoritos e vistos recentemente
- [ ] Testes completos em desktop e celular

## Contribuindo

> **Importante:** ao alterar o catálogo, mantenha as URLs das imagens dos produtos exatamente como estão.

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m "feat: minha feature"`
4. Envie a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

## Desenvolvimento com Lovable

Este projeto foi criado com [Lovable](https://lovable.dev). Você pode continuar o desenvolvimento no [editor do Lovable](https://lovable.dev/projects/8c992411-b2c2-4aa2-8937-5c0c37bf92cc): as alterações feitas lá são commitadas neste repositório, e pushes na `main` sincronizam de volta com o Lovable.
