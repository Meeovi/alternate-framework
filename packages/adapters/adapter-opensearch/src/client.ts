// Create a client
import { Client } from "@opensearch-project/opensearch";

const host = process.env.OPENSEARCH_HOST || "localhost";
const protocol = process.env.OPENSEARCH_PROTOCOL || "http";
const port = process.env.OPENSEARCH_PORT || 9200;
const auth = process.env.OPENSEARCH_AUTH || "admin:<custom-admin-password>";

export const client = new Client({
    ssl: {
        rejectUnauthorized: false,
    },
    node: protocol + "://" + host + ":" + port,
    auth: {
        username: process.env.OPENSEARCH_USERNAME || 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'admin',
    },
    memoryCircuitBreaker: {
        enabled: true,
        maxPercentage: 0.8,
    },
});

export default client;