import { Router } from 'express';

const router = Router();

router.get(`/profile`, (req, res) => {
  // TODO: connect with service calls API
  res.json({
    name: 'foo',
  });
});

export default router;
