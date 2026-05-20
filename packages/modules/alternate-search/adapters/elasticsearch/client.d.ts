export type ElasticsearchClient = {
    createIndex(indexName: string, body: Record<string, unknown>): Promise<void>;
    bulk(operations: unknown[]): Promise<void>;
    search(indexName: string, body: Record<string, unknown>): Promise<{
        hits: {
            total: number | {
                value: number;
            };
            hits: Array<{
                _id: string;
                _source: Record<string, unknown>;
                highlight?: Record<string, string[]>;
            }>;
        };
        aggregations?: Record<string, unknown>;
        took?: number;
    }>;
    delete(indexName: string, id: string): Promise<void>;
    deleteByQuery(indexName: string, query: Record<string, unknown>): Promise<{
        deleted?: number;
    }>;
    count(indexName: string): Promise<number>;
};
export type ElasticsearchMapping = {
    properties: Record<string, {
        type: string;
        analyzer?: string;
        dims?: number;
        similarity?: string;
        index?: boolean;
        fields?: Record<string, {
            type: string;
        }>;
    }>;
};
type AuthConfig = {
    username?: string;
    password?: string;
    apiKey?: string;
};
export declare function createElasticsearchClient(baseUrl: string, auth?: AuthConfig): ElasticsearchClient;
export {};
