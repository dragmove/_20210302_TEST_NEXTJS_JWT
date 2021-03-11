import { Router } from 'express';
import ProfileRoutes from './profile';
import AwardsRoutes from './awards';
import CareersRoutes from './careers';

export default function getRoutes() {
  const router = Router();

  // TODO: Arrange
  router.use('/awards', AwardsRoutes());
  router.use('/careers', CareersRoutes());
  router.use('/profile', ProfileRoutes());

  return router;
}
