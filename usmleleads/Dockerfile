# Use Node.js 22
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies
RUN npm install

# Install Firebase CLI globally
#RUN npm install -g firebase-tools@13.32.0

COPY .env.production .env

# Copy the rest of the application files
COPY . .

# Expose port 4200 for Angular
EXPOSE 80

# Default command
#CMD ["npm", "start", "--", "--host", "0.0.0.0"]
#CMD ["npm", "start"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
