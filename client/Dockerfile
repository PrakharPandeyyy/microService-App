FROM  node:14-alpine

ENV CI=true
ENV WDS_SOCKET_PORT=0

WORKDIR /app
COPY package.json /app
RUN npm install
COPY ./ ./

CMD ["npm", "start"]

