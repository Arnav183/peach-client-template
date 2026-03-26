#!/bin/bash
# Peach Stack - Deploy a new client to Fly.io (free)
# Usage: ./deploy-client.sh

set -e

echo ""
echo "  Peach Stack - New Client Deploy"
echo "  ================================"
echo ""

read -p "  Client slug (e.g. luxe-threading, no spaces): " SLUG
read -p "  Business name (e.g. Luxe Threading Studio): " BIZ_NAME
read -p "  Owner email: " OWNER_EMAIL
read -p "  Temp password (client changes on first login): " OWNER_PW
read -p "  Industry (beauty/auto/restaurant/medical/retail/fitness/agency/general): " INDUSTRY

$APP_NAME="peach-${SLUG}"

echo ""
echo "  Deploying ${BIZ_NAME} as ${APP_NAME}.fly.dev ..."
echo ""

# Swap placeholder app name in fly.toml
sed -i.bak "s/peach-client-REPLACE_ME/${APP_NAME}/" fly.toml

# Create the app on Fly.io
fly launch --name "${APP_NAME}" --region iad --no-deploy --yes 2>/dev/null || true

# Set all secrets
fly secrets set \
  JWT_SECRET="$(openssl rand -hex 32)" \
  BUSINESS_NAME="${BIZ_NAME}" \
  OWNER_EMAIL="${OWNER_EMAIL}" \
  OWNER_PASSWORD="${OWNER_PW}" \
  INDUSTRY="${INDUSTRY}" \
  NODE_ENV="production" \
  --app "${APP_NAME}"

# Create persistent volume for SQLite (1GB, free on Fly)
fly volumes create client_data --size 1 --region iad --app "${APP_NAME}" --yes 2>/dev/null || echo "  Volume may already exist, continuing..."

# Deploy
fly deploy --app "${APP_NAME}"

# Restore fly.toml placeholder
mv fly.toml.bak fly.toml 2>/dev/null || sed -i "s/${APP_NAME}/peach-client-REPLACE_ME/" fly.toml

echo ""
echo "  Done! Client is live."
echo ""
echo "  URL:      https://${APP_NAME}.fly.dev/login"
echo "  Email:    ${OWNER_EMAIL}"
echo "  Password: ${OWNER_PW}"
echo ""
echo "  Client must change password on first login."
echo ""
