
<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import AppTabbar from '../components/AppTabbar.vue'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '../components/TaskForm.vue'
import TaskListControls from '../components/TaskListControls.vue'

import { useTasksStore } from '../store/tasks'
import { useProjectsStore } from '../store/projects'

import '../css/task-components.css'
import '../css/task-form.css'
import '../css/task-list.css'

const taskStore = useTasksStore()
const projectStore = useProjectsStore()

// Спільний реактивний стан Pinia
const {
  tasks,
  visibleTasks,
  searchText,
  selectedStatus,
  selectedPriority,
  selectedProject,
  sortOrder,
  onlyUnfinished,
  onlyNoDueDate,
  completedPercent,
} = storeToRefs(taskStore)

const {
  projects,
  projectStats,
} = storeToRefs(projectStore)

// Локальний стан сторінки
const showForm = ref(false)
const editingId = ref(null)
const newProjectTitle = ref('')
const newProjectError = ref('')
const actionMessage = ref('')

// Завдання, яке редагується
const editingTask = computed(() =>
  tasks.value.find(
    (task) => task.id === editingId.value
  ) ?? null
)

// Поточний проєкт для групової операції
const currentProject = computed(() =>
  projects.value.find(
    (project) => project.id === selectedProject.value
  ) ?? null
)

// Створення нового завдання
function startCreate() {
  editingId.value = null
  showForm.value = true
}

// Редагування завдання
function startEdit(id) {
  editingId.value = Number(id)
  showForm.value = true
}

// Закриття форми
function cancelForm() {
  editingId.value = null
  showForm.value = false
}

// Створення або редагування завдання
function saveTask(values) {
  const saved = values.id == null
    ? taskStore.addTask(values)
    : taskStore.updateTask(values)

  if (saved) {
    actionMessage.value = 'Завдання успішно збережено.'
    cancelForm()
  }
}

// Видалення із підтвердженням
function handleDelete(id) {
  const task = tasks.value.find(
    (item) => item.id === Number(id)
  )

  if (!task) return

  const confirmed = window.confirm(
    `Видалити завдання «${task.title}»?`
  )

  if (!confirmed) return

  if (taskStore.deleteTask(id)) {
    actionMessage.value = 'Завдання успішно видалено.'

    if (editingId.value === Number(id)) {
      cancelForm()
    }
  }
}

// Створення проєкту
function createProject() {
  const project = projectStore.addProject(
    newProjectTitle.value
  )

  if (!project) {
    newProjectError.value =
      'Назва повинна містити від 3 до 40 символів і бути унікальною.'
    return
  }

  newProjectTitle.value = ''
  newProjectError.value = ''
  actionMessage.value =
    `Проєкт «${project.title}» успішно створено.`

  // Новий проєкт стає активним фільтром
  selectedProject.value = project.id
}

// Додаткове завдання № 4:
// Групове переведення завдань у статус "У роботі"
function bulkStartProject() {
  const project = currentProject.value

  if (!project) return

  const count = tasks.value.filter(
    (task) =>
      task.projectId === project.id &&
      task.status !== 'progress'
  ).length

  if (count === 0) {
    actionMessage.value =
      'У вибраному проєкті немає завдань для зміни статусу.'
    return
  }

  const confirmed = window.confirm(
    `Перевести ${count} завдань проєкту «${project.title}» у статус «У роботі»?`
  )

  if (!confirmed) return

  const changed = taskStore.bulkSetProjectInProgress(
    project.id
  )

  actionMessage.value =
    `У статус «У роботі» переведено ${changed} завдань.`
}

function resetAllFilters() {
  taskStore.resetFilters()
  actionMessage.value = ''
}
</script>

