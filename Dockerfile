# Use official nginx image
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your HTML files to nginx web folder
COPY . /usr/share/nginx/html

# Expose port
EXPOSE 80, 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
