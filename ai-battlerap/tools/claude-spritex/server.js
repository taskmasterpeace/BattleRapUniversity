const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3456;

// Store uploaded files temporarily
const upload = multer({ dest: 'temp_uploads/' });

app.use(express.json());
app.use(express.static(__dirname));

// Serve the GUI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'spritex-app.html'));
});

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Move to a better location with original name
  const originalName = req.file.originalname;
  const newPath = path.join(__dirname, 'temp_uploads', originalName);
  fs.renameSync(req.file.path, newPath);

  res.json({
    success: true,
    path: newPath,
    filename: originalName
  });
});

// Extract endpoint
app.post('/extract', async (req, res) => {
  const { mode, inputPath, outputFolder, settings, crops } = req.body;

  const outputDir = path.resolve(__dirname, '../../public/sprites/characters', outputFolder);

  // Build command arguments
  let args = [];

  if (mode === 'auto') {
    args = [
      'dist/cli.js', 'extract', inputPath,
      '-o', outputDir,
      '-t', '',
      '-r', settings.rows.toString(),
      '--cols', settings.cols.toString(),
      '--chroma-green',
      '--tolerance', settings.tolerance.toString(),
      '--trim-grid', settings.trimGrid.toString(),
      '--remove-dark-lines',
      '--prefix', 'sprite'
    ];
  } else {
    args = [
      'dist/cli.js', 'manual', inputPath,
      '-o', outputDir,
      '--chroma-green',
      '--tolerance', settings.tolerance.toString(),
      '--prefix', 'sprite'
    ];

    // Add crop regions
    crops.forEach(crop => {
      args.push('--crop', `${crop.x},${crop.y},${crop.width},${crop.height}`);
    });
  }

  console.log('Running:', 'node', args.join(' '));

  // Run the extraction
  const child = spawn('node', args, { cwd: __dirname });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
    console.log(data.toString());
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
    console.error(data.toString());
  });

  child.on('close', (code) => {
    // Get list of extracted files
    let files = [];
    try {
      if (fs.existsSync(outputDir)) {
        files = fs.readdirSync(outputDir)
          .filter(f => f.endsWith('.png'))
          .map(f => `/sprites/${outputFolder}/${f}`);
      }
      // Check nested characters folder too
      const nestedDir = path.join(outputDir, 'characters');
      if (fs.existsSync(nestedDir)) {
        files = fs.readdirSync(nestedDir)
          .filter(f => f.endsWith('.png'))
          .map(f => `/sprites/${outputFolder}/characters/${f}`);
      }
    } catch (e) {
      console.error('Error reading output dir:', e);
    }

    res.json({
      success: code === 0,
      code,
      stdout,
      stderr,
      outputDir,
      files,
      count: files.length
    });
  });
});

// Serve extracted sprites
app.use('/sprites', express.static(path.join(__dirname, '../../public/sprites/characters')));

// Cleanup temp files on exit
process.on('SIGINT', () => {
  const tempDir = path.join(__dirname, 'temp_uploads');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  process.exit();
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║         SpriteX GUI Server                ║
╠═══════════════════════════════════════════╣
║  Open in browser: http://localhost:${PORT}  ║
╚═══════════════════════════════════════════╝
`);
});
