# Reading Quest

App pessoal de gamificação de leitura. Importa PDF, PNG/JPEG, DOCX ou texto colado, reformata tudo para um mesmo formato de leitura (sem imagens) usando a API do Gemini, e calcula uma meta diária de palavras + streak a partir do prazo que você definir.

Sem login: todos os dados (documentos, progresso, streak) ficam só no SQLite local do app.

## Estrutura

- `app/`, `src/` — o app Expo Router (React Native).
- `proxy/` — função serverless (Vercel) que guarda a `GEMINI_API_KEY` e chama a API do Gemini. O app nunca fala direto com o Gemini.

## Rodando o proxy

```bash
cd proxy
npm install
cp .env.example .env   # preencha GEMINI_API_KEY
npx vercel dev          # sobe em http://localhost:3000
```

## Rodando o app

```bash
cp .env.example .env    # aponte EXPO_PUBLIC_PROXY_URL pro proxy acima
npm install
npx expo start
```

Abra no Expo Go (Android/iOS) ou emulador. Web ainda não é suportado porque o `expo-sqlite` requer configuração extra de WASM/headers para rodar no navegador (ver docs do expo-sqlite).

## Deploy do proxy

`cd proxy && npx vercel` — depois configure `GEMINI_API_KEY` (e opcionalmente `GEMINI_MODEL`) nas variáveis de ambiente do projeto na Vercel, e aponte `EXPO_PUBLIC_PROXY_URL` do app pra URL de produção.

## Limitações conhecidas (v1)

- PDFs muito grandes (centenas de páginas) são enviados ao Gemini em uma única chamada — não há divisão automática por páginas ainda. DOCX e texto colado já são divididos em lotes por contagem de palavras.
- Progresso de leitura é estimado pela posição de rolagem no leitor, não por parágrafo lido de fato.
- Gamificação v1: só meta diária + streak (sem XP, badges ou ranking).
