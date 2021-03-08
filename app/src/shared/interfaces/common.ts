import { AxiosResponse } from 'axios';

export interface AxiosRes<T> extends AxiosResponse {
  data: T;
}

export interface Award {
  id: number;
  award: string;
  year: number;
  prize: string;
  name: string;
}
