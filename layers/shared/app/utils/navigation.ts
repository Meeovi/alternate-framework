import type { NavigationItem, Page } from '../types/navigation';

export function getNavItemUrl(item: NavigationItem): string | null {
	if (item.type === 'page' && (item.page as Page)) {
		return (item.page as Page)?.permalink ?? null
	} else if (item.type === 'url' && item.url) {
		return item.url as string
	}
  
	return null
}
