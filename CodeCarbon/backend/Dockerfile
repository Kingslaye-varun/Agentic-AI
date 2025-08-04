FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm install
RUN npm install multer@1.4.5-lts.1

# Copy app source
COPY . .

# Create volume mount point for emissions data and logs directory
RUN mkdir -p /app/results /app/logs
VOLUME /app/results

EXPOSE 5000

CMD ["node", "server.js"]