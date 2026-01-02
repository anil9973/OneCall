FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (including dev dependencies for esbuild)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build with esbuild
# --packages=external leaves node_modules out of the bundle (safer for Fastify/native deps)
# --minify reduces file size
RUN npx esbuild $ENTRY_POINT --bundle --platform=node --packages=external --minify --outfile=dist/server.js

# --- Stage 2: Runner ---
FROM node:18-alpine

WORKDIR /app

# Copy package files to install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the bundled server file from the builder stage
COPY --from=builder /app/dist/server.js .

# Expose the port (Cloud Run defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
EOF

echo "✅ Dockerfile generated."

# 5. Build and Push the Container Image using Cloud Build
echo "🏗️  Building container image via Cloud Build..."
# We use gcr.io for simplicity, but you can also setup an Artifact Registry repo
IMAGE_URL="gcr.io/$PROJECT_ID/$SERVICE_NAME"

gcloud builds submit --tag "$IMAGE_URL" .

# 6. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_URL" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080

echo "============================================================"
echo "✅ Deployment Complete!"
echo "🌍 Service URL:"
gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)'
echo "============================================================"