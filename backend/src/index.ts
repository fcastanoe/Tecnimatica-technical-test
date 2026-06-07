import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import connection to trigger test query on startup
import './config/database';

import sensorRoutes from './routes/sensorRoutes';
import zoneRoutes from './routes/zoneRoutes';
import monitoringRoutes from './routes/monitoringRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/sensors', sensorRoutes);
app.use('/zones', zoneRoutes);
app.use('/monitorings', monitoringRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'API de Monitoreo Industrial funcionando correctamente' });
});

// Centralized error handler — must be last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
