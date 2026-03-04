<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCategories } from '../services/api';
import { Zap, Wrench, Droplet, Briefcase, Hammer, Paintbrush, Trees, Wind, Loader2, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const categories = ref([]);
const loading = ref(true);
const error = ref(null);

// Map icon names to components
const iconMap = {
  Zap,
  Wrench,
  Droplet,
  Briefcase,
  Hammer,
  Paintbrush,
  Trees,
  Wind
};

const getIconComponent = (iconName) => {
  return iconMap[iconName] || Briefcase;
};

const fetchCategories = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getCategories();
    categories.value = response.data.data || [];
  } catch (err) {
    console.error('Error fetching categories:', err);
    error.value = 'Failed to load categories';
  } finally {
    loading.value = false;
  }
};

const navigateToCategory = (categorySlug) => {
  router.push(`/category/${categorySlug}`);
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <section id="categories" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-end mb-12">
        <div>
           <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
           <p class="text-gray-600 max-w-2xl">From emergency fixes to planned renovations, find the right expert for every job.</p>
        </div>
        <router-link 
          to="/categories" 
          class="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition"
        >
          View all categories 
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p class="text-gray-600">{{ error }}</p>
        <button 
          @click="fetchCategories" 
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>

      <!-- Categories Grid -->
      <div v-else-if="categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          v-for="category in categories" 
          :key="category.slug" 
          @click="navigateToCategory(category.slug)"
          class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
        >
          <div class="h-48 overflow-hidden relative">
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition z-10"></div>
            <img 
              :src="category.image" 
              :alt="category.name" 
              class="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" 
            />
            <div class="absolute top-4 left-4 z-20 bg-white p-2 rounded-lg shadow-sm">
              <component :is="getIconComponent(category.icon)" :class="`h-6 w-6 ${category.color}`" />
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{{ category.name }}</h3>
            <p class="text-sm text-gray-500">{{ category.description }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600">No categories available at the moment.</p>
      </div>
      
      <div class="mt-8 text-center md:hidden">
        <router-link 
          to="/categories" 
          class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition"
        >
          View all categories 
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>