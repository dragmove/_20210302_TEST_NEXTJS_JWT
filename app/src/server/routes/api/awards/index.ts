import axios, { AxiosResponse } from 'axios';
import { Router } from 'express';
import { Award } from '@shared/interfaces/common';

const router = Router();

router.get(`/awards`, async (req, res) => {
  // TODO: call external API using axios on server side
  let result: AxiosResponse<Award[]>; // { status, statusText, headers, config, request, data }

  try {
    result = await axios({
      url: 'https://dragmove.github.io/dragmove.com/data/awards.json',
      method: 'get',
    });
  } catch (e) {
    console.log('// server router 에서 받은 error :', e);

    res.status(500).json({
      message: 'Failed to get awards',
    });
  }

  res.status(200).json({
    data: result.data,
  });
});

export default router;
