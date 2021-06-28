FROM node:latest

RUN mkdir /app
WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

CMD ["yarn", "run", "start-off"]