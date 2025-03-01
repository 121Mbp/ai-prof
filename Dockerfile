# Step 1: Build the React/Vite application
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json for dependencies installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . ./

# Run the build command
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Remove the default Nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the previous stage (dist folder)
COPY --from=build /app/dist /usr/share/nginx/html

COPY .env .env

COPY nginx.conf /etc/nginx/conf.d

# Expose port 80
EXPOSE 80 443 5173

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]