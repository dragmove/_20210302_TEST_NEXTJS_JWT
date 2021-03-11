import { Router } from 'express';

export default function ProfileRoutes() {
  const router = Router();

  router.get(`/name`, (req, res) => {
    // TODO: connect with service calls API
    res.json({
      name: 'foo',
    });
  });

  return router;
}
