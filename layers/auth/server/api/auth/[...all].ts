import { defineEventHandler, toWebRequest } from 'h3';
import { auth } from '../../../lib/auth';

export default defineEventHandler((event) => {
  return (auth as any).handler?.(toWebRequest(event));
});