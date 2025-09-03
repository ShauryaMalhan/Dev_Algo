FROM node:18-alpine

RUN apk add --no-cache \
    g++ \
    gcc \
    openjdk11-jdk \
    python3 \
    py3-pip 

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]
