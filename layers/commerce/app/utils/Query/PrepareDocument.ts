/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework
 * @link https://github.com/meeovi/mframework
 */

import { AbstractField, Mutation, Query } from '@tilework/opus';

import type { QueryObject, QueryVariables } from '../../utils/Request/Request';

import { FieldType } from './Query.type';

/**
 * Prepare request body string from query list (all entries must be instances of Query).
 * @param  {Array<Field>} queries
 * @return {String} JSON String, format: `{"query":"{alias: queryName (attr:key) { field1, field2 }}"}`
 * @namespace ../../utils/../../normalizers/PrepareDocument/prepareFieldString */
export const prepareFieldString = <T>(
    rootField: AbstractField<string, T, boolean> | string,
    accArgs: Record<string, Array<[string, unknown]>> = {},
): string => {
    // If the field is a plain string, return it directly.
    if (typeof rootField === 'string') return rootField;

    const {
        alias, name, args, children,
    } = rootField;

    const resolvedArgs = (args || []).reduce((
        acc: string[],
        arg: {
            name: string;
            type: string;
            value: unknown;
        },
    ): string[] => {
        if (!accArgs[arg.name]) {
            // eslint-disable-next-line no-param-reassign
            accArgs[arg.name] = [];
        }

        const index = accArgs[arg.name]!.push([arg.type, arg.value]);

        return [...acc, `${arg.name}:$${arg.name}_${index}`];
    }, [] as string[]);

    const formattedArgs = resolvedArgs.length ? `(${resolvedArgs.join(',')})` : '';

    const formattedChildren = (children || []).map((field) => prepareFieldString(field, accArgs)).join(',');

    const body = (children && children.length) ? `{${formattedChildren}}` : '';

    return `${alias || ''}${name}${formattedArgs}${body}`;
};

/** @namespace ../../utils/../../normalizers/PrepareDocument/prepareRequest */
export const prepareRequest = <T>(fields: AbstractField<string, T, boolean>[], type: FieldType): QueryObject => {
    const fieldsArray = Array.isArray(fields) ? fields : [fields];

    if (type !== FieldType.MUTATION && type !== FieldType.QUERY) {
        // we only support Mutation and Query types
        throw new Error(`GraphQL document type "${type}" is not supported.`);
    }

    const variables: QueryVariables = {};
    const accArgs = {};

    // prepare fields from each field passed
    const fieldStrings = fieldsArray.map((field) => prepareFieldString(field, accArgs)).join(',');

    // go through argument accumulator collected in "prepareFieldString", join values
    // into the format "$var:Type" and append variable value to variables field
    const resolvedArgs = Object.entries(accArgs).reduce((acc, [name, dataArray]): string[] => {
        (dataArray as Array<string[]>).forEach(([type, value], i: number) => {
            const variable = `${name}_${i + 1}`;

            acc.push(`$${variable}:${type}`);
            variables[variable] = typeof value === 'string' ? value : String(value);
        });

        return acc;
    }, [] as string[]);

    // Wrap arguments with "()" and join using ","
    const formattedArgs = resolvedArgs.length ? `(${resolvedArgs.join(',')})` : '';

    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(
            '%cGraphQL Request',
            'background-color: #ff00ff; color: #ffffff; font-weight: bold; border-radius: 5px; padding: 2px 5px',
            {
                query: `${type}${formattedArgs}{${fieldStrings}}`,
                variables,
            },
        );
    }

    return {
        // format like "query($var_1:String){test(arg: $var_1){id}}"
        query: `${type}${formattedArgs}{${fieldStrings}}`,
        variables,
    };
};

/** @namespace ../../utils/../../normalizers/PrepareDocument/prepareMutation */
export const prepareMutation = <T>(
    mutations: Mutation<string, T, boolean>[],
): QueryObject => prepareRequest(mutations, FieldType.MUTATION);

/** @namespace ../../utils/../../normalizers/PrepareDocument/prepareQuery */
export const prepareQuery = <T>(
    queries: Query<string, T, boolean>[],
): QueryObject => prepareRequest(queries, FieldType.QUERY);
