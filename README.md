# StudyBlitz

A modern study management application built with React, TypeScript, and Vite.

## Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher) - Only needed for local development without Docker
- npm (comes with Node.js)

## Getting Started

### Using Docker (Recommended)

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. The application will be available at:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:8000`

3. The containers will automatically restart when you make changes to the source files.

### Running Locally Without Docker

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

- `/src` - Main source code directory
- `/src/components` - React components
- `/src/lib` - Utility functions and API integrations
- `/backend` - Backend server code (FastAPI + PostgreSQL)

## Available Scripts

### Docker Commands
- `docker-compose up --build` - Build and start all containers
- `docker-compose down` - Stop and remove containers
- `docker-compose exec backend python manage.py shell` - Access the backend Python shell

### Local Development Commands
- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run preview` - Preview the production build locally

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + PostgreSQL
- State Management: React Context API
- Authentication: Supabase
- Containerization: Docker + Docker Compose

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
