FROM node:22-alpine AS frontend-build
WORKDIR /workspace/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY infrastructure/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 8080

