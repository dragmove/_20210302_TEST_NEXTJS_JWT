import { Award } from '@shared/interfaces/common';
import axios, { AxiosResponse } from 'axios';

class Profile {
  constructor() {}

  public async getName(): Promise<AxiosResponse<Award[]> | never> {
    let data: AxiosResponse<Award[]>;

    try {
      data = await axios({
        // TODO: Set domain
        url: 'http://localhost:9001/api/profile/name',
        method: 'get',
      });
    } catch (err) {
      throw err;
    }

    return data;
  }
}

export const profile = new Profile();
