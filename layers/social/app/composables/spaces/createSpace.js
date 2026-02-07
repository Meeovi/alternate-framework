// composables/cms/spaces/createSpace.js
import useAdapterRequest from '~/composables/useAdapterRequest'

export default async function createSpace(spaceData) {
    const { createItem } = useAdapterRequest()

    try {
        const space = await createItem('spaces', {
            name: spaceData.name,
            description: spaceData.description,
            status: spaceData.status,
            type: spaceData.type,
            coverFile: spaceData.coverFile,
            avatarFile: spaceData.avatarFile,
            creator: spaceData.creator,
            departments: { create: [{ departments_id: spaceData.departments }] }
        })
        return space;
    } catch (error) {
        console.error('Error creating space:', error);
        throw error;
    }
}
