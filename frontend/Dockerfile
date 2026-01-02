# Multi-stage build for React Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variables for production build
ARG VITE_MODE=prod
ARG VITE_BACK_END_PROD
ARG VITE_RECAPTCHA_SITE_KEY

ENV VITE_MODE=$VITE_MODE
ENV VITE_BACK_END_PROD=$VITE_BACK_END_PROD
ENV VITE_BACK_END_DEV=$VITE_BACK_END_PROD
ENV VITE_BACK_END_LOCAL=$VITE_BACK_END_PROD
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

# Build application
RUN yarn build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Use non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
