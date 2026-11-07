# VIVA — simulador de vida

VIVA é uma SPA single-player em português sobre escolhas, consequências e novas gerações. A experiência funciona localmente no navegador, sem backend ou multiplayer.

## Como executar

Abra `index.html` no navegador ou use o wrapper existente:

```bash
./start.sh
```

O jogo também pode ser servido por qualquer servidor estático. `capture.sh` é um utilitário opcional para validação/capturas locais.

## Sistemas

- avanço anual com renda, despesas, investimentos, dívidas, crédito, saúde, energia e envelhecimento;
- educação, habilidades, carreira, promoções, reputação e fama;
- relações, romance, parceiro e eventos sociais;
- família, filhos biológicos ou adotivos e painel de legado entre gerações;
- patrimônio, metas financeiras, viagens e saúde;
- atividades com requisitos de idade, energia, dinheiro e cooldown anual;
- crime com risco de prisão, pena, multas e consequências persistentes;
- morte, herança parcial e arquivo de até 12 gerações;
- criação de novas vidas com país, cidade, personalidade, talento e aparência.

## Persistência

O estado é salvo automaticamente no `localStorage` usando a chave `viva-save-v2`. Saves anteriores são mesclados com os valores padrão para manter compatibilidade quando novos sistemas são adicionados. Para recomeçar completamente, remova essa chave pelas ferramentas de armazenamento do navegador.

## Desenvolvimento

A interface está dividida em `index.html`, `style.css` e `app.js`. O estado centralizado é atualizado por ações e sincronizado pela função `render()`. Para verificar a sintaxe do JavaScript:

```bash
node --check app.js
```
