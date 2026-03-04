<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getServices } from '../services/api';
import ServiceCard from '../components/ServiceCard.vue';
import EmptyState from '../components/EmptyState.vue';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import { Loader2, ArrowLeft, Filter } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const services = ref([]);
const loading = ref(true);
const error = ref(null);
const hasMore = ref(false);
const nextPageStart = ref(null);
const loadingMore = ref(false);

const categorySlug = computed(() => route.params.category);

const categoryDisplayName = computed(() => {
  if (!categorySlug.value) return '';
  return categorySlug.value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
});

const fetchServices = async (append = false) => {
  try {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }
    error.value = null;

    const params = {
      category: categorySlug.value,
      limit: 12
    };
    
    if (append && nextPageStart.value) {
      params.startAfter = nextPageStart.value;
    }

    const response = await getServices(params);
    
    if (append) {
      services.value = [...services.value, ...response.data.services];
    } else {
      services.value = response.data.services || [];
    }
    
    hasMore.value = response.data.hasMore || false;
    nextPageStart.value = response.data.nextPageStartAfter || null;
  } catch (err) {
    console.error('Error fetching services:', err);
    error.value = err.response?.data?.error || 'Failed to load services';
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    fetchServices(true);
  }
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchServices();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    
    <main class="flex-1 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <button 
            @click="goBack"
            class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft class="w-5 h-5 mr-2" />
            Back to Categories
          </button>
          
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900">
                {{ categoryDisplayName }} Services
              </h1>
              <p class="mt-2 text-gray-600">
                Find trusted {{ categoryDisplayName.toLowerCase() }} professionals near you
              </p>
            </div>
            
            <div class="mt-4 md:mt-0">
              <span class="text-sm text-gray-500">
                {{ services.length }} service{{ services.length !== 1 ? 's' : '' }} found
              </span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-12">
          <EmptyState 
            title="Error Loading Services"
            :message="error"
            :showBackButton="true"
          />
        </div>

        <!-- Empty State -->
        <div v-else-if="services.length === 0" class="py-12">
          <EmptyState 
            :title="`No ${categoryDisplayName} Services Available`"
            message="There are no services in this category yet. Check back later or explore other categories."
            :showBackButton="true"
          />
        </div>

        <!-- Services Grid -->
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ServiceCard 
              v-for="service in services" 
              :key="service.id" 
              :service="service"
            />
          </div>

          <!-- Load More Button -->
          <div v-if="hasMore" class="mt-10 text-center">
            <button 
              @click="loadMore"
              :disabled="loadingMore"
              class="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Loader2 v-if="loadingMore" class="w-5 h-5 mr-2 animate-spin" />
              {{ loadingMore ? 'Loading...' : 'Load More Services' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
