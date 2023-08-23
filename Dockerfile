# Use an official Node.js runtime as the base image
FROM node:16.4.2

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 1337

# Start the Node.js app
CMD ["npm", "start"]
