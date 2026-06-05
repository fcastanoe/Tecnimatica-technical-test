import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'API de Monitoreo Industrial funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
