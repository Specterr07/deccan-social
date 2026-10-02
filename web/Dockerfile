# Build from the repo root so the brand/ folder is available:
#   docker build -f web/Dockerfile -t deccan-social .
# Playwright's base image already contains Chromium and its system libraries (needed for T-02 rendering).
# Keep the image tag's version in sync with the `playwright` package once T-02 installs it.
FROM mcr.microsoft.com/playwright:v1.63.0-noble

RUN npm install -g pnpm@12.8.1
WORKDIR /app

# Install dependencies first so Docker caches this layer until package files change.
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./web/
WORKDIR /app/web
RUN pnpm install --frozen-lockfile

# Copy the app and the brand kit. In the repo, web/public/brand is a symlink; in the image it is a real copy.
COPY web/ ./
RUN rm -f public/brand
COPY brand/ ./public/brand/

# src/env.ts skips validation during the build; real values are Fly secrets at runtime.
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
