FROM node:latest

MAINTAINER Gourav

ENV NODE_ENV production

RUN mkdir /var/app

WORKDIR /var/www

COPY . /var/www/

RUN npm install

EXPOSE 9102

CMD [ "node", "app.js" ]
