import { AxiosResponse } from 'axios';

export interface Award {
  id: number;
  award: string;
  year: number;
  prize: string;
  name: string;
}

export interface Career {
  id: number;
  company: string;
  company_eng: number;
  date: string;
  position: string;
}

export interface ApiResult<T> {
  status: number;
  data: T;
}

export interface Member {
  id: string;
  password?: string;
}
