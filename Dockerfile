FROM node:13

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && apt-get install netcat-openbsd -y

ENTRYPOINT ["./docker-entrypoint.sh"]
