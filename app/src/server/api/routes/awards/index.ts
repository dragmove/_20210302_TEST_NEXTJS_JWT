import axios, { AxiosResponse } from 'axios';
import { Router } from 'express';
import { Award } from '@shared/interfaces/common';

export default function AwardsRoutes() {
  const router = Router();

  router.get(`/`, async (req, res) => {
    // TODO: call external API using axios on server side
    let callApiResult: AxiosResponse<Award[]>; // { status, statusText, headers, config, request, data }

    try {
      callApiResult = await axios({
        url: 'https://dragmove.github.io/dragmove.com/data/awards.json',
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

  return router;
}
