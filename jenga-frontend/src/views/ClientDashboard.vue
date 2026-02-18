<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import ServiceCard from '../components/ServiceCard.vue';
import { Search, Bell, Settings, Zap, Shield, HelpCircle } from 'lucide-vue-next';
import { getServices } from '../services/api';

const router = useRouter();
const services = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref(null);
const fetchError = ref(null);

const categories = [
  { id: 'electrical', name: 'Electrical', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
  { id: 'plumbing', name: 'Plumbing', icon: '💧', color: 'text-blue-600 bg-blue-50' }, // Using emoji for simplicity if icon not available, or import Droplet
  { id: 'cleaning', name: 'Cleaning', icon: '✨', color: 'text-green-600 bg-green-50' },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚', color: 'text-orange-600 bg-orange-50' },
  { id: 'painting', name: 'Painting', icon: '🎨', color: 'text-purple-600 bg-purple-50' },
  { id: 'hvac', name: 'HVAC', icon: '❄️', color: 'text-red-600 bg-red-50' },
];

const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    // Handle case where localStorage returns the string "undefined"
    if (!userStr || userStr === 'undefined') return {};
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return {};
  }
};

const user = getUserData();

const fetchServices = async () => {
  isLoading.value = true;
  fetchError.value = null;
  try {
    const params = {};
    if (selectedCategory.value) {
      params.category = selectedCategory.value;
    }
    const response = await getServices(params);
    services.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    fetchError.value = "Unable to load services at this time.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchServices();
});

watch(selectedCategory, () => {
  fetchServices();
});

// Client-side search filtering
const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value;
  const query = searchQuery.value.toLowerCase();
  return services.value.filter(service => 
    service.title.toLowerCase().includes(query) || 
    service.description.toLowerCase().includes(query)
  );
});

