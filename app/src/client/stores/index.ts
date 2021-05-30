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

class MemberStore {
  id: string;

  constructor() {
    makeAutoObservable(this);
  }

  set(member): void {
    this.id = member.id;
  }

  get member() {
    return {
      id: this.id,
    };
  }
}

export const stores = {
  envStore: new EnvStore(),
  memberStore: new MemberStore(),
};

export function useStores() {
  return useContext(MobXProviderContext);
}
