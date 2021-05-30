import axios, { AxiosResponse } from 'axios';
import { Router } from 'express';
import { Career } from '@shared/interfaces/common';

const router = Router();

router.get(`/careers`, async (req, res) => {
  // TODO: call external API using axios on server side
  let callApiResult: AxiosResponse<Career[]>; // { status, statusText, headers, config, request, data }

  try {
    callApiResult = await axios({
      url: 'https://dragmove.github.io/dragmove.com/data/careers.json',
      method: 'get',
    });
  } catch (err) {
    throw err;
  }

  res.json({
    status: callApiResult.status,
    data: callApiResult.data,
  });
});

export default router;
