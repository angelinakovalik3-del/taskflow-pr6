
<template>
  <div class="task-counter">
    <h3>Статистика завдань</h3>

    <div class="task-counter__items">
      <div class="task-counter__item">
        <span>Усього завдань:</span>
        <strong>{{ total }}</strong>
      </div>

      <div class="task-counter__item">
        <span>Виконано:</span>
        <strong>{{ completed }}</strong>
      </div>

      <div class="task-counter__item">
        <span>У роботі:</span>
        <strong>{{ inProgress }}</strong>
      </div>

      <div class="task-counter__item">
        <span>Заплановано:</span>
        <strong>{{ planned }}</strong>
      </div>

      <div class="task-counter__item">
        <span>Прогрес виконання:</span>
        <strong>{{ completionPercent }}%</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  completed: {
    type: Number,
    required: true
  },
  inProgress: {
    type: Number,
    required: true
  },
  planned: {
    type: Number,
    required: true
  }
});

const completionPercent = computed(() => {
  if (props.total === 0) {
    return 0;
  }

  return Math.round(
    (props.completed / props.total) * 100
  );
});
</script>

<style scoped>
.task-counter {
  margin-top: 20px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
}

.task-counter h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #172033;
}

.task-counter__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-counter__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #475569;
}

.task-counter__item strong {
  color: #2563eb;
  font-weight: 700;
}
</style>
