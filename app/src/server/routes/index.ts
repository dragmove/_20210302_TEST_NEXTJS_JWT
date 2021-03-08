import { Router } from 'express';
import ProfileRoutes from './profile';

export default function getRoutes() {
  const router = Router();

  // TODO: Arrange
  router.use('/profile', ProfileRoutes());

  return router;
}
