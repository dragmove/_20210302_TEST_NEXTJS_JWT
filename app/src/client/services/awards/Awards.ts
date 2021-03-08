import { Award } from '@shared/interfaces/common';
import axios, { AxiosResponse } from 'axios';

class Awards {
  constructor() {}

  public async getAwards(): Promise<AxiosResponse<Award[]> | never> {
    let data: AxiosResponse<Award[]>;

    try {
      // Request Config: https://github.com/axios/axios#request-config
      data = await axios({
        url: 'https://dragmove.github.io/dragmove.com/data/awards.json',
        method: 'get',
      });
    } catch (err) {
      throw err;
    }

    return data;
  }
}

export const awards = new Awards();
