FROM node:latest AS build

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

# Mueve _redirects al directorio de la aplicación
RUN cp _redirects ./dist

RUN npm run build

FROM nginx:latest

COPY --from=build /app/dist /usr/share/nginx/html