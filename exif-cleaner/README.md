# 🔒 VaultMeta — Removedor de Metadados EXIF

> Ferramenta 100% local para remover ou substituir metadados (EXIF, IPTC, XMP) de imagens e vídeos.
> Nenhum arquivo é enviado para servidores. Zero custo. Zero rastreamento.

---

## ⚡ Uso Rápido (Apenas Imagens — Sem Instalação)

1. Abra o arquivo `index.html` diretamente no navegador
2. Arraste suas imagens para a área de upload
3. Escolha o modo: **Remover Tudo** ou **Substituir Dados**
4. Clique em **⚡ Processar Arquivos**
5. Baixe os arquivos limpos

> ✅ Funciona 100% offline para imagens JPG, PNG, WEBP, GIF.

---

## 🎬 Suporte a Vídeos (Requer Node.js + FFmpeg)

Para processar vídeos MP4, MOV, MKV, AVI, use o servidor local:

### Pré-requisitos

1. **Node.js** (v16+): https://nodejs.org
2. **FFmpeg**: https://ffmpeg.org/download.html
   - **Windows**: Baixe o zip, extraia e adicione ao PATH
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg`

### Instalação

```bash
# Clone ou extraia os arquivos do projeto
cd exif-cleaner

# Instale as dependências Node
npm install

# Inicie o servidor
npm start
```

Acesse: **http://localhost:3000**

---

## 🚀 Deploy Gratuito

### Opção 1: Vercel (Recomendado para imagens)

```bash
npm install -g vercel
vercel deploy
```

O `index.html` funciona perfeitamente em qualquer host estático.

### Opção 2: Netlify (Drag & Drop)

1. Acesse https://netlify.com
2. Arraste a pasta do projeto para o painel
3. Pronto! URL gerada automaticamente.

### Opção 3: GitHub Pages

```bash
git init
git add .
git commit -m "VaultMeta"
gh repo create vaultmeta --public --push --source=.
# Ative GitHub Pages nas configurações do repositório
```

### Opção 4: Railway (Com servidor Node para vídeos)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 🛠 Como Funciona

### Imagens (Processamento no Browser)

| Formato | Método | Metadados Removidos |
|---------|--------|---------------------|
| JPG/JPEG | Canvas API | EXIF, IPTC, XMP, APP1-APP15 |
| PNG | Canvas API | tEXt, iTXt, zTXt chunks |
| WEBP | Canvas API | EXIF, XMP |
| GIF | Canvas API | Comentários, extensões |

**Como o Canvas remove metadados:**
Ao desenhar a imagem em um `<canvas>` e exportá-la de volta (`toBlob`/`toDataURL`), o browser cria uma nova imagem do zero — sem nenhum dado dos segmentos APP1-APP15 do original.

### Vídeos (FFmpeg no servidor)

```bash
# Comando executado internamente para cada vídeo
ffmpeg -i input.mp4 \
  -map_metadata -1 \    # Remove TODOS os metadados
  -c:v copy \           # Copia vídeo (sem re-encode = rápido)
  -c:a copy \           # Copia áudio
  -fflags +bitexact \   # Modo determinístico
  -map_chapters -1 \    # Remove capítulos
  output_clean.mp4
```

---

## 🔒 Privacidade

- **Zero uploads externos**: todo processamento ocorre no seu dispositivo
- **Zero armazenamento**: arquivos temporários deletados imediatamente após download
- **Zero logs**: nenhuma informação sensível é registrada
- **Zero analytics**: sem Google Analytics, sem rastreadores
- **Código aberto**: inspecione tudo no `index.html`

---

## 📦 Estrutura do Projeto

```
exif-cleaner/
├── index.html      # App completo (funciona standalone para imagens)
├── server.js       # Backend Node.js (necessário para vídeos)
├── package.json    # Dependências Node
└── README.md       # Este arquivo
```

---

## 🧪 Verificar se os Metadados foram Removidos

Após processar, verifique em:
- **ExifTool online**: https://exiftool.org
- **Jeffrey's Exif Viewer**: https://exif.regex.info/exif.cgi
- **Terminal**: `exiftool arquivo_processado.jpg`

---

## ❓ Perguntas Frequentes

**Q: Funciona sem internet?**
A: Sim! Para imagens, o `index.html` funciona 100% offline.

**Q: A qualidade das imagens é reduzida?**
A: JPEG: mínima (recompressão com qualidade 95%). PNG/WEBP: sem perda.

**Q: Posso processar vários arquivos de uma vez?**
A: Sim, múltiplos arquivos são suportados com drag & drop.

**Q: Os vídeos precisam do servidor?**
A: Sim. Para vídeos, execute `npm start` e acesse via `localhost:3000`.

---

## 📄 Licença

MIT License — Use, modifique e distribua livremente.
