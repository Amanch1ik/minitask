# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Vite needs VITE_* env vars at build time — baked into the bundle.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
# Use npm install (not ci) because no lockfile is committed — the test
# task is meant to be cloneable without prior install. For a real deploy
# add package-lock.json and switch to `npm ci`.
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# --- runtime stage ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
