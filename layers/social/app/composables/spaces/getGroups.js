export const getGroups = async () => {
  try {
    const groups = await $fetch('/api/groups')
    return groups
  } catch (error) {
    console.error('Error fetching groups:', error)
    return []
  }
};

export const getGroupById = async (id) => {
  try {
    const group = await $fetch(`/api/groups/${id}`)
    return group
  } catch (error) {
    console.error('Error fetching group:', error)
    return []
  }
};
