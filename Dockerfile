# Use the official Node.js image as a base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR app

## Copy the package.json and package-lock.json
#COPY package*.json ./

RUN npm install -g pnpm

# Copy the application code to the working directory
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the Nuxt 3 app for production
RUN pnpm build

# Expose port 3000
EXPOSE 3000

# Set the command to start the app in production mode
CMD ["pnpm", "start"]