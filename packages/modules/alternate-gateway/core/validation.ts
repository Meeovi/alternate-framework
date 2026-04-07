import { ValidationError } from './errors'

export type Validator<T> = (value: unknown) => T

export type FieldDescriptor<T> = {
	validator: Validator<T>
	optional?: boolean
}

export type Schema<T> = {
	[K in keyof T]: Validator<T[K]> | FieldDescriptor<T[K]>
}

function runValidator<T>(key: string, validator: Validator<T>, value: unknown) {
	try {
		return validator(value)
	} catch (err) {
		if (err instanceof ValidationError) {
			err.path.unshift(key)
			throw err
		}
		throw new ValidationError(String(err instanceof Error ? err.message : err), [key])
	}
}

export function validate<T extends object>(schema: Schema<T>, input: unknown): T {
	const obj = input as Record<string, unknown> | undefined
	if (!obj || typeof obj !== 'object') {
		throw new ValidationError('Expected object as input')
	}

	const out = {} as T
	for (const k in schema) {
		const desc = schema[k] as any
		const optional = desc && typeof desc === 'object' && 'validator' in desc ? !!desc.optional : false
		const validator: Validator<any> = desc && typeof desc === 'object' && 'validator' in desc ? desc.validator : desc as Validator<any>

		const val = (obj as any)[k]
		if (val === undefined || val === null) {
			if (optional) {
				;(out as any)[k] = undefined
				continue
			}
			throw new ValidationError(`Missing required field '${k}'`, [k])
		}

		;(out as any)[k] = runValidator(k, validator, val)
	}

	return out
}

// Primitive validators
export const validators = {
	string: (v: unknown) => {
		if (typeof v !== 'string') throw new ValidationError('Expected string')
		return v
	},
	number: (v: unknown) => {
		if (typeof v !== 'number') throw new ValidationError('Expected number')
		return v
	},
	boolean: (v: unknown) => {
		if (typeof v !== 'boolean') throw new ValidationError('Expected boolean')
		return v
	},
	dateString: (v: unknown) => {
		if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) throw new ValidationError('Expected ISO date string')
		return v
	},
	json: (v: unknown) => v as unknown,
	array: <T>(itemValidator: Validator<T>) => (v: unknown) => {
		if (!Array.isArray(v)) throw new ValidationError('Expected array')
		return v.map((item, i) => {
			try {
				return itemValidator(item)
			} catch (err) {
				if (err instanceof ValidationError) {
					err.path.unshift(String(i))
					throw err
				}
				throw new ValidationError(String(err instanceof Error ? err.message : err), [String(i)])
			}
		})
	}
}

export const optional = <T>(validator: Validator<T>): FieldDescriptor<T | undefined> => ({ validator, optional: true })

