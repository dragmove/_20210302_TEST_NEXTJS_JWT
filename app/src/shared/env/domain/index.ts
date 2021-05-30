import { Environment } from './types';
import { PhaseType } from '@enums/env';
import ENV_DEV from './dev';
import ENV_REAL from './real';

function initialEnvSet(env: string): Environment {
  switch (env) {
    case PhaseType.DEV:
      return ENV_DEV;

    case PhaseType.REAL:
      return ENV_REAL;

    default:
      return ENV_REAL;
  }
}

const ENV: Environment = initialEnvSet(process.env.PHASE);
export default ENV;
