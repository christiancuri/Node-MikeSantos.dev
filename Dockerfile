FROM node:10
WORKDIR /app
COPY . /app
RUN yarn install --only=production
EXPOSE 8080
CMD ["yarn", "run", "server:prod"]