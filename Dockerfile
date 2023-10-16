# Use an official Node.js runtime as the base image
FROM node:lts-hydrogen

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code to the container
COPY . .

# Expose port 8080 for the Node.js application
EXPOSE 8080

# Define environment variables with default values
ENV PORT=8080
ENV VERSION=1.0.0
ENV THRESHOLD=0.95

# Start the Node.js application with the specified environment variables
CMD ["node", "index.js"]
