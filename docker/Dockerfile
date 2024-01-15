FROM node:19-bullseye

MAINTAINER Ivan Font <ifont@redhat.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json /usr/src/app

# Install app dependencies
RUN npm install

COPY . /usr/src/app

# Expose port 8080
EXPOSE 8080

# Run container
CMD ["npm", "start"]
