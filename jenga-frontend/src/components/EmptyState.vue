<script setup>
import { FileQuestion, ArrowLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    default: 'No Data Found'
  },
  message: {
    type: String,
    default: 'The content you are looking for is not available at the moment.'
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: 'default'
  }
});

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="mb-6 flex justify-center">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <FileQuestion class="w-12 h-12 text-gray-400" />
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-gray-900 mb-3">{{ title }}</h2>
      <p class="text-gray-600 mb-8">{{ message }}</p>
      
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          v-if="showBackButton"
          @click="goBack"
          class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          Go Back
        </button>
        
        <router-link 
          to="/"
          class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Back to Home
        </router-link>
      </div>
      
      <slot></slot>
    </div>
  </div>
</template>
