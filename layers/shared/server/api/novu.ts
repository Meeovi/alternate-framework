import { serve } from "@novu/framework/nuxt";
import { client, emailWorkflow } from "../novu/workflows";
import { newFollowerWorkflow } from '../novu/workflows/newFollower'

export default defineEventHandler(serve({ client, workflows: [emailWorkflow, newFollowerWorkflow] }));