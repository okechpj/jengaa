<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: [Object, Function], // component definition
  trend: String, // e.g., "+12%"
  trendColor: {
    type: String,
    default: 'text-green-600 bg-green-50'
  }
});
</script>

<template>
  <div class="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between h-full min-h-[160px]">
    <div class="flex justify-between items-start">
      <div v-if="icon" class="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center">
        <component :is="icon" class="w-6 h-6" />
      </div>
      <div v-if="trend" :class="`px-2 py-1 rounded-full text-xs font-bold ${trendColor}`">
        {{ trend }}
      </div>
    </div>
    
    <div>
      <div class="text-gray-500 text-sm font-medium mb-1">{{ title }}</div>
      <div class="text-3xl font-extrabold text-gray-900">{{ value }}</div>
    </div>
  </div>
</template>
