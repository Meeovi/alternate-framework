import type { Maybe } from '../models/shared';
import { H3Error } from 'h3';

export type ErrorParams = Maybe<
  Partial<H3Error> & {
    status?: number;
    statusText?: string;
  }
>;

export type UseHandleError = (error?: unknown) => void;
