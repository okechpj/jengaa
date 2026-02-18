<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ProviderSidebar from '../../components/ProviderSidebar.vue';
import StatCard from '../../components/StatCard.vue';
import ServiceCard from '../../components/ServiceCard.vue'; // We might want a smaller version, but reusing for now
import AddServiceModal from '../../components/AddServiceModal.vue';
import { Calendar, DollarSign, CheckCircle, Clock, Plus } from 'lucide-vue-next';
import { getProviderBookings, getProviderServices, updateBookingStatus } from '../../services/api';

const router = useRouter();
const user = JSON.parse(localStorage.getItem('user') || '{}');
const bookings = ref([]);
const services = ref([]);
const isLoading = ref(true);
const showAddServiceModal = ref(false);

const fetchData = async () => {
    try {
        const [bookingsRes, servicesRes] = await Promise.all([
            getProviderBookings(user.id),
            getProviderServices(user.id)
        ]);
        bookings.value = bookingsRes.data.data;
        services.value = servicesRes.data.data;
    } catch (error) {
        console.error('Failed to fetch provider data:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(fetchData);

// Computed Stats
const totalBookings = computed(() => bookings.value.length);
const activeBookings = computed(() => bookings.value.filter(b => ['PENDING', 'ACCEPTED'].includes(b.status)).length);
const totalEarnings = computed(() => {
    // Dummy calculation: sum of price of accepted/completed bookings
    return bookings.value
        .filter(b => ['ACCEPTED', 'COMPLETED'].includes(b.status))
        .reduce((sum, b) => sum + (b.servicePrice || 0), 0);
});

const recentBookings = computed(() => bookings.value.slice(0, 5));

const handleStatusUpdate = async (bookingId, status) => {
    try {
        await updateBookingStatus(bookingId, status);
        // Refresh data or optimistic update
        const index = bookings.value.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings.value[index].status = status;
        }
    } catch (error) {
        console.error('Failed to update status:', error);
        alert('Failed to update booking status');
    }
};

const handleServiceAdded = () => {
    // Refresh services
    getProviderServices(user.uid).then(res => {
        services.value = res.data.data;
    });
};

const formatDate = (dateString, timeString) => {
    if(!dateString) return 'N/A';
    // If it's a Firestore timestamp (seconds), convert it
    if (dateString.seconds) {
        return new Date(dateString.seconds * 1000).toLocaleString();
    }
    return new Date(dateString).toLocaleString();
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
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans">
    <ProviderSidebar />

    <main class="flex-1 overflow-y-auto p-8">
      <!-- Header -->
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 mb-1">Provider Dashboard</h1>
          <p class="text-gray-500">Here's what's happening with your services today.</p>
        </div>
        <div class="flex items-center gap-4">
             <div class="text-right hidden sm:block">
                 <div class="text-md font-bold text-gray-900">{{ user.name }}</div>
                 <div class="text-xs text-blue-600 font-bold uppercase">{{ user.role }}</div>
             </div>
             <div class="w-12 h-12 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-lg">
                 {{ user.name ? user.name.charAt(0).toUpperCase() : 'P' }}
             </div>
        </div>
      </header>

      <!-- Stats Grid -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Active Bookings" 
          :value="activeBookings" 
          :icon="Calendar" 
          trend="+2 new"
          trendColor="bg-green-100 text-green-700"
        />
        <StatCard 
          title="Total Earnings" 
          :value="`$${totalEarnings.toLocaleString()}`" 
          :icon="DollarSign" 
          trend="+15.4%"
        />
         <StatCard 
          title="Completed Bookings" 
          :value="bookings.filter(b => b.status === 'COMPLETED').length" 
          :icon="CheckCircle"
        />
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Incoming Bookings -->
          <div class="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6">
              <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold text-gray-900">Incoming Bookings</h2>
                  <button class="text-sm font-bold text-blue-700 hover:underline">View All</button>
              </div>

              <div class="overflow-x-auto">
                  <table class="w-full text-left">
                      <thead>
                          <tr class="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                              <th class="pb-4 font-semibold">Customer</th>
                              <th class="pb-4 font-semibold">Service</th>
                              <th class="pb-4 font-semibold">Date & Time</th>
                              <th class="pb-4 font-semibold">Status</th>
                              <th class="pb-4 font-semibold text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-50">
                          <tr v-if="bookings.length === 0">
                              <td colspan="5" class="py-8 text-center text-gray-400">No bookings found.</td>
                          </tr>
                          <tr 
                            v-for="booking in recentBookings" 
                            :key="booking.id" 
                            class="group hover:bg-gray-50 transition-colors cursor-pointer"
                            @click="() => {
                                if(booking.status === 'PENDING') router.push(`/provider/booking/${booking.id}`);
                                else if(booking.status === 'ACCEPTED') router.push(`/booking/track/${booking.id}`);
                                else router.push(`/bookings/${booking.id}`);
                            }"
                          >
                              <td class="py-4">
                                  <div class="font-bold text-gray-900">{{ booking.clientName }}</div>
                              </td>
                              <td class="py-4 text-gray-600 text-sm">{{ booking.serviceTitle }}</td>
                              <td class="py-4 text-gray-500 text-sm">
                                  {{ formatDate(booking.scheduledDate) }}
                              </td>
                              <td class="py-4">
                                  <span :class="`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`">
                                      {{ booking.status }}
                                  </span>
                              </td>
                              <td class="py-4 text-right">
                                  <div v-if="booking.status === 'PENDING'" class="flex justify-end gap-2">
                                      <button @click.stop="handleStatusUpdate(booking.id, 'ACCEPTED')" class="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition">Accept</button>
                                      <button @click.stop="handleStatusUpdate(booking.id, 'CANCELLED')" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition">Reject</button>
                                  </div>
                                  <div v-if="booking.status === 'ACCEPTED'" class="flex justify-end gap-2">
                                      <button @click.stop="handleStatusUpdate(booking.id, 'COMPLETED')" class="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition">Complete</button>
                                  </div>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          <!-- My Services (Mini) -->
           <div class="lg:col-span-1 bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col h-full">
               <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold text-gray-900">My Services</h2>
                  <button 
                    @click="showAddServiceModal = true"
                    class="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition"
                  >
                      <Plus class="w-5 h-5" />
                  </button>
              </div>

               <div class="space-y-4 flex-1 overflow-y-auto">
                   <div v-if="services.length === 0" class="text-center py-8 text-gray-400 text-sm">
                       No services listed. Add your first one!
                   </div>
                   <div v-for="service in services" :key="service.id" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition">
                       <div class="flex items-center gap-3">
                           <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                               <component v-if="service.category === 'plumbing'" :is="DollarSign" class="w-5 h-5" /> <!-- Placeholder icon logic, improve later -->
                               <span v-else class="text-lg">🛠️</span>
                           </div>
                           <div>
                               <div class="font-bold text-gray-900 text-sm">{{ service.title }}</div>
                               <div class="text-xs text-gray-500">${{ service.price }}/hr • {{ service.rating || 'New' }} ★</div>
                           </div>
                       </div>
                       <span :class="`px-2 py-[2px] rounded-md text-[10px] font-bold uppercase tracking-wider ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`">
                           {{ service.isActive ? 'Active' : 'Inactive' }}
                       </span>
                   </div>
               </div>
               
               <button 
                @click="showAddServiceModal = true"
                class="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 transition"
               >
                   Add New Listing
               </button>
           </div>
      </section>

      <AddServiceModal 
        :isOpen="showAddServiceModal"
        @close="showAddServiceModal = false"
        @service-added="handleServiceAdded"
      />

    </main>
  </div>
</template>
