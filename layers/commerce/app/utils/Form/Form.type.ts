/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework-theme
 * @link https://github.com/meeovi/mframework
 */

import { FieldDateType } from 'Component/FieldDate/FieldDate.config';

export interface YearRangeAttribute {
    minYear: number;
    maxYear: number;
}

export interface DateRangeAttribute {
    minDate: Date;
    maxDate: Date;
}

export interface DateMap {
    d: string;
    m: string;
    y: string;
}

export interface DatesData {
    type: FieldDateType;
    year?: string;
    month?: string;
    day?: string;
    hours?: string;
    minutes?: string;
    ampm?: string;
    name: string;
}

export interface DateObject {
    name: string;
    type: FieldDateType;
    value: string;
}

export interface FieldData<T = FieldValue> {
    field?: HTMLInputElement;
    name: string;
    type: string;
    value: T;
}

export type GetFieldsData<AsObject extends boolean = false> = AsObject extends true
    ? Record<string, DateObject | FieldData>
    : Array<DateObject | FieldData>;

export type FieldValue<
    T = unknown, isUnknownValue = true,
> = isUnknownValue extends true ? string | number | boolean | undefined | Date : T;
