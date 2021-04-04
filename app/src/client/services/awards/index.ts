import { Award, ApiResult } from '@shared/interfaces/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import nookies, { parseCookies } from 'nookies';

const SERVER_DOMAIN: string = 'http://localhost:9001';
const PATH_API: string = '/api/awards';

class AwardsService {
  constructor() {}

  public async get(config = null): Promise<ApiResult<Award[]> | never> {
    const cookies = parseCookies();
    console.log('cookies :', cookies);

    let result: AxiosResponse<ApiResult<Award[]>>;

    let options: AxiosRequestConfig = {
      url: `${config.isServer ? SERVER_DOMAIN : ''}${PATH_API}`,
      method: 'get',
      headers: {
        // when this method is called, we need to add 'Authorization' header
        Authorization: cookies?.jwtAccessToken ? `Bearer ${cookies?.jwtAccessToken + 'qwert'}` : '',
      },
    };

    try {
      result = await axios(options);
    } catch (e) {
      throw e;
    }

    return result?.data;
  }
}

export const awardsService = new AwardsService();
