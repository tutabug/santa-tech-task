FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx nx build backend-template

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/backend-template ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "main.js"]

