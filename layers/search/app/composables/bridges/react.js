import { useState, useCallback } from 'react';
import { useAlternateContext } from '@meeovi/core';
export function useReactSearch() {
    const ctx = useAlternateContext();
    const manager = ctx.searchManager;
    const [query, setQuery] = useState(manager.context.state.query);
    const [page, setPage] = useState(manager.context.state.page);
    const [pageSize, setPageSize] = useState(manager.context.state.pageSize);
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const search = useCallback(async () => {
        setLoading(true);
        manager.context.setQuery(query);
        manager.context.setPage(page);
        manager.context.setPageSize(pageSize);
        const res = await manager.search();
        setResults(res.items);
        setTotal(res.total);
        setLoading(false);
    }, [query, page, pageSize, manager]);
    return {
        query,
        setQuery,
        page,
        setPage,
        pageSize,
        setPageSize,
        results,
        total,
        loading,
        search
    };
}
