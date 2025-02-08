import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { swapRouter } from './v1/actions/swap';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/swap', swapRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
