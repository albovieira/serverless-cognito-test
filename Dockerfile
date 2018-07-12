FROM node:8.9.2
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN apt-get update && apt-get install vim -y && npm install -g yarn nodemon && yarn
COPY . /usr/src/app
EXPOSE 3000
CMD [ "yarn", "dev" ]