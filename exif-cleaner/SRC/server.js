/**
 * VaultMeta — Backend opcional para processamento de vídeos
 * Necessário apenas para: MP4, MOV, MKV, AVI
 * Imagens funcionam 100% no frontend (index.html standalone)
 *
 * Pré-requisitos:
 *   npm install express multer fluent-ffmpeg cors
 *   ffmpeg instalado no sistema (https://ffmpeg.org/download.html)
 *
 * Uso:
 *   node server.js
 *   Acesse: http://localhost:3000
 */

const express  = require("express");
const multer   = require("multer");
const ffmpeg   = require("fluent-ffmpeg");
const cors     = require("cors");
const path     = require("path");
const fs       = require("fs");
const os       = require("os");
const crypto   = require("crypto");

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── HEADERS PARA SharedArrayBuffer (FFmpeg.wasm no frontend) ────────
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(cors());
app.use(express.static(path.join(__dirname, "../front")));

// ─── UPLOAD CONFIG (memória + disco temporário) ───────────────────────
const tmpDir = path.join(os.tmpdir(), "vaultmeta");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  destination: (req, file, cb) => cb(null, tmpDir),
  filename:    (req, file, cb) => {
    const unique = crypto.randomBytes(16).toString("hex");
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB máximo
  fileFilter: (req, file, cb) => {
    const allowed = [
      "video/mp4", "video/quicktime", "video/x-matroska",
      "video/x-msvideo", "video/avi"
    ];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ─── ROTA: REMOÇÃO DE METADADOS DE VÍDEO ────────────────────────────
app.post("/api/video/strip", upload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

  const inputPath  = req.file.path;
  const ext        = path.extname(req.file.originalname);
  const outputName = `vaultmeta_clean_${crypto.randomBytes(8).toString("hex")}${ext}`;
  const outputPath = path.join(tmpDir, outputName);

  console.log(`[VaultMeta] Processando vídeo: ${req.file.originalname}`);

  ffmpeg(inputPath)
    .outputOptions([
      "-map_metadata", "-1",  // Remove TODOS os metadados
      "-c:v", "copy",         // Copia vídeo sem re-encodar (rápido)
      "-c:a", "copy",         // Copia áudio sem re-encodar
      "-fflags", "+bitexact", // Modo determinístico
      "-map_chapters", "-1",  // Remove capítulos
    ])
    .output(outputPath)
    .on("end", () => {
      console.log(`[VaultMeta] Concluído: ${outputName}`);

      const originalName = path.basename(req.file.originalname, ext);
      const downloadName = `vaultmeta_clean_${originalName}${ext}`;

      res.download(outputPath, downloadName, (err) => {
        // Limpeza imediata após envio
        cleanup(inputPath);
        cleanup(outputPath);
        if (err) console.error("[VaultMeta] Erro no download:", err);
      });
    })
    .on("error", (err) => {
      console.error("[VaultMeta] Erro FFmpeg:", err.message);
      cleanup(inputPath);
      cleanup(outputPath);
      res.status(500).json({ error: "Falha no processamento: " + err.message });
    })
    .run();
});

// ─── ROTA: STATUS ────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  res.json({ status: "online", version: "1.0.0", ffmpeg: true });
});

// ─── LIMPEZA AUTOMÁTICA DO DIRETÓRIO TMP ─────────────────────────────
function cleanup(filePath) {
  try { fs.unlinkSync(filePath); } catch (e) { /* silencioso */ }
}

// Limpar arquivos antigos a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  try {
    const files = fs.readdirSync(tmpDir);
    files.forEach(f => {
      const fp = path.join(tmpDir, f);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > 10 * 60 * 1000) cleanup(fp); // > 10 min
    });
  } catch (e) { /* silencioso */ }
}, 10 * 60 * 1000);

// ─── START ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║         VaultMeta — Servidor Online      ║`);
  console.log(`╠══════════════════════════════════════════╣`);
  console.log(`║  Local:   http://localhost:${PORT}          ║`);
  console.log(`║  Temp:    ${tmpDir.slice(0,30).padEnd(30)} ║`);
  console.log(`║  Status:  Aguardando uploads...          ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
});
