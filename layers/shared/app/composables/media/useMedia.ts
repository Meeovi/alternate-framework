import { computed, getCurrentInstance } from 'vue'

export default function useMedia() {
	// Try to access the media prop from the current component instance
	const instance = getCurrentInstance()
	const media = instance?.props?.media

	// Compute the file URL from the media object
	const fileUrl = computed(() => {
		if (!media) return ''
		// Try common fields for file URL
		return (
			media.url ||
			media.fileUrl ||
			media.path ||
			media.src ||
			''
		)
	})

	return { fileUrl }
}
