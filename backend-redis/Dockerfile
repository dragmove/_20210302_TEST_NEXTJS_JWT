FROM node:alpine

LABEL author="Hyunseok Kim"

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

EXPOSE 9000

COPY ./ ./

CMD ["npm", "run", "dev"]