<template>
  <f7-page name="tasks" class="tf3-page">
    <f7-navbar title="Мої завдання" />

    <div class="tf3-container">

      <!-- Заголовок -->
      <section class="tf3-hero">
        <div class="tf3-eyebrow">
          TASKFLOW / TASK MANAGER
        </div>

        <h1>Керування завданнями і проєктами</h1>

        <p>
          Створюйте проєкти, керуйте завданнями,
          змінюйте статуси та використовуйте
          спільний реактивний стан Pinia.
        </p>

        <button
          type="button"
          class="tf5-btn tf5-btn--primary tf5-new"
          @click="startCreate"
        >
          + Додати завдання
        </button>
      </section>

      <!-- Каталог проєктів -->
      <section
        class="tf5-panel tf6-project-panel"
        aria-label="Мої проєкти"
      >
        <h2>Мої проєкти</h2>

        <div class="tf6-dashboard-projects">
          <div
            v-for="project in projectStats"
            :key="project.id"
            class="tf6-dashboard-project"
          >
            <h3>{{ project.title }}</h3>

            <div class="tf6-project-detail">
              <span>Усього завдань</span>
              <strong>{{ project.taskCount }}</strong>
            </div>

            <div class="tf6-project-detail">
              <span>Невиконаних</span>
              <strong>{{ project.unfinishedCount }}</strong>
            </div>

            <div class="tf6-project-detail">
              <span>Виконано</span>
              <strong>{{ project.completedCount }}</strong>
            </div>

            <div class="tf6-project-detail">
              <span>Прогрес</span>
              <strong>
                {{ project.completionPercent }}%
              </strong>
            </div>

            <div
              class="tf6-progress-track"
              role="progressbar"
              :aria-valuenow="project.completionPercent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Прогрес проєкту ${project.title}`"
            >
              <div
                class="tf6-progress-fill"
                :style="{
                  width: `${project.completionPercent}%`
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Створення нового проєкту -->
        <form
          class="tf6-project-form tf6-create-form"
          @submit.prevent="createProject"
        >
          <label>
            Назва нового проєкту
            <input
              v-model="newProjectTitle"
              type="text"
              maxlength="40"
              placeholder="Наприклад: Лабораторні"
              @input="newProjectError = ''"
            />
          </label>

          <button
            type="submit"
            class="tf5-btn tf5-btn--primary"
          >
            Створити проєкт
          </button>
        </form>

        <p
          v-if="newProjectError"
          class="tf5-error"
          role="alert"
        >
          {{ newProjectError }}
        </p>

        <!-- Групова операція -->
        <div
          v-if="currentProject"
          class="tf6-bulk-actions"
        >
          <p>
            Вибраний проєкт:
            <strong>{{ currentProject.title }}</strong>
          </p>

          <button
            type="button"
            class="tf5-btn"
            @click="bulkStartProject"
          >
            Перевести всі завдання проєкту
            у статус «У роботі»
          </button>
        </div>
      </section>

      <!-- Повідомлення про виконані операції -->
      <div
        v-if="actionMessage"
        class="tf6-action-message"
        role="status"
      >
        {{ actionMessage }}
      </div>

      <!-- Форма створення та редагування -->
      <TaskForm
        v-if="showForm"
        :key="editingId ?? 'new'"
        :task="editingTask"
        :projects="projects"
        @save="saveTask"
        @cancel="cancelForm"
      />

      <!-- Фільтри -->
      <TaskListControls
        v-model:search="searchText"
        v-model:status="selectedStatus"
        v-model:priority="selectedPriority"
        v-model:project="selectedProject"
        v-model:sort="sortOrder"
        v-model:onlyUnfinished="onlyUnfinished"
        v-model:onlyNoDueDate="onlyNoDueDate"
        :projects="projects"
        @reset="resetAllFilters"
      />

      <!-- Список завдань -->
      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div>
            <div class="tf3-eyebrow">
              TASK LIST
            </div>

            <h2>Список завдань</h2>
          </div>

          <div class="tf3-counter">
            Показано:
            {{ visibleTasks.length }}
            із {{ tasks.length }}

            <span class="tf5-percent">
              | Виконано: {{ completedPercent }}%
            </span>
          </div>
        </div>

        <!-- Картки -->
        <div
          v-if="visibleTasks.length"
          class="tf3-task-grid"
        >
          <TaskCard
            v-for="task in visibleTasks"
            :key="task.id"
            :task="task"
            :project-title="
              projectStore.projectTitle(task.projectId)
            "
            @status-change="taskStore.setTaskStatus"
            @priority-change="taskStore.setTaskPriority"
            @edit="startEdit"
            @delete="handleDelete"
          />
        </div>

        <!-- Порожній список -->
        <div
          v-else-if="tasks.length === 0"
          class="tf5-empty"
        >
          <p>
            Список завдань порожній.
            Усі завдання видалено.
          </p>

          <button
            type="button"
            class="tf5-btn"
            @click="startCreate"
          >
            Створити перше завдання
          </button>
        </div>

        <!-- Не знайдено за фільтрами -->
        <div v-else class="tf5-empty">
          <p>
            За поточними умовами завдань не знайдено.
          </p>

          <button
            type="button"
            class="tf5-btn"
            @click="resetAllFilters"
          >
            Показати всі завдання
          </button>
        </div>

      </section>
    </div>

    <AppTabbar active="tasks" />
  </f7-page>
</template>

<style scoped>
.tf6-dashboard-projects {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.tf6-dashboard-project {
  min-width: 0;
  padding: 20px;
  border: 1px solid #385a7a;
  border-radius: 14px;
  background: #1a344f;
  color: #edf4ff;
}

.tf6-dashboard-project h3 {
  margin: 0 0 18px;
  font-size: 18px;
  color: #ffffff;
}

.tf6-project-detail {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #d7e4f5;
}

.tf6-project-detail strong {
  color: #71d7ff;
}

.tf6-progress-track {
  height: 10px;
  margin-top: 16px;
  overflow: hidden;
  background: #0c1728;
  border-radius: 10px;
}

.tf6-progress-fill {
  height: 100%;
  background: #39afe0;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.tf6-create-form {
  margin-top: 12px;
}

.tf6-bulk-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.tf6-bulk-actions p {
  margin: 0;
  color: #d7e4f5;
}

.tf6-action-message {
  padding: 13px 16px;
  margin: 16px 0;
  border: 1px solid #91cdb2;
  border-radius: 10px;
  background: #e5f6ec;
  color: #185b3a;
  font-weight: 600;
}

@media (max-width: 850px) {
  .tf6-dashboard-projects {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .tf6-dashboard-projects {
    grid-template-columns: 1fr;
  }
}
</style>
