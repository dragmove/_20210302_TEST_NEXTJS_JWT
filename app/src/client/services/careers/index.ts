import { Career, ApiResult } from '@shared/interfaces/common';
import axios, { AxiosResponse } from 'axios';

class CareersService {
  constructor() {}

  public async get(): Promise<ApiResult<Career[]> | never> {
    let result: AxiosResponse<ApiResult<Career[]>>;

    try {
      result = await axios({
        // TODO: Set domain
        url: 'http://localhost:9001/api/careers',
        method: 'get',
      });
    } catch (err) {
      throw err;
    }

    return result?.data;
  }
}

export const careersService = new CareersService();
