export type ForgeFedActivity = {
	type: string
	actor: string
	object: Record<string, unknown>
}

export function createForgeFedIssueCreateActivity(input: {
	actor: string
	repository: string
	title: string
	body?: string
}): ForgeFedActivity {
	return {
		type: 'Create',
		actor: input.actor,
		object: {
			type: 'Ticket',
			repository: input.repository,
			title: input.title,
			content: input.body ?? '',
		},
	}
}
