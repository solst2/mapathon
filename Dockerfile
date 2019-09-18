### STAGE 1: Build ###

# Build and compile app
FROM node:10 as build
MAINTAINER Roger Schaer <roger.schaer@hevs.ch>

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
RUN npm install react-scripts -g

# Copy app source
COPY . /usr/src/app

# Run the build
RUN npm run build

### STAGE 2: Production Environment ###

# Deploy on the web server
FROM nginx:alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]