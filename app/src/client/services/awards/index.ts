import { Award, ApiResult } from '@shared/interfaces/common';
import axios, { AxiosResponse } from 'axios';

class AwardsService {
  constructor() {}

  public async get(): Promise<ApiResult<Award[]> | never> {
    let result: AxiosResponse<ApiResult<Award[]>>;

    try {
      result = await axios({
        // TODO: Set domain
        url: 'http://localhost:9001/api/awards',
        method: 'get',
      });
    } catch (err) {
      throw err;
    }

    return result?.data;
  }
}

export const awardsService = new AwardsService();
