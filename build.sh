#!/bin/bash

# Exit on error
set -e

# Build the React frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Create the static directory in backend if it doesn't exist
echo "Creating static directory in backend..."
mkdir -p ../backend/static

# Copy the frontend build files to the backend static directory
echo "Copying frontend build to backend/static..."
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    cp -R dist/* ../backend/static/
else
    echo "Error: Frontend build directory is empty or doesn't exist"
    exit 1
fi

echo "Build and copy complete!"