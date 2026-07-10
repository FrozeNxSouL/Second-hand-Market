# Base stage (common)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate

# Development stage
FROM base AS dev
# We don't copy the source code here because we will mount it in docker-compose
# We just set the command to be overridden by docker-compose
CMD ["npm", "run", "dev"]

# Production stage: build
FROM base AS build
COPY src ./src
COPY tsconfig.json ./tsconfig.json
RUN npm run build

# Production image
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
CMD ["npm", "start"]