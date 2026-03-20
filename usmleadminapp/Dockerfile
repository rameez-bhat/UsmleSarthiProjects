# ---------- Build stage ----------
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
# Copy env file BEFORE build
COPY .env.production .env
COPY . .

RUN npm run build

# ---------- Production stage ----------
FROM nginx:alpine

# Remove default files
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output
COPY --from=build /app/build /usr/share/nginx/html

# SPA routing support
RUN printf "server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files \$uri \$uri/ /index.html;\n\
  }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]