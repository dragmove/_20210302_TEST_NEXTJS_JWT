import { useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import { MobXProviderContext } from 'mobx-react';
import { PHASE } from '@client/constants/env';

class EnvStore {
  phase: string = PHASE;

  constructor() {
    makeAutoObservable(this);
  }
}

export const stores = {
  envStore: new EnvStore(),
};

export function useStores() {
  return useContext(MobXProviderContext);
}
