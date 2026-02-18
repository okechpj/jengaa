<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import { getProviderBookings } from '../services/api'; // Works for users too
import { Calendar, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const bookings = ref([]);
const isLoading = ref(true);
const user = JSON.parse(localStorage.getItem('user') || '{}');

const fetchBookings = async () => {
    if (!user.id) return;
    try {
        const response = await getProviderBookings(user.id);
        bookings.value = response.data.data;
    } catch (error) {
        console.error("Failed to fetch bookings", error);
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (dateString) => {
    if(!dateString) return 'N/A';
    if (dateString.seconds) {
        return new Date(dateString.seconds * 1000).toLocaleDateString(undefined, {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
    return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
};

const getStatusColor = (status) => {
    switch(status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

onMounted(fetchBookings);
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans">
    <Sidebar />

    <main class="flex-1 overflow-y-auto p-8">
        <header class="mb-8">
            <h1 class="text-3xl font-extrabold text-gray-900 mb-2">My Bookings</h1>
            <p class="text-gray-500">Track and manage your service appointments.</p>
        </header>

        <div v-if="isLoading" class="flex justify-center py-20">
             <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>

        <div v-else-if="bookings.length === 0" class="text-center py-20 bg-white rounded-3xl border border-gray-100">
             <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                 <Calendar class="w-8 h-8" />
             </div>
             <h3 class="text-gray-900 font-bold text-lg mb-2">No Bookings Yet</h3>
             <p class="text-gray-500 mb-6">You haven't booked any services yet.</p>
             <button @click="router.push('/dashboard')" class="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition">
                 Browse Services
             </button>
        </div>

        <div v-else class="space-y-4">
             <div 
                v-for="booking in bookings" 
                :key="booking.id"
                @click="router.push(`/bookings/${booking.id}`)"
                class="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
             >
                 <div class="flex items-center gap-6">
                      <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0">
                          {{ booking.serviceTitle ? booking.serviceTitle.charAt(0) : 'S' }}
                      </div>
                      <div>
                          <div class="flex items-center gap-3 mb-1">
                              <h3 class="font-bold text-gray-900 text-lg">{{ booking.serviceTitle }}</h3>
                              <span :class="`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(booking.status)}`">
                                  {{ booking.status }}
                              </span>
                          </div>
                          <div class="text-gray-500 text-sm flex items-center gap-4">
                              <span>📅 {{ formatDate(booking.scheduledDate) }}</span>
                              <span>👷 {{ booking.providerName || 'Provider' }}</span>
                          </div>
                      </div>
                 </div>

                 <div class="flex items-center gap-6 md:ml-auto w-full md:w-auto justify-between md:justify-end">
                     <div class="font-bold text-blue-900 text-xl">${{ booking.servicePrice || '0.00' }}</div>
                     <button class="text-gray-400 group-hover:text-blue-700 transition">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                         </svg>
                     </button>
                 </div>
             </div>
        </div>

    </main>
  </div>
</template>
