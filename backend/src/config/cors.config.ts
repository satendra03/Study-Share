// CORS options

import { type CorsOptions } from "cors";

// Build allowed origins from environment + sensible defaults
const allowedOrigins: string[] = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://study-share-jec.vercel.app"
];

// Add production frontend URL from env (e.g. FRONTEND_URL=https://studyshare.vercel.app)
// if (process.env.FRONTEND_URL) {
//   allowedOrigins.push(process.env.FRONTEND_URL);
// }

// Configure CORS options
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, mobile apps, Postman, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true, // Allow cookies and authorization headers
};