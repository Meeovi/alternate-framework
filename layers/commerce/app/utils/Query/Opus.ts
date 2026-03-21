export interface GraphQlResponse {
    data: Record<string, unknown>;
    errors?: unknown;
}

type FieldArgument<T = unknown> = {
    name: string;
    type: string;
    value: T;
};

export class AbstractField<
    Name extends string = string,
    Value = unknown,
    IsNullable extends boolean = boolean,
> {
    name: string;

    alias = '';

    children: Array<AbstractField<string, unknown, boolean>> = [];

    args: Array<FieldArgument<unknown>> = [];

    // Keep constructor signature compatible with existing call sites.
    constructor(name: string, _isNullable?: boolean) {
        this.name = name;
    }

    addField(field: string | AbstractField<string, unknown, boolean>): this {
        if (typeof field === 'string') {
            this.children.push(new Field(field));
        } else {
            this.children.push(field);
        }

        return this;
    }

    addFieldList(fields: Array<string | AbstractField<string, unknown, boolean>>): this {
        fields.forEach((field) => this.addField(field));

        return this;
    }

    addArgument<T>(name: string, type: string, value: T): this {
        this.args.push({ name, type, value });

        return this;
    }

    setAlias(alias: string): this {
        this.alias = `${alias}:`;

        return this;
    }
}

export class Field<
    Name extends string = string,
    Value = unknown,
    IsNullable extends boolean = boolean,
> extends AbstractField<Name, Value, IsNullable> {}

export class Query<
    Name extends string = string,
    Value = unknown,
    IsNullable extends boolean = boolean,
> extends AbstractField<Name, Value, IsNullable> {}

export class Mutation<
    Name extends string = string,
    Value = unknown,
    IsNullable extends boolean = boolean,
> extends AbstractField<Name, Value, IsNullable> {}

export class InlineFragment<
    Name extends string = string,
    Value = unknown,
    IsNullable extends boolean = boolean,
> extends AbstractField<Name, Value, IsNullable> {
    constructor(name: Name) {
        super(`... on ${name}`);
    }
}

export class Argument<T = unknown> {
    name: string;

    type: string;

    value: T;

    constructor(name: string, type: string, value: T) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
}
