
import { defineStore } from 'pinia'
import initialTasks from '../data/tasks'
import { useProjectsStore } from './projects'

const allowedStatuses = ['todo', 'progress', 'done']
const allowedPriorities = ['low', 'medium', 'high']

function normalizeValues(values, projects) {
  const requestedProject = String(values.projectId ?? 'general')

  const projectId = projects.some(
    (project) => project.id === requestedProject
  )
    ? requestedProject
    : 'general'

  return {
    title: String(values.title ?? '').trim(),
    description: String(values.description ?? '').trim(),

    status: allowedStatuses.includes(values.status)
      ? values.status
      : 'todo',

    priority: allowedPriorities.includes(values.priority)
      ? values.priority
      : 'medium',

    dueDate: String(values.dueDate ?? ''),
    projectId,
  }
}

function isValidTask(values) {
  return (
    values.title.length >= 3 &&
    values.title.length <= 80 &&
    values.description.length <= 500 &&
    (!values.dueDate ||
      /^\d{4}-\d{2}-\d{2}$/.test(values.dueDate))
  )
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: initialTasks.map((task) => ({
      ...task,
      projectId: task.projectId ?? 'general',
    })),

    searchText: '',
    selectedStatus: 'all',
    selectedPriority: 'all',
    selectedProject: 'all',
    sortOrder: 'newest',

    // Додаткове завдання 5
    onlyNoDueDate: false,

    // Зберігаємо функцію попередньої роботи
    onlyUnfinished: false,
  }),

  getters: {
    totalTasks: (state) => state.tasks.length,

    completedTasks: (state) =>
      state.tasks.filter(
        (task) => task.status === 'done'
      ).length,

    progressTasks: (state) =>
      state.tasks.filter(
        (task) => task.status === 'progress'
      ).length,

    completedPercent() {
      if (this.totalTasks === 0) return 0

      return Math.round(
        (this.completedTasks / this.totalTasks) * 100
      )
    },

    activeTasks: (state) => {
      const rank = { high: 3, medium: 2, low: 1 }

      return state.tasks
        .filter((task) => task.status !== 'done')
        .sort(
          (a, b) =>
            rank[b.priority] - rank[a.priority] ||
            b.id - a.id
        )
        .slice(0, 3)
    },

    visibleTasks: (state) => {
      const term = state.searchText
        .trim()
        .toLocaleLowerCase('uk-UA')

      const rank = { high: 3, medium: 2, low: 1 }

      const statusRank = {
        progress: 0,
        todo: 1,
        done: 2,
      }

      const filtered = state.tasks.filter((task) => {
        const text =
          `${task.title} ${task.description ?? ''}`
            .toLocaleLowerCase('uk-UA')

        const matchesText =
          !term || text.includes(term)

        const matchesStatus =
          state.selectedStatus === 'all' ||
          task.status === state.selectedStatus

        const matchesPriority =
          state.selectedPriority === 'all' ||
          task.priority === state.selectedPriority

        const matchesProject =
          state.selectedProject === 'all' ||
          task.projectId === state.selectedProject

        const matchesUnfinished =
          !state.onlyUnfinished ||
          task.status !== 'done'

        const matchesNoDueDate =
          !state.onlyNoDueDate ||
          !task.dueDate

        return (
          matchesText &&
          matchesStatus &&
          matchesPriority &&
          matchesProject &&
          matchesUnfinished &&
          matchesNoDueDate
        )
      })

      return filtered.sort((a, b) => {
        if (state.sortOrder === 'title') {
          return (
            a.title.localeCompare(b.title, 'uk-UA') ||
            a.id - b.id
          )
        }

        if (state.sortOrder === 'priority') {
          return (
            rank[b.priority] - rank[a.priority] ||
            b.id - a.id
          )
        }

        if (state.sortOrder === 'status') {
          return (
            statusRank[a.status] -
            statusRank[b.status] ||
            b.id - a.id
          )
        }

        if (state.sortOrder === 'dueDate') {
          return (
            (a.dueDate || '9999-12-31').localeCompare(
              b.dueDate || '9999-12-31'
            ) ||
            b.id - a.id
          )
        }

        if (state.sortOrder === 'dueDateDesc') {
          if (!a.dueDate && !b.dueDate) {
            return b.id - a.id
          }

          if (!a.dueDate) return 1
          if (!b.dueDate) return -1

          return (
            b.dueDate.localeCompare(a.dueDate) ||
            b.id - a.id
          )
        }

        return b.id - a.id
      })
    },
  },

  actions: {
    addTask(values) {
      const projectStore = useProjectsStore()

      const normalized = normalizeValues(
        values,
        projectStore.projects
      )

      if (!isValidTask(normalized)) return false

      const nextId =
        Math.max(0, ...this.tasks.map((task) => task.id)) + 1

      this.tasks.unshift({
        id: nextId,
        ...normalized,
      })

      return true
    },

    updateTask(values) {
      const task = this.tasks.find(
        (item) => item.id === Number(values.id)
      )

      if (!task) return false

      const projectStore = useProjectsStore()

      const normalized = normalizeValues(
        values,
        projectStore.projects
      )

      if (!isValidTask(normalized)) return false

      Object.assign(task, normalized)

      return true
    },

    deleteTask(id) {
      const index = this.tasks.findIndex(
        (task) => task.id === Number(id)
      )

      if (index === -1) return false

      this.tasks.splice(index, 1)

      return true
    },

    setTaskStatus({ id, status }) {
      if (!allowedStatuses.includes(status)) {
        return false
      }

      const task = this.tasks.find(
        (item) => item.id === Number(id)
      )

      if (!task) return false

      task.status = status

      return true
    },

    setTaskPriority({ id, priority }) {
      if (!allowedPriorities.includes(priority)) {
        return false
      }

      const task = this.tasks.find(
        (item) => item.id === Number(id)
      )

      if (!task) return false

      task.priority = priority

      return true
    },

    // Додаткове завдання 4:
    // Групове переведення завдань проєкту
    bulkSetProjectInProgress(projectId) {
      const projectStore = useProjectsStore()

      const projectExists = projectStore.projects.some(
        (project) => project.id === projectId
      )

      if (!projectExists) return 0

      let changed = 0

      this.tasks.forEach((task) => {
        if (
          task.projectId === projectId &&
          task.status !== 'progress'
        ) {
          task.status = 'progress'
          changed += 1
        }
      })

      return changed
    },

    resetFilters() {
      this.searchText = ''
      this.selectedStatus = 'all'
      this.selectedPriority = 'all'
      this.selectedProject = 'all'
      this.sortOrder = 'newest'
      this.onlyNoDueDate = false
      this.onlyUnfinished = false
    },
  },
})
