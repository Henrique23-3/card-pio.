# Cardápio Digital 2C

Aplicação web progressiva (PWA) para a Mostra Cultural 2026 do curso MédioTec SENAC Recife. O projeto apresenta a culinária brasileira e permite consultar os pratos das cinco regiões do país.

## Funcionalidades previstas

- Página inicial com informações e curiosidades sobre a culinária brasileira.
- Cardápio público com pratos e quantidades disponíveis.
- Área administrativa para gerenciar regiões, pratos e quantidades.
- Acesso de visitantes com conta Google e autenticação de administradores.

O frontend usa React e Vite. O Firebase está previsto como backend.

## Requisitos

- Node.js e npm instalados.

## Criar um PWA do zero

Use este roteiro para criar um projeto padrão em um diretório novo. No terminal, navegue até a pasta onde o projeto deverá ser criado e execute:

```bash
npm create @vite-pwa/pwa@latest
```

Durante a configuração interativa:

1. Aceite a configuração do pacote PWA.
2. Informe o nome do projeto, sem espaços ou caracteres especiais.
3. Selecione **React** como framework e **JavaScript** como linguagem.
4. Mantenha os valores padrão de **PWA Name**, **Short Name**, **Description** e **Theme Color**.
5. Selecione `generateSW` como estratégia do service worker.
6. Selecione `Prompt for update` como comportamento de atualização.
7. Para as demais opções avançadas do assistente, escolha não configurar por enquanto e estude-as separadamente.

Ao terminar, acesse a pasta criada e inicie o servidor de desenvolvimento:

```bash
cd <nome-do-projeto>
npm install
npm run dev
```

Este roteiro cria um projeto novo; não é necessário repeti-lo para executar o Cardápio Digital deste repositório. Para isso, use os comandos da próxima seção.

## Executar localmente

```bash
cd comercio
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador.

## Comandos disponíveis

Execute os comandos dentro da pasta `comercio/`:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente a versão gerada. |
| `npm run lint` | Verifica o código com ESLint. |
| `npm run generate-pwa-icons` | Gera os ícones do PWA. |

## Estrutura da documentação

- [Conceito do projeto](docs/concept.md): objetivo, público e funcionalidades.
- [Arquitetura proposta](docs/arch.md): organização planejada para a implementação.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) no formato:

```text
tipo(escopo opcional): descrição no imperativo
```

| Tipo | Uso |
| --- | --- |
| `feat` | Adiciona uma funcionalidade. |
| `fix` | Corrige um problema. |
| `docs` | Altera a documentação. |
| `style` | Altera formatação sem mudar o comportamento. |
| `refactor` | Reorganiza o código sem mudar o comportamento. |
| `perf` | Melhora o desempenho. |
| `test` | Adiciona ou altera testes. |
| `build` | Altera dependências ou o processo de build. |
| `ci` | Altera configurações de integração contínua. |
| `chore` | Realiza tarefas de manutenção. |
| `revert` | Reverte um commit anterior. |

Exemplo:

```text
docs: atualiza instruções de execução
```

Execute estes comandos na raiz do repositório (a pasta que contém `README.md`):

1. Confira quais arquivos foram alterados:

	```bash
	git status
	```

2. Escolha os arquivos que entrarão no commit. Para adicionar tudo que foi alterado:

	```bash
	git add .
	```

	Para adicionar somente um arquivo, use o caminho dele, por exemplo:

	```bash
	git add README.md
	```

3. Confira novamente o que será incluído:

	```bash
	git status
	```

4. Crie o commit com uma mensagem no padrão Conventional Commits:

	```bash
	git commit -m "docs: atualiza README"
	```

5. Envie o commit para o repositório remoto:

	```bash
	git push
	```

Se adicionou um arquivo ao stage por engano, remova-o do stage sem apagar suas alterações:

```bash
git restore --staged README.md
```

Para remover todos os arquivos do stage, use `git restore --staged .`.