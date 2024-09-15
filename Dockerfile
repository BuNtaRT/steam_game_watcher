FROM node:20

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY id_ed25519 /root/.ssh/id_ed25519
RUN chmod 600 /root/.ssh/id_ed25519
RUN touch /root/.ssh/known_hosts && ssh-keyscan github.com >> /root/.ssh/known_hosts

RUN git clone git@github.com:BuNtaRT/steam_game_watcher.git .

RUN yarn install
COPY .env .env

RUN npm run build

CMD ["npm", "start"]
