import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost: ${PORT}`);
});
