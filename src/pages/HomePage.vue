
<script setup>
import { storeToRefs } from 'pinia'

import AppTabbar from '../components/AppTabbar.vue'
import TaskCard from '../components/TaskCard.vue'

import { useTasksStore } from '../store/tasks'
import { useProjectsStore } from '../store/projects'

import '../css/task-components.css'
import '../css/task-form.css'
import '../css/task-list.css'

const taskStore = useTasksStore()
const projectStore = useProjectsStore()

const {
  totalTasks,
  completedTasks,
  progressTasks,
  activeTasks,
} = storeToRefs(taskStore)

const {
  projectCount,
  projectStats,
} = storeToRefs(projectStore)

function projectTitleFor(task) {
  return projectStore.projectTitle(task.projectId)
}
</script>

<template>
  <f7-page name="home" class="tf3-page">
    <f7-navbar title="TaskFlow">
      <f7-nav-right>
        <f7-link href="/about/">
          Про застосунок
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <div class="tf3-container">

      <section class="tf3-hero">
        <div class="tf3-eyebrow">
          TASKFLOW / DASHBOARD
        </div>

        <h1>Панель керування</h1>

        <p>
          Контролюйте виконання завдань,
          відстежуйте пріоритети та керуйте проєктами.
          Усього проєктів: {{ projectCount }}.
        </p>
      </section>

      <!-- Загальна статистика -->
      <section class="tf3-stat-grid">
        <div class="tf3-stat">
          <span class="tf3-stat-label">
            Усього завдань
          </span>
          <strong>{{ totalTasks }}</strong>
        </div>

        <div class="tf3-stat">
          <span class="tf3-stat-label">
            У роботі
          </span>
          <strong>{{ progressTasks }}</strong>
        </div>

        <div class="tf3-stat">
          <span class="tf3-stat-label">
            Виконано
          </span>
          <strong>{{ completedTasks }}</strong>
        </div>
      </section>

      <!-- Додаткові завдання № 2 та № 3 -->
      <section
        class="tf5-panel tf6-project-panel"
        aria-label="Статистика проєктів"
      >
        <h2>Статистика проєктів</h2>

        <div class="tf6-dashboard-projects">
          <div
            v-for="project in projectStats"
            :key="project.id"
            class="tf6-dashboard-project"
          >
            <h3>{{ project.title }}</h3>

            <div class="tf6-project-info">
              <span>Усього завдань</span>
              <strong>{{ project.taskCount }}</strong>
            </div>

            <div class="tf6-project-info">
              <span>Невиконаних</span>
              <strong>{{ project.unfinishedCount }}</strong>
            </div>

            <div class="tf6-project-info">
              <span>Виконано</span>
              <strong>{{ project.completedCount }}</strong>
            </div>

            <div class="tf6-progress-heading">
              <span>Прогрес виконання</span>
              <strong>{{ project.completionPercent }}%</strong>
            </div>

            <div
              class="tf6-progress-track"
              role="progressbar"
              :aria-label="`Прогрес проєкту ${project.title}`"
              :aria-valuenow="project.completionPercent"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                class="tf6-progress-fill"
                :style="{ width: `${project.completionPercent}%` }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Актуальні завдання -->
      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div>
            <div class="tf3-eyebrow">
              PRIORITY TASKS
            </div>
            <h2>Актуальні завдання</h2>
          </div>

          <f7-button
            href="/tasks/"
            outline
            small
          >
            Переглянути всі
          </f7-button>
        </div>

        <div
          v-if="activeTasks.length"
          class="tf3-task-grid"
        >
          <TaskCard
            v-for="task in activeTasks"
            :key="task.id"
            :task="task"
            :project-title="projectTitleFor(task)"
            :show-management-actions="false"
            @status-change="taskStore.setTaskStatus"
            @priority-change="taskStore.setTaskPriority"
          />
        </div>

        <div v-else class="tf3-empty">
          Наразі всі завдання виконані.
        </div>
      </section>

    </div>

    <AppTabbar active="home" />
  </f7-page>
</template>

<style scoped>
.tf6-dashboard-projects {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.tf6-dashboard-project {
  min-width: 0;
  padding: 20px;
  border: 1px solid #385a7a;
  border-radius: 14px;
  background: #1a344f;
}

.tf6-dashboard-project h3 {
  margin: 0 0 18px;
  font-size: 18px;
  color: #ffffff;
}

.tf6-project-info,
.tf6-progress-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #d7e4f5;
}

.tf6-project-info strong,
.tf6-progress-heading strong {
  color: #71d7ff;
  font-size: 16px;
}

.tf6-progress-heading {
  margin-top: 20px;
}

.tf6-progress-track {
  height: 10px;
  overflow: hidden;
  border-radius: 10px;
  background: #0c1728;
}

.tf6-progress-fill {
  height: 100%;
  border-radius: 10px;
  background: #39afe0;
  transition: width 0.3s ease;
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
