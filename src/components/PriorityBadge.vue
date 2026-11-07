
<script setup>
import { computed } from 'vue';

const props = defineProps({
  priority: {
    type: String,
    required: true
  }
});

const options = {
  low: {
    text: 'Низький',
    className: 'priority-low'
  },
  medium: {
    text: 'Середній',
    className: 'priority-medium'
  },
  high: {
    text: 'Високий',
    className: 'priority-high'
  }
};

const currentPriority = computed(() =>
  options[props.priority] || {
    text: 'Не визначено',
    className: 'priority-unknown'
  }
);
</script>

<template>
  <span
    class="task-priority"
    :class="currentPriority.className"
  >
    {{ currentPriority.text }}
  </span>
</template>
