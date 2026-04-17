export enum FieldDateType {
	DATE = 'date',
	DATETIME = 'datetime',
	TIME = 'time',
}

export const DATE_FIELDS_COUNT = 3

export enum TimeFormat {
	H12 = '12',
	H24 = '24',
}

export const FIELD_DATE_DEFAULT = FieldDateType.DATE

export default FIELD_DATE_DEFAULT
