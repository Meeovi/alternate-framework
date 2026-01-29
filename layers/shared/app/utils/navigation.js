export function getNavItemUrl(item) {
    if (item.type === 'page' && item.page) {
        return item.page?.permalink ?? null;
    }
    else if (item.type === 'url' && item.url) {
        return item.url;
    }
    return null;
}
