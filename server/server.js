import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './configs/db.js';
import formsRoutes from './routes/forms.routes.js';
import responsesRoutes from './routes/responses.routes.js';
import { uploadsDir } from './configs/multer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://dynamic-form-builder-client.vercel.app',
    /https:\/\/dynamic-form-builder-client.*\.vercel\.app$/ // For preview deployments
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ⚠️ IMPORTANT: Serve uploaded files statically BEFORE API routes
// This allows /uploads/filename.pdf to work
app.use('/uploads', express.static(uploadsDir));

console.log('📁 Serving uploads from:', uploadsDir);

// API Routes
app.use('/api/forms', formsRoutes);
app.use('/api/responses', responsesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uploadDir: uploadsDir,
    environment: process.env.VERCEL ? 'Vercel' : 'Local',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Server is live and running',
    endpoints: {
      health: '/api/health',
      forms: '/api/forms',
      responses: '/api/responses',
      uploads: '/uploads'
    }
  });
});

// 404 handler - This must come AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});

// Export for Vercel serverless
export default app;

// Start server only for local development
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 Forms API: http://localhost:${PORT}/api/forms`);
    console.log(`📁 Uploads available at: http://localhost:${PORT}/uploads`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
    });
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
}