import { NextApiResponse } from 'next';
import { apiURL } from '../../utils/constants/constants';

export function applyCors(res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', apiURL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
}
