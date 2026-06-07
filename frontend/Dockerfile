# Etapa 1: Construcción
FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del frontend
COPY . .

# Compilar la aplicación React con Vite
RUN npm run build

# Etapa 2: Servidor Web de Producción
FROM nginx:alpine

# Copiar los archivos compilados del frontend al directorio público de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto por defecto de Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
