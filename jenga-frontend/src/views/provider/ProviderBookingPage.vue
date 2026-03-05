<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import { MapPin, Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-vue-next';
import { getBookingById, acceptBooking, declineBooking, updateBookingNotes } from '../../services/api';

const route = useRoute();
const router = useRouter();
const booking = ref(null);
const isLoading = ref(true);
const isProcessing = ref(false);
const providerNotes = ref('');

const mapContainer = ref(null);
let map = null;

const fetchBooking = async () => {
    try {
        const response = await getBookingById(route.params.bookingId);
        booking.value = response.data.data;
        providerNotes.value = booking.value.providerNotes || '';
    } catch (err) {
        console.error("Failed to fetch booking", err);
    } finally {
        isLoading.value = false;
        // Init map after data load
        setTimeout(initMap, 200);
    }
};

const initMap = () => {
    if (!mapContainer.value || !booking.value?.clientLocation) return;
    
    const L = window.L;
    if (!L) return;

    const { lat, lng } = booking.value.clientLocation;
    
    // Clean up if re-initializing
    if (map) {
        map.remove();
    }

    map = L.map(mapContainer.value).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup('Client Location')
        .openPopup();
};

onMounted(fetchBooking);

const handleAccept = async () => {
    const details = `Service: ${booking.value?.serviceTitle || 'N/A'}\nDate: ${formatDate(booking.value?.scheduledDate)} ${formatTime(booking.value?.scheduledDate)}\n\nNotes: ${providerNotes.value || '(none)'}\n\nAccept this job and notify client?`;
    if (!confirm(details)) return;
    isProcessing.value = true;
    try {
        // Auto-save notes before accepting
        try {
            await saveNotes();
        } catch (e) {
            console.warn('Failed to auto-save notes before accept', e);
        }

        await acceptBooking(booking.value.id);
        alert('Booking Accepted! Redirecting to tracking...');
        router.push(`/booking/track/${booking.value.id}`);
    } catch (err) {
        alert(err.response?.data?.error || 'Failed');
    } finally {
        isProcessing.value = false;
    }
};

const handleDecline = async () => {
    if(!confirm("Decline this job? This cannot be undone.")) return;
    isProcessing.value = true;
    try {
        await declineBooking(booking.value.id);
        alert("Booking Declined.");
        router.push('/provider/dashboard');
    } catch (err) {
        alert(err.response?.data?.error || "Failed");
    } finally {
        isProcessing.value = false;
    }
};

const saveNotes = async () => {
    if (!booking.value || !booking.value.id) return;
    isProcessing.value = true;
    try {
        await updateBookingNotes(booking.value.id, { notes: providerNotes.value });
        alert('Notes saved');
    } catch (err) {
        alert(err.response?.data?.error || 'Failed to save notes');
    } finally {
        isProcessing.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString.seconds ? dateString.seconds * 1000 : dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString.seconds ? dateString.seconds * 1000 : dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans pb-20">
    <Navbar />

    <div v-if="isLoading" class="flex justify-center pt-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>

    <div v-else-if="booking" class="max-w-xl mx-auto px-4 pt-8">
      <div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          
          <!-- Map Header -->
          <div ref="mapContainer" class="w-full h-64 bg-gray-100 relative z-0"></div>
          
          <div class="p-6 md:p-8 -mt-6 relative z-10 bg-white rounded-t-3xl">
              <div class="flex justify-between items-start mb-4">
                  <div>
                      <h1 class="text-2xl font-bold text-gray-900">{{ booking.serviceTitle }}</h1>
                      <div class="flex items-center text-gray-500 text-sm mt-1">
                          <MapPin class="w-4 h-4 mr-1" />
                          <span class="truncate max-w-[200px]">{{ booking.clientLocation?.address || 'Location provided' }}</span>
                      </div>
                  </div>
                  <div v-if="booking.urgency === 'EMERGENCY'" class="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                      <AlertTriangle class="w-3 h-3" />
                      Emergency
                  </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-6">
                   <div class="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                       <div class="w-10 h-10 rounded-lg bg-white text-blue-600 shadow-sm flex items-center justify-center">
                           <Calendar class="w-5 h-5" />
                       </div>
                       <div>
                           <div class="text-xs text-gray-500 font-bold uppercase">Date</div>
                           <div class="text-sm font-bold text-gray-900">{{ formatDate(booking.scheduledDate) }}</div>
                       </div>
                   </div>
                   <div class="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                       <div class="w-10 h-10 rounded-lg bg-white text-blue-600 shadow-sm flex items-center justify-center">
                           <Clock class="w-5 h-5" />
                       </div>
                       <div>
                           <div class="text-xs text-gray-500 font-bold uppercase">Time</div>
                           <div class="text-sm font-bold text-gray-900">{{ formatTime(booking.scheduledDate) }}</div>
                       </div>
                   </div>
              </div>

              <div class="mb-8">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Description</h3>
                  <p class="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {{ booking.description }}
                  </p>
              </div>

                          <!-- Short Notes (Provider editable) -->
                          <div class="mb-8">
                              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Notes</h3>
                              <textarea v-model="providerNotes" placeholder="Add short notes for this booking (visible to client)" class="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 h-28"></textarea>
                              <div class="flex justify-end mt-3">
                                  <button @click="saveNotes" :disabled="isProcessing" class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-xl disabled:opacity-60">
                                      Save Notes
                                  </button>
                              </div>
                          </div>

              <!-- Actions -->
              <div v-if="booking.status === 'PENDING'" class="grid grid-cols-2 gap-4">
                  <button 
                    @click="handleDecline"
                    :disabled="isProcessing"
                    class="py-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                      <XCircle class="w-5 h-5" />
                      Decline
                  </button>
                  <button 
                    @click="handleAccept"
                    :disabled="isProcessing"
                    class="py-4 rounded-xl font-bold text-white bg-blue-800 hover:bg-blue-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                      <CheckCircle class="w-5 h-5" />
                      Accept Job
                  </button>
              </div>
              <div v-else class="text-center py-4 bg-gray-50 rounded-xl font-bold text-gray-500">
                  This booking is {{ booking.status.toLowerCase() }}.
              </div>
          </div>
      </div>
    </div>
  </div>
</template>
