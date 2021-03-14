import { Career, ApiResult } from '@shared/interfaces/common';
import axios, { AxiosResponse } from 'axios';
import { parseCookies } from 'nookies';

class CareersService {
  constructor() {}

  public async get(config = null): Promise<ApiResult<Career[]> | never> {
    let result: AxiosResponse<ApiResult<Career[]>>;

    const cookies = parseCookies();
    console.log('cookies :', cookies);

    try {
      result = await axios({
        // TODO: Set domain
        url: 'http://localhost:9001/api/careers',
        method: 'get',
        headers: {
          Authorization: cookies?.jwtAccessToken ? `Bearer ${cookies?.jwtAccessToken}` : '',
        },
      });
    } catch (err) {
      throw err;
    }

    return result?.data;
  }
}

export const careersService = new CareersService();
