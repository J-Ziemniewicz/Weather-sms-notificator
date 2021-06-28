FROM node:14.17-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:1.17.1-alpine
ENV PORT 8080
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/weather-app-frontend /usr/share/nginx/html