# Use Node.js 12
FROM node:12

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies
RUN npm install

# Install Firebase CLI globally
RUN npm install -g firebase-tools@10.9.2
RUN npm install -g @angular/cli


# Copy the rest of the application files
COPY . .

# Expose port 4200 for Angular
EXPOSE 4200

# Default command
CMD ["npm", "start", "--", "--host", "0.0.0.0"]