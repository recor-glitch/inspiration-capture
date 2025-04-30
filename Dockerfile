# Use a slim Node base image for Puppeteer compatibility
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install Chromium and required system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libgbm1 \
    libgtk-3-0 \
    libasound2 \
    libnss3 \
    libxss1 \
    libxshmfence1 \
    libxdamage1 \
    libxrandr2 \
    libxcomposite1 \
    libxext6 \
    libx11-xcb1 \
    xdg-utils \
    wget \
    ca-certificates \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package.json and lock file first (for caching)
COPY package.json package-lock.json ./

# Install dependencies (includes prisma)
RUN npm install

# Copy the rest of the application code
COPY . .

# Prisma generate step (after code is copied, so schema is available)
RUN npx prisma generate

# Set Puppeteer Chromium path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose app port
EXPOSE 5000

# Start your app
CMD ["npm", "run", "dev"]
