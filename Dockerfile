# -------- Stage 1: build (optional future support for Node builds) --------
FROM alpine:3.20 AS builder

WORKDIR /app

# Copy only website files
COPY index.html index.css index.js ./

# -------- Stage 2: nginx runtime --------
# Use official nginx image
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your HTML files to nginx web folder
COPY . /usr/share/nginx/html

# Security: remove unnecessary packages cache
RUN rm -rf /var/cache/apk/*

# Expose HTTP and HTTPS ports
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
