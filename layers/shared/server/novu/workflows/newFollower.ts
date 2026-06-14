import { workflow } from '@novu/framework'

export const newFollowerWorkflow = workflow(
  'new-follower',
  async ({ step, payload }) => {
    await step.inApp('in-app-notification', async () => ({
      subject: 'New follower',
      body: `${payload.name} started following you`
    }))
  }
)