# Arquitetura do Projeto

## Objetivo da arquitetura

Este documento descreve a estrutura-alvo para implementar as funcionalidades de [concept.md](concept.md). A aplicação será um PWA em React e Vite, com áreas de visitante e administrador e integração com Firebase.

## Estrutura proposta

```text
comercio/
├── public/                         # Ícones e arquivos estáticos do PWA
└── src/
	├── assets/                     # Imagens, logos e recursos visuais
	├── components/                 # Peças reutilizáveis da interface
	│   ├── common/
	│   │   ├── AppHeader.jsx
	│   │   ├── LoadingState.jsx
	│   │   └── ErrorMessage.jsx
	│   ├── dishes/
	│   │   ├── DishCard.jsx
	│   │   └── DishForm.jsx
	│   └── regions/
	│       ├── RegionCard.jsx
	│       └── RegionForm.jsx
	├── pages/                      # Telas previstas no conceito
	│   ├── SplashPage.jsx
	│   ├── LoginPage.jsx
	│   ├── HomePage.jsx
	│   ├── MenuPage.jsx
	│   └── AdminMenuPage.jsx
	├── routes/
	│   ├── AppRoutes.jsx            # Rotas da aplicação
	│   └── RequireAdmin.jsx         # Proteção das rotas administrativas
	├── hooks/                      # Estado e lógica reutilizável das telas
	│   ├── useAuth.js
	│   ├── useDishes.js
	│   └── useRegions.js
	├── context/
	│   └── AuthContext.jsx          # Estado de autenticação compartilhado
	├── services/                   # Acesso ao Firebase e aos dados
	│   ├── firebase.js              # Inicialização do Firebase
	│   ├── authService.js           # Login e sessão dos usuários
	│   ├── dishService.js           # Consulta e CRUD de pratos
	│   └── regionService.js         # Consulta e CRUD de regiões
	├── models/                     # Formato dos dados do domínio
	│   ├── Dish.js
	│   └── Region.js
	├── styles/                     # Estilos globais e tokens visuais
	│   ├── variables.css
	│   └── global.css
	├── utils/                      # Formatação e validações compartilhadas
	│   ├── formatters.js
	│   └── validators.js
	├── App.jsx                     # Composição principal da aplicação
	└── main.jsx                    # Inicialização do React
```

Esta é a estrutura-alvo, não o inventário dos arquivos existentes. Os nomes podem ser ajustados durante a implementação, mantendo as responsabilidades separadas.

## Responsabilidades

- **SplashPage:** apresenta a mensagem de boas-vindas e encaminha o visitante para o aplicativo.
- **LoginPage:** oferece acesso com Google para visitantes e entrada com usuário e senha para administradores.
- **HomePage:** apresenta banners, informações e curiosidades sobre o Brasil e suas cinco regiões.
- **MenuPage:** permite consultar pratos e quantidades disponíveis.
- **AdminMenuPage:** permite criar, consultar, atualizar e excluir regiões e pratos, além de alterar as quantidades.
- **AppRoutes:** direciona cada perfil para as áreas permitidas e protege as páginas administrativas.
- **components:** reúne elementos reutilizáveis, incluindo cartões e formulários para regiões e pratos.
- **hooks:** encapsula o carregamento e as operações de autenticação, regiões e pratos usados pelas telas.
- **AuthContext:** compartilha a sessão e o perfil autenticado entre a aplicação e as rotas.
- **services:** concentra autenticação e acesso aos dados no Firebase, sem espalhar chamadas ao backend pelas telas.
- **models:** documenta o formato esperado para regiões e pratos.
- **styles:** mantém estilos globais e variáveis visuais; **utils** concentra formatação e validação reutilizáveis.

## Dados do cardápio

A aplicação deverá manter regiões e pratos. Cada prato deverá estar associado a uma região e possuir uma quantidade disponível para exibição e gerenciamento. Os campos adicionais e o formato definitivo dos dados deverão ser definidos na modelagem.

## Autenticação e autorização

Visitantes entram com uma conta Google. Administradores acessam as funções de gerenciamento após autenticação; a autorização dessas operações deve ser aplicada também nas regras do backend, não apenas nas rotas da interface.

O conceito especifica usuário e senha para administradores, mas ainda não define como esse usuário será representado no Firebase. Essa decisão deve ser tomada antes da implementação da autenticação.

## PWA e backend

- **Frontend:** React e Vite.
- **PWA:** `vite-plugin-pwa` configura o manifesto, o service worker e o fluxo de atualização do aplicativo.
- **Backend:** Firebase, com os serviços necessários para autenticação e persistência do cardápio definidos durante a implementação.

O produto Firebase para persistência do cardápio (por exemplo, Cloud Firestore) deve ser confirmado antes da implementação dos serviços.