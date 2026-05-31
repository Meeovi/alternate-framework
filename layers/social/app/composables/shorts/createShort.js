// composables/cms/shorts/createSpace.js
import useContent from '#shared/app/composables/content/useContent'

export default async function createSpace(shortData) {
    const { createItem } = useContent()
    
    try {
        const short = await createItem('shorts', {
            name: shortData.name,
            description: shortData.description,
            status: shortData.status,
            type: shortData.type,
            video: shortData.video,
            video_url: shortData.video_url,
            age_restriction: shortData.age_restriction,
            duration: shortData.duration,
            thumbnailFile: shortData.thumbnailFile,
            videoFile: shortData.videoFile,
            creator: shortData.creator,
            departments: { create: [{ departments_id: shortData.departments }] }
        })
        
        return short;
    } catch (error) {
        console.error('Error creating short:', error);
        throw error;
    }
}