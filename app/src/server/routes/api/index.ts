import { Router } from 'express';
import ProfileRouter from './profile';
import AwardsRouter from './awards';
import CareersRouter from './careers';
import { SERVICE_PATH } from '../../../shared/constants/common';

const apiRouter: Router = Router();

apiRouter.use(`${SERVICE_PATH}/api`, ProfileRouter, AwardsRouter, CareersRouter);

export default apiRouter;
