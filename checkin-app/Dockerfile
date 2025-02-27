# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /opt/checkin-app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Copy the .env file from the root directory
COPY ./.env ./

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000