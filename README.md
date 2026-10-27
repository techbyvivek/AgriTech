# Agri-Tech — Empowering Farmers Through Digital Technology

A starter full-stack MERN application with a responsive React/Vite frontend and Express/Mongoose backend.

## Prerequisites
- Node.js 18+ (Node.js 20 LTS recommended)
- npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- Optional OpenWeather API key for weather lookups

## Quick start (Windows)
1. Install prerequisites above.
2. Copy `server/.env.example` to `server/.env`.
3. Update `MONGO_URI` and `JWT_SECRET` in `server/.env`.
4. Open two terminals in the project root:
   - Terminal 1: `cd server && npm install && npm run dev`
   - Terminal 2: `cd client && npm install && npm run dev`
5. Open the Vite URL shown in the terminal (normally http://localhost:5173).

Or run `start-windows.bat` to install dependencies and launch both apps in separate terminal windows. MongoDB must already be running.

## Demo accounts
No default admin or user is seeded. Register a Farmer, Customer, or Service Provider through the UI. Public registration never allows Admin role selection. For local development only, create an admin using the secure bootstrap script:
`cd server && npm run create-admin`
The script prompts for credentials and does not store a default password.

## Features in this starter
- Responsive landing page and role-aware dashboard navigation
- Farmer, Customer, Service Provider registration and login
- JWT authentication in an HttpOnly cookie
- Farm and crop CRUD API with ownership checks
- Weather lookup endpoint (requires optional OpenWeather key)
- Resource products, crop listings, bidding, COD order, services and booking API foundations
- English/Hindi language toggle for key interface strings
- Admin bootstrap script, API health endpoint, validation and centralized errors

## Notes
- This is a runnable starter project, not a production-certified deployment.
- Weather requires a valid API key. Soil records are user-entered, not sensor readings. Pest content is informational and should be reviewed by agricultural experts.
- Payment is Cash on Delivery only. Online payments, AI image diagnosis, real-time messaging, email/SMS delivery, and production hosting configuration are not implemented in this starter.
- Before production, add comprehensive automated tests, audit dependencies, configure HTTPS, review privacy/legal requirements, and perform security testing.
