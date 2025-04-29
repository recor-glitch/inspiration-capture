# Use full Node base image
FROM node:20-alpine

# Install required Linux dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    udev \
    dumb-init \
    bash \
    curl

# Set the working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Generate Prisma client if needed
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "run", "dev"]
