import { Award, ApiResult } from '@shared/interfaces/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { authAxios } from '../interceptors';
import nookies, { parseCookies } from 'nookies';
import { SERVER_DOMAIN } from '@shared/constants/common';

const PATH_API: string = '/api/awards';
class AwardsService {
  constructor() {}

  public async get(config = null): Promise<ApiResult<Award[]> | never> {
    console.log('[client.services.awards.get] config :', config);
    let result: AxiosResponse<ApiResult<Award[]>>;

    // Authorization: Bearer ${access token} 설정이 없더라도, cookie 를 통해 access token 전달
    let requestConfig: AxiosRequestConfig = {
      url: `${SERVER_DOMAIN}${PATH_API}`,
      method: 'get',
      ...config,
    };

    try {
      result = await authAxios(requestConfig);
    } catch (err) {
      console.error(err);
      throw err;
    }

    console.log('result :', result);

    return result?.data;

    /*
    FIXME: ing. 이제 여기부터 할 차례.
    client 측에서는 token 에 access 할 수가 없기 때문에,
    Authorization 헤더에 access token 을 담을 수가 없다.
    /*
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
    */
  }
}

export const awardsService = new AwardsService();
