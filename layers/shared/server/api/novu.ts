import { defineEventHandler } from 'h3';
import { testWorkflow } from '../novu/workflows';
import { serve } from '@novu/framework/nuxt';

export default defineEventHandler(serve({ workflows: [testWorkflow] }));