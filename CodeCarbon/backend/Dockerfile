FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create volume mount point for emissions data
RUN mkdir -p /app/results
VOLUME /app/results

EXPOSE 5000

CMD ["node", "server.js"]