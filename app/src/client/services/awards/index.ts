import { Award, ApiResult } from '@shared/interfaces/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const SERVER_DOMAIN: string = 'http://localhost:9001';
const PATH_API: string = '/api/awards';

class AwardsService {
  constructor() {}

  public async get(config = null): Promise<ApiResult<Award[]> | never> {
    let result: AxiosResponse<ApiResult<Award[]>>;

    const url = `${config.isServer ? SERVER_DOMAIN : ''}${PATH_API}`;

    let options: AxiosRequestConfig = {
      url,
      method: 'get',
      // when this method is called, we need to add headers: { Authorization: cookies?.jwtAccessToken ? `Bearer ${cookies?.jwtAccessToken}` : '', }
    };
    if (config) {
      options = { ...options, headers: config.headers };
    }

    try {
      result = await axios(options);
    } catch (err) {
      // console.error('[AwardsService.get]', err);
      throw err;
    }

    return result?.data;
  }
}

export const awardsService = new AwardsService();
