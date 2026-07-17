# Dashboard Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose dashboard port
EXPOSE 5173

# Start Vite dev server (accessible outside container)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
