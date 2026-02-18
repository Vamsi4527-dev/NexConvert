# Use Node.js LTS as base
FROM node:20-slim

# Install Python, ffmpeg, and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Link python3 to python for compatibility
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install yt-dlp via pip (the most reliable way)
RUN pip3 install --no-cache-dir yt-dlp --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Create downloads directory
RUN mkdir -p downloads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Start the application
CMD ["node", "server.js"]
