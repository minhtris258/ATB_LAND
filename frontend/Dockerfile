# Stage 1: Build ứng dụng React.js (Vite)
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Phục vụ file tĩnh bằng Nginx siêu nhẹ
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Hỗ trợ điều hướng React Router SPA không bị lỗi 404 khi F5
RUN printf 'server {\n    listen 80;\n    server_name localhost;\n    root /usr/share/nginx/html;\n    index index.html;\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
