FROM node:12-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
EXPOSE 8080
COPY . .
CMD ["node", "index.js"]
