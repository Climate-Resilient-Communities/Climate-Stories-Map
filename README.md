# Combined Frontend and Backend Deployment

This project has been configured to deploy the frontend and backend as a single application while keeping the codebase separate.

## How It Works

1. **Structure**:
   - `frontend/`: Contains the React application
   - `backend/`: Contains the Flask API
   - `build.sh`: Script to build and combine for deployment
   - `render.yaml`: Configuration for deployment on Render

2. **Build Process**:
   - The React application gets built into static files
   - These files are copied to the backend's `static` directory
   - Flask serves the static files and handles API requests

3. **Local Development**:
   - You can still develop the frontend and backend separately
   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && flask run`

4. **Deployment**:
   - Use the `render.yaml` file for deployment on Render
   - The build process is handled automatically

## API Integration

The frontend makes API calls to `/api/...` endpoints, which are handled by the Flask backend. This works both in development (via proxy) and production (via Flask routing).

## Commands

- **Build for deployment (macOS/Linux/Git Bash/WSL)**: `./build.sh`
- **Build for deployment (Windows PowerShell)**: `./build.ps1`
- **Run locally**: 
   1. `./build.sh` (or `./build.ps1` on Windows PowerShell)
  2. `cd backend && flask run`

## Environment Variables

Make sure to set these environment variables in your deployment platform:
- `MONGODB_URI`
- `SECRET_KEY`
- `CAPTCHA_SECRET_KEY`