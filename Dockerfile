FROM node:alpine

COPY . .

ENTRYPOINT [ "npm", "start" ]