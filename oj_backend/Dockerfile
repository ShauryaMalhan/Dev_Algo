FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS builder
RUN npm install
COPY . .

FROM node:18-alpine
RUN apk add --no-cache \
    g++ \
    gcc \
    openjdk11-jdk \
    python3 \
    py3-pip
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app .
EXPOSE 8000
CMD [ "node", "index.js" ]