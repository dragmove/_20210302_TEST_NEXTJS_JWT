import { Environment } from './types';
import { SERVER_PORT } from '../../constants/common';

const ENV_DEV: Environment = {
  NAME: 'dev',
  SERVER_DOMAIN: `http://localhost:${SERVER_PORT}`,
};

export default ENV_DEV;
