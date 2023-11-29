# Use an official Node.js runtime based on Alpine Linux as a parent image
ARG NODE_VERSION=21.2.0
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all stages
WORKDIR /usr/src/app

# Stage for installing dependencies
FROM base as deps

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# Stage for building the application
FROM base as builder

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Final stage used in production
FROM base as final

# Set node environment to production
ENV NODE_ENV production

# Run the application as a non-root user
USER node

# Copy package files
COPY package.json package-lock.json ./

# Copy node modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy build files from builder stage
COPY --from=builder /usr/src/app/lib ./lib

# Expose the port that the application listens on
EXPOSE 8080

# CMD to run our application when the container is started
CMD npm run start