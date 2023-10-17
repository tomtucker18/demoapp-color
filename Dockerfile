# Use an official Node.js runtime as the base image
FROM node:hydrogen-alpine as builder

# Add curl to builder image
RUN apk --no-cache add curl

# Install node-prune (https://github.com/tj/node-prune)
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

ENV NODE_ENV=production

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code to the container
COPY . .

# Remove development dependencies
RUN npm prune --production

# Run node prune
RUN /usr/local/bin/node-prune

# Create actual image
FROM node:hydrogen-alpine

WORKDIR /app

# Copy app from builder image
COPY --from=builder /app .

# Expose port 8080 for the Node.js application
EXPOSE 8080

# Define environment variables with default values
ENV PORT=8080
ENV VERSION=1.2.0
ENV THRESHOLD=0.95

# Start the Node.js application with the specified environment variables
CMD ["node", "server.js"]
