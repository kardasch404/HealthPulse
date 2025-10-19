FROM node:20-alpine

# Install MongoDB client tools
RUN apk add --no-cache mongodb-tools

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Default command (can be overridden by docker-compose)
CMD ["npm", "start"]