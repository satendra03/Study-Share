// CORS options

import { type CorsOptions } from "cors";

// Define allowed origins
const allowedOrigins = [`http://localhost:5173`, `http://localhost:3000`];

// Configure CORS options
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Check if the origin is in the allowed list or if it's a same-origin request
    if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true, // Allow cookies and authorization headers to be sent cross-origin
};