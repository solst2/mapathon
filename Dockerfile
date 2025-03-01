### STAGE 1: Build ###

# Build and compile app
FROM node:10 as build
MAINTAINER group 4

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn
RUN yarn global add react-scripts

# Copy app source
COPY . /usr/src/app

# Run the build
RUN yarn run build

### STAGE 2: Production Environment ###

# Deploy on the web server
FROM nginx:alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

COPY ./react.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]