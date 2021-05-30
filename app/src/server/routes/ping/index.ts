import { Request, Response, Router } from 'express';

const ping: Router = Router();

ping.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'ok' });
});

export default ping;
