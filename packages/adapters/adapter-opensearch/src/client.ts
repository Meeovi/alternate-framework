// Create a client
import { Client } from "@opensearch-project/opensearch";

const host = process.env.ALTERNATE_SEARCH_HOST || "localhost";
const protocol = process.env.ALTERNATE_SEARCH_PROTOCOL || "http";
const port = process.env.ALTERNATE_SEARCH_PORT || 9200;

export const client = new Client({
    ssl: {
        rejectUnauthorized: false,
    },
    node: protocol + "://" + host + ":" + port,
    auth: {
        username: process.env.ALTERNATE_SEARCH_USERNAME || 'admin',
        password: process.env.ALTERNATE_SEARCH_PASSWORD || 'admin',
    },
    memoryCircuitBreaker: {
        enabled: true,
        maxPercentage: 0.8,
    },
});

export default client;