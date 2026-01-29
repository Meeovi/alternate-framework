export function useAdminTable(refName = 'table') {
    const adminTableRef = useTemplateRef(refName);
    const refresh = () => {
        adminTableRef.value?.fetchTableData();
    };
    return {
        refresh
    };
}
