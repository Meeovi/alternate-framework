import type { Category } from '../../types/ui'

interface CategoryWithImage extends Category {
  image: string
}

export type CategoryCardProps = {
  items: CategoryWithImage[]
}
