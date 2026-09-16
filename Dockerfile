FROM node:22-bookworm-slim

ARG USER_ID=1000
ARG GROUP_ID=1000

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN groupmod --gid "${GROUP_ID}" node \
    && usermod --uid "${USER_ID}" --gid "${GROUP_ID}" node \
    && chown -R node:node /app /home/node

USER node

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
