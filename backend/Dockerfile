FROM node:18-alpine

WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para compilar TypeScript)
RUN npm install

# Copiar el resto del código del backend
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer el puerto del backend
EXPOSE 3000

# Comando para iniciar el backend usando el script de producción
CMD ["npm", "start"]
