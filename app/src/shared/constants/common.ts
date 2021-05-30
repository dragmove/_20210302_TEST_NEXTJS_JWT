export const SERVER_PORT: number | string = parseInt(process.env.PORT) || 9001;
export const SERVER_DOMAIN: string = process && process['browser'] ? '' : `http://localhost:${SERVER_PORT}`;

export const SERVICE_PATH: string = '';

export const COOKIE_PATH: string = SERVICE_PATH || '/';
// export const LOGIN_ATTEMPT_COOKIE_NAME: string = 'loginAttempt';
// export const LOGIN_ATTEMPT_STATUS = { FAIL_OAUTH_GOOGLE: 'FAIL_OAUTH_GOOGLE };
export const LOGIN_ROUTE: string = `${SERVICE_PATH}/login`;
