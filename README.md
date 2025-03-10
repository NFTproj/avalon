# Estrutura de Projeto para Aplicação White Label

A estrutura abaixo utiliza arquivos separados por cliente e idioma para organizar textos, configurações e assets:

```javascript
project-root/
├── src/
│   ├── app/                  
│   │   ├── layout.jsx         // Layout global (pode carregar temas, cores, etc.)
│   │   └── page.jsx           // Página principal ou rotas
│   ├── components/            // Componentes reutilizáveis da UI
│   ├── lib/                   // Funções auxiliares (ex.: carregamento de configurações i18n)
│   └── data/                  
│       ├── clientA/           // Configurações e textos para Cliente A
│       │   ├── pt.json        // Textos em Português
│       │   └── en.json        // Textos em Inglês
│       └── clientB/           // Configurações e textos para Cliente B
│           ├── pt.json        // Textos em Português
│           └── en.json        // Textos em Inglês
├── public/
│   ├── assets/
│   │   ├── clientA/           // Assets (imagens, fontes, etc.) para Cliente A
│   │   └── clientB/           // Assets para Cliente B
├── tailwind.config.js         // Configuração do Tailwind CSS (pode usar temas personalizados)
├── next.config.js             // Configuração do Next.js (incluindo i18n se necessário)
└── package.json
```


## Descrição dos Diretórios

- **src/data/**  
  Cada cliente possui sua própria pasta (ex.: `clientA` e `clientB`) contendo arquivos JSON para cada idioma. Esses arquivos armazenam os textos e configurações específicas para cada parte da aplicação (como header, landing page, etc.).

- **src/lib/**  
  Contém funções auxiliares, por exemplo, um helper que carrega o arquivo JSON correto com base no cliente (identificado via variável de ambiente ou outra lógica) e no idioma atual.

- **src/app/**  
  Guarda o layout global e as páginas principais. No layout, você pode carregar as configurações (como temas do Tailwind) e passar os textos via Context API ou props para os componentes filhos.

- **src/components/**  
  Reúne componentes reutilizáveis da interface de usuário.

- **public/assets/**  
  Contém os assets (imagens, fontes, etc.) separados por cliente para garantir que cada white label utilize seus próprios recursos visuais.

- **tailwind.config.js**  
  Configuração do Tailwind CSS que pode incluir variações de cores ou estilos específicos para cada cliente.

- **next.config.js**  
  Configurações do Next.js, podendo incluir suporte à internacionalização (i18n) se necessário.

Esta estrutura modular facilita a manutenção, a escalabilidade e a personalização para cada cliente e idioma, permitindo que você atualize ou adicione novos conteúdos sem interferir nos demais white labels.
