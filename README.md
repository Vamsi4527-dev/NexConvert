# StreamVault | YouTube MP4/MP3 Downloader

A full-stack premium YouTube converter built with Node.js, Express, and yt-dlp.

## Features
- ✨ Modern, Premium UI
- 🎥 MP4 High Quality Video Downloads
- 🎵 MP3 High Quality Audio Extraction
- ⚡ Fast metadata fetching
- 🛡️ Rate limiting & Security headers
- 🧹 Automatic temporary file cleanup

## Prerequisites
Before running the app, ensure you have the following installed:
1. **Node.js** (v14 or higher)
2. **yt-dlp**: [Installation Guide](https://github.com/yt-dlp/yt-dlp#installation)
3. **ffmpeg**: [How to install FFmpeg](https://ffmpeg.org/download.html) (Required for merging video/audio and MP3 conversion)

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Run in production mode**:
   ```bash
   npm start
   ```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `server.js`: Express backend logic and yt-dlp integration.
- `public/`: Static assets (CSS).
- `views/`: HTML pages (Landing, Converter, Result).
- `downloads/`: Temporary storage for files during processing (auto-cleaned).

## Security Notes
- Input URLs are validated via regex.
- `child_process.spawn` is used instead of `exec` to prevent command injection.
- Basic rate limiting is applied to API routes.
- Temporarily downloaded files are deleted immediately after the transfer is complete.
