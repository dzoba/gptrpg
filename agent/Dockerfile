FROM node:19-alpine
WORKDIR /app
COPY . .

RUN npm install

# Make all files accessible such that the image supports arbitrary  user ids
RUN mkdir -p /.npm
RUN chgrp -R 0 /app && chmod -R g=u /app
RUN chgrp -R 0 /.npm && chmod -R g=u /.npm

EXPOSE 8080

# RUN echo -e window.__version="{\"version\":\""$VERSION"\"}" > /app/build/version.js
CMD [ "npm", "start" ]