const selectCategory = (categoryId) => {
    if (selectedCategory.value === categoryId) {
        selectedCategory.value = null; // Toggle off
    } else {
        selectedCategory.value = categoryId;
    }
};
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans">
    <Sidebar />

    <main class="flex-1 overflow-y-auto">
      <!-- Header -->
      <header class="bg-white sticky top-0 z-40 px-8 py-4 flex justify-between items-center border-b border-gray-100">
         <div class="flex items-center gap-4 lg:hidden">
             <!-- Mobile Menu Trigger would go here -->
             <span class="font-bold text-xl text-blue-900">Jengaa</span>
         </div>
         <div class="hidden lg:block"></div> <!-- Spacer -->

         <div class="flex items-center gap-6">
             <button class="relative text-gray-400 hover:text-gray-600 transition">
                 <Bell class="w-6 h-6" />
                 <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <button class="text-gray-400 hover:text-gray-600 transition">
                 <Settings class="w-6 h-6" />
             </button>
             <div class="flex items-center gap-3 pl-6 border-l border-gray-100">
                 <div class="text-right hidden sm:block">
                     <div class="text-sm font-bold text-gray-900">{{ user.name || 'User' }}</div>
                     <div class="text-xs text-blue-600 font-medium uppercase tracking-wide">{{ user.role || 'Client' }}</div>
                 </div>
                 <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                     {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                 </div>
             </div>
         </div>
      </header>

      <div class="p-8 max-w-7xl mx-auto space-y-12">
          
          <!-- Hero Section -->
          <section class="text-center py-10">
              <h1 class="text-4xl font-extrabold text-gray-900 mb-2">
                  Find Trusted Professionals <br/>
                  <span class="text-blue-700">Near You</span>
              </h1>
              <p class="text-gray-500 mb-8 text-lg">The most reliable platform for home services, vetted by experts.</p>

              <div class="max-w-2xl mx-auto relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search class="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="What do you need help with?" 
                    class="w-full pl-12 pr-4 py-4 rounded-full border-0 shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                  <button class="absolute right-2 top-2 bottom-2 px-6 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-full transition shadow-md">
                      Search
                  </button>
              </div>
          </section>



          <!-- Categories -->
          <section>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <button 
                    v-for="cat in categories" 
                    :key="cat.id"
                    @click="selectCategory(cat.id)"
                    :class="`bg-white p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg ${selectedCategory === cat.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'}`"
                  >
                      <div :class="`w-12 h-12 rounded-full flex items-center justify-center ${cat.color} bg-opacity-20`">
                          <component v-if="typeof cat.icon !== 'string'" :is="cat.icon" class="w-6 h-6" />
                          <span v-else class="text-2xl">{{ cat.icon }}</span>
                      </div>
                      <span class="font-bold text-gray-900 text-sm">{{ cat.name }}</span>
                  </button>
              </div>
          </section>

          <!-- Top Rated Services -->
          <section>
              <div class="flex justify-between items-end mb-6">
                  <div>
                      <h2 class="text-2xl font-bold text-gray-900">Top Rated Near You</h2>
                      <p class="text-gray-500 mt-1">Highly recommended professionals in your area</p>
                  </div>
                  <button class="text-blue-700 font-bold hover:underline">View All &rarr;</button>
              </div>


              <div v-if="isLoading" class="flex justify-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>

              <div v-else-if="fetchError" class="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
                  <div class="text-red-500 mb-2 font-medium">{{ fetchError }}</div>
                  <button @click="fetchServices" class="text-sm text-red-700 hover:underline">Try Again</button>
              </div>

              <div v-else-if="filteredServices.length === 0" class="text-center py-12 bg-white rounded-3xl border border-gray-100">
                  <div class="text-gray-400 mb-2">No services found</div>
                  <p class="text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ServiceCard 
                    v-for="service in filteredServices" 
                    :key="service.id" 
                    :service="service" 
                  />
              </div>
          </section>

          <!-- Promo Section (Emergency & Benefits) -->
          <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Emergency Card -->
              <div class="lg:col-span-1 bg-gray-800 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-end min-h-[400px]">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                  <!-- Background Image Placeholder -->
                  <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50" />
                  
                  <div class="relative z-20">
                      <span class="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-4">EMERGENCY</span>
                      <h3 class="text-3xl font-bold mb-3">Need Immediate Help?</h3>
                      <p class="text-gray-300 mb-6 leading-relaxed">Emergency electrical, plumbing, and HVAC services available 24/7. Response in under 30 minutes.</p>
                      <button class="bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg w-full sm:w-auto">Call Now</button>
                  </div>
              </div>

              <!-- Jengaa Smart Picks & Benefits -->
              <div class="lg:col-span-2 space-y-6">
                  <div class="bg-white rounded-3xl p-8 border border-gray-100">
                      <h3 class="text-xl font-bold text-gray-900 mb-2">Jengaa Smart Picks</h3>
                      <p class="text-gray-500 text-sm mb-6">Based on your past bookings.</p>
                      
                      <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-xl hover:bg-blue-50 transition cursor-pointer group">
                          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                              <Shield class="w-6 h-6" />
                          </div>
                          <div>
                              <div class="font-bold text-gray-900">Custom Cabinetry</div>
                              <div class="text-xs text-gray-500">Matches your home style</div>
                          </div>
                          <button class="ml-auto text-blue-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition">View</button>
                      </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div class="bg-blue-600 rounded-3xl p-8 text-white flex flex-col justify-between h-64 hover:bg-blue-700 transition cursor-pointer">
                          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <Shield class="w-6 h-6 text-white" />
                          </div>
                          <div>
                              <h3 class="font-bold text-xl mb-1">Pro Plan Benefits</h3>
                              <p class="text-blue-100 text-sm">20% off all plumbing this month</p>
                          </div>
                      </div>

                       <div class="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col justify-between h-64 hover:shadow-lg transition cursor-pointer">
                          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <HelpCircle class="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                              <h3 class="font-bold text-xl mb-1">How it works?</h3>
                              <p class="text-gray-500 text-sm">Learn about our vetting process</p>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

      </div>
    </main>
  </div>
</template>
