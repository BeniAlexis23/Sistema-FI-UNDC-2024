# Usar la imagen de Node para construir la aplicación
FROM node:14 AS build

# Establecer el directorio de trabajo en la imagen
WORKDIR /app

# Copiar el archivo package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Usar la imagen de Nginx para servir la aplicación optimizada
FROM nginx:alpine