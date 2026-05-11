export class ValidationError extends Error {
	path: string[]
	code?: string

	constructor(message: string, path: string[] = [], code?: string) {
		super(message)
		this.name = 'ValidationError'
		this.path = path
		this.code = code
	}

	toString() {
		if (this.path && this.path.length) {
			return `${this.name} [${this.path.join('.')}]: ${this.message}`
		}
		return `${this.name}: ${this.message}`
	}
}

export const isValidationError = (v: unknown): v is ValidationError =>
	v instanceof ValidationError
