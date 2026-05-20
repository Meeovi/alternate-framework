export interface DirectusField {
    collection: string;
    field: string;
    type: string;
    interface ? : string;
    options ? : Record < string,
    any > ;
    required ? : boolean;
    readonly ? : boolean;
    hidden ? : boolean;
    sort ? : number;
    special ? : string[];
    validation ? : Record < string,
    any > ;
    validation_message ? : string;
}

export interface DirectusRelation {
    collection: string;
    field: string;
    related_collection: string | null;
    meta ? : Record < string,
    any > ;
}

export interface DirectusCollection {
    collection: string;
    meta ? : Record < string,
    any > ;
    schema ? : Record < string,
    any > ;
}

export interface DirectusSchema {
    directus_collections: DirectusCollection[];
    directus_relations: DirectusRelation[];
    directus_fields: DirectusField[];
    collections: DirectusCollection[];
    fields: DirectusField[];
    relations: DirectusRelation[];
}

export interface GeneratedFieldSchema {
    key: string;
    type: string;
    widget: string;
    required: boolean;
    readonly: boolean;
    hidden: boolean;
    options ? : Record < string,
    any > ;
    validation ? : Record < string,
    any > ;
}

export interface GeneratedCollectionSchema {
    collection: string;
    fields: GeneratedFieldSchema[];
}