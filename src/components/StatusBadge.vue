
<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const options = {
  todo: {
    text: 'Заплановано',
    className: 'status-todo'
  },
  progress: {
    text: 'У роботі',
    className: 'status-progress'
  },
  done: {
    text: 'Виконано',
    className: 'status-done'
  }
};

const currentStatus = computed(() =>
  options[props.status] || {
    text: 'Невідомо',
    className: 'status-unknown'
  }
);
</script>

<template>
  <span
    class="task-status"
    :class="currentStatus.className"
  >
    {{ currentStatus.text }}
  </span>
</template>
