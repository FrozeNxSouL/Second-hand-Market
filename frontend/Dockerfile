# Base stage (common)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Development stage
FROM base AS dev
CMD ["npm", "run", "dev"]

# Production stage: build
FROM base AS build
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY next.config.js ./
COPY tailwind.config.js ./tailwind.config.js
COPY postcss.config.js ./postcss.config.js
RUN npm run build

# Production image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.js ./next.config.js
EXPOSE 3000
CMD ["npm", "start"]