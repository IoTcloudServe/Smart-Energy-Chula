FROM node:12-slim
#RUN npm install -g nodemon
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
EXPOSE 8080
COPY . .
#CMD [ "npm", "run", "start" ]
CMD ["node", "index.js"]