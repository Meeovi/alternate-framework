export const useTasks = () => {
  const { createList, addToList, getUserLists, updateListItem } = useLists()

  const createTaskList = async (name, description = '') => {
    return await createList({
      name,
      description,
      type: 'tasks',
      visibility: 'private'
    })
  }

  const addTask = async (listId, taskData) => {
    const { title, description, priority, due_date, labels } = taskData
    
    return await addToList(listId, {
      type: 'task',
      title,
      description,
      priority: priority || 'medium',
      due_date,
      labels: labels || [],
      completed: false,
      date_created: new Date().toISOString(),
      subtasks: []
    })
  }

  const completeTask = async (itemId) => {
    return await updateListItem(itemId, {
      'content.completed': true,
      'content.date_completed': new Date().toISOString()
    })
  }

  const uncompleteTask = async (itemId) => {
    return await updateListItem(itemId, {
      'content.completed': false,
      'content.date_completed': null
    })
  }

  const updateTaskPriority = async (itemId, priority) => {
    return await updateListItem(itemId, {
      'content.priority': priority
    })
  }

  const updateTaskDueDate = async (itemId, dueDate) => {
    return await updateListItem(itemId, {
      'content.due_date': dueDate
    })
  }

  const addSubtask = async (itemId, subtaskTitle) => {
    const { getListById } = useLists()
    const item = await getListById(itemId)
    const subtasks = item.content.subtasks || []
    
    subtasks.push({
      id: Date.now(),
      title: subtaskTitle,
      completed: false,
      date_created: new Date().toISOString()
    })

    return await updateListItem(itemId, {
      'content.subtasks': subtasks
    })
  }

  const getUserTaskLists = async () => {
    return await getUserLists('tasks')
  }

  return {
    createTaskList,
    addTask,
    completeTask,
    uncompleteTask,
    updateTaskPriority,
    updateTaskDueDate,
    addSubtask,
    getUserTaskLists
  }
}