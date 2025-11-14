FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy your static files
COPY index.html .

# Expose port
EXPOSE 3000

# Serve the static files
CMD ["serve", "-s", ".", "-l", "3000"]
