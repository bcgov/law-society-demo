# base image
FROM node:alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY a2a/package.json /app/package.json
RUN npm install
RUN npm install react-scripts -g
ADD a2a/src /app/src

# start app
CMD ["npm", "start"]
