const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serves CSS
app.use(express.static('views'));  // Serves HTML

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

// Helper for yt-dlp (Shared by Info and Download)
const isWindows = process.platform === 'win32';
const ytCmd = isWindows ? 'python' : 'yt-dlp';
const getArgs = (args) => isWindows ? ['-m', 'yt_dlp', ...args] : args;

// Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/converter', (req, res) => res.sendFile(path.join(__dirname, 'views', 'converter.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'views', 'result.html')));

// Helper: Validate YouTube URL
function isValidYoutubeUrl(url) {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return regex.test(url);
}

// API: Get Video Information (Title, Thumbnail, etc.)
app.post('/api/info', (req, res) => {
    const { url } = req.body;
    if (!url || !isValidYoutubeUrl(url)) {
        return res.status(400).json({ error: 'Please provide a valid YouTube URL' });
    }

    const args = getArgs(['--print-json', '--skip-download', '--no-warnings', url]);
    const yt = spawn(ytCmd, args);

    let output = '';
    let errorOutput = '';

    yt.stdout.on('data', (data) => output += data.toString());
    yt.stderr.on('data', (data) => errorOutput += data.toString());

    yt.on('close', (code) => {
        if (code !== 0) {
            console.error(`yt-dlp error: ${errorOutput}`);
            return res.status(500).json({ error: 'Failed to fetch video info. Try again later.' });
        }
        try {
            const meta = JSON.parse(output);
            res.json({
                title: meta.title,
                thumbnail: meta.thumbnail,
                duration: meta.duration_string || `${Math.floor(meta.duration / 60)}:${meta.duration % 60}`,
                url: url
            });
        } catch (e) {
            console.error('Parsing error:', e);
            res.status(500).json({ error: 'Failed to process video data' });
        }
    });
});

// API: Download Video or Audio
app.get('/download', (req, res) => {
    const { url, format } = req.query;
    if (!url) return res.status(400).send('URL is required');

    const isMp3 = format === 'mp3';
    const ext = isMp3 ? 'mp3' : 'mp4';
    const outputPath = path.join(downloadsDir, `file_${Date.now()}.${ext}`);

    const args = isMp3
        ? ['-x', '--audio-format', 'mp3', '-o', outputPath, url]
        : ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best', '-o', outputPath, url];

    const yt = spawn(ytCmd, getArgs(args));

    yt.on('close', (code) => {
        if (code !== 0) return res.status(500).send('Download failed');
        res.download(outputPath, () => {
            fs.unlink(outputPath, () => { }); // Delete file after download
        });
    });
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
