# Brasil de Muitos Sabores

Cardápio da Mostra Cultural 2026, MédioTec SENAC Recife. React, Vite, PWA e Supabase (Postgres, Auth e Storage).

## Estrutura

```text
public/                       Ícones do aplicativo
src/
  components/PwaUpdate.jsx    Aviso de atualização do PWA
  services/
    supabase.js                Banco, autenticação e fotos
    legacyMigration.js         Importação dos cadastros antigos
  App.jsx                     Cardápio e administração
  App.css                     Estilos da interface
  index.css                   Estilos globais
  main.jsx                    Inicialização do React
supabase/migrations/          Estrutura e permissões do banco
.env.example                  Modelo das variáveis de ambiente
package.json                  Dependências e comandos
vite.config.js                Build, manifesto e cache do PWA
vercel.json                    Configuração de deploy
```

Execute os comandos na raiz do projeto. `node_modules/` e `dist/` são gerados localmente e ignorados pelo Git.

## Executar

Requer Node.js 22.12 ou superior.

```bash
npm ci
# Preencha o .env conforme o .env.example
npm run dev
```

Em `.env`:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Pode usar a chave publishable ou a antiga anon. Esses valores são públicos no bundle do frontend. Nunca coloque service_role, chave secreta, senha de banco ou senha de administrador nas variáveis VITE_. O `.env` está ignorado pelo Git; o `.env.example` documenta os nomes. Reinicie o Vite após alterar o `.env`.

## Preparar o Supabase

1. Crie um projeto Supabase e execute [a migração SQL](supabase/migrations/202610290001_cardapio.sql) no SQL Editor. Ela cria a tabela `dishes`, o bucket público `dish-photos` (JPG, PNG e WebP, até 5 MB) e as políticas RLS.
2. Em **Authentication → Users**, crie o usuário da equipe com e-mail e senha. O app não oferece cadastro público de usuários.
3. No SQL Editor, promova **somente o usuário da equipe** a administrador, substituindo o e-mail:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'EMAIL-DA-EQUIPE';
```

4. Entre em **Administração** no aplicativo. Se o usuário já estava conectado antes da promoção, saia e entre novamente para renovar as permissões.

A leitura dos pratos e fotos é pública. Inserção, edição e exclusão exigem `app_metadata.role = admin`, verificado também nas políticas do banco e do Storage. Não é necessário colocar credenciais administrativas no `.env`.

O cadastro tem apenas **nome, descrição e foto opcional**. A região é definida pela aba selecionada antes de clicar em **Adicionar prato**. Não há preço, quantidade, estado ou emoji.

### Importar o armazenamento antigo

No mesmo navegador e endereço usados antes, entre como administrador e clique em **Importar cadastros deste navegador**. O aplicativo envia os pratos e as fotos antigas para o Supabase. `legacy_id` impede duplicação ao repetir uma importação interrompida. Os dados antigos permanecem no navegador para recuperação; o aplicativo não os usa como banco de dados nem cria exemplos automaticamente. Por isolamento de origem do navegador, a implantação Vercel não consegue acessar os dados salvos em localhost: faça a importação em localhost com as mesmas credenciais Supabase antes de trocar de endereço.

## Vercel

Importe o repositório mantendo **Root Directory na raiz do repositório**. O arquivo `vercel.json` da raiz já configura instalação, build, saída estática e fallback da aplicação.

Em **Settings → Environment Variables**, configure para Production e Preview:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Use os mesmos valores do `.env`. A Vercel não recebe o `.env` local porque ele não é versionado. Faça um novo deploy após mudar essas variáveis; o Vite incorpora os valores durante a compilação. Não é necessário backend na Vercel: o cliente acessa o Supabase com RLS.

## Verificações e PWA

```bash
npm run lint
npm run build
npm run preview
```

O service worker é gerado no build e desativado durante `npm run dev`. A interface e fotos já visitadas ficam em cache; carregar o cardápio e gravar no Supabase exigem internet. Fotos substituídas usam caminhos novos. A Vercel oferece HTTPS para instalação no celular. No iPhone, use Safari → Compartilhar → Adicionar à Tela de Início.

Para testar a interface em um celular na rede local: `npm run dev -- --host 0.0.0.0`, usando o IP do computador e a porta informada.
