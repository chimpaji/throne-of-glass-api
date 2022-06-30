import { PrismaClient } from '@prisma/client';

import express, { Request, Response } from 'express';
import { request } from 'http';

const prisma = new PrismaClient();
const app = express();

const port = process.env.PORT || 3000;

//api/characters

//api/:id

app.get('/api/characters', async (req: Request, res: Response) => {
  const characters = await prisma.character.findMany({});

  res.status(200).send({ message: 'success', data: characters });
});

app.get('/api/:id', async (req: Request, res: Response) => {
  if (!req.params.id) return res.status(400).json({ message: 'Bad request' });
  const character = await prisma.character.findFirst({
    where: { id: Number(req.params.id) },
  });
  if (!character)
    return res.status(404).json({ message: 'character not found' });
  res.status(200).json({ message: 'success', data: character });
});

app.listen(port, () => {
  console.log('listening on port ' + port);
});
