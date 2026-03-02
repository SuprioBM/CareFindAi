FROM node:22-alpine

WORKDIR /app

# install dependencies first (better cache)
COPY package*.json ./
RUN npm ci

# copy source
COPY . .

EXPOSE 5000

# production run (use nodemon only outside docker)
CMD ["node", "index.js"]