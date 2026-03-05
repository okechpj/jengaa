<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import ChatModal from '../components/ChatModal.vue';
import { ChevronLeft, MessageSquare, Calendar, Clock, Star, ShieldCheck } from 'lucide-vue-next';
import { getBookingById, getServiceById, updateBookingStatus, createReview } from '../services/api';

const route = useRoute();
const router = useRouter();
const booking = ref(null);
const isLoading = ref(true);
const error = ref(null);
const isChatOpen = ref(false);

const user = JSON.parse(localStorage.getItem('user') || '{}');
const isClient = user && user.role === 'CLIENT';

const providerRating = ref(null);
const providerReviewsCount = ref(null);
const reviewsList = ref([]);
const scheduledDateFormatted = ref('');
const scheduledTimeFormatted = ref('');

// Placeholder for provider details (since booking object might not have full provider profile)
const provider = ref({
    name: 'Provider',
    rating: 4.8,
    reviews: 128,
    avatar: null
});

const fetchBooking = async () => {
    try {
        const response = await getBookingById(route.params.id);
        booking.value = response.data.data;
        
        // In a real app, we might fetch provider details separately if not included
        // or use the providerId from booking to get more info.
        if (booking.value.providerName) {
             provider.value.name = booking.value.providerName; // Assuming providerName might be added or we use providerId
        }

        // Try to fetch service snapshot to display rating/review counts
        try {
            if (booking.value && booking.value.serviceId) {
                const svcRes = await getServiceById(booking.value.serviceId);
                const svc = svcRes?.data?.data;
                if (svc) {
                    // fetch reviews for the service and compute average if available
                    try {
                        const reviewsRes = await axios.get(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/reviews/services/${booking.value.serviceId}`);
                        const rv = reviewsRes.data.data || [];
                        reviewsList.value = rv;
                        if (rv.length > 0) {
                            const sum = rv.reduce((acc, it) => acc + (it.rating || 0), 0);
                            providerRating.value = sum / rv.length;
                            providerReviewsCount.value = rv.length;
                        } else {
                            providerRating.value = typeof svc.ratingAverage === 'number' ? svc.ratingAverage : null;
                            providerReviewsCount.value = typeof svc.reviewsCount === 'number' ? svc.reviewsCount : null;
                        }
                    } catch (rErr) {
                        console.warn('Failed to fetch reviews for average', rErr);
                        providerRating.value = typeof svc.ratingAverage === 'number' ? svc.ratingAverage : null;
                        providerReviewsCount.value = typeof svc.reviewsCount === 'number' ? svc.reviewsCount : null;
                    }
                    // Ensure provider name/avatar available in the UI
                    provider.value.name = booking.value.providerName || svc.providerName || provider.value.name;
                    if (svc.providerAvatar) provider.value.avatar = svc.providerAvatar;
                }
            }
        } catch (svcErr) {
            console.warn('Failed to fetch service for provider rating', svcErr);
        }

        // Parse and format scheduled date/time
        try {
            const parsed = parseDate(booking.value?.scheduledDate || booking.value?.createdAt);
            scheduledDateFormatted.value = parsed ? parsed.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBD';
            scheduledTimeFormatted.value = parsed ? parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'TBD';
        } catch (e) {
            scheduledDateFormatted.value = 'TBD';
            scheduledTimeFormatted.value = 'TBD';
        }

    } catch (err) {
        console.error("Failed to fetch booking", err);
        error.value = "Failed to load booking details.";
    } finally {
        isLoading.value = false;
    }
};

const cancelBooking = async () => {
    if (!booking.value || !booking.value.id) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const res = await updateBookingStatus(booking.value.id, 'CANCELLED');
        booking.value = res.data.data;
        alert('Booking cancelled');
    } catch (err) {
        alert(err.response?.data?.error || 'Failed to cancel booking');
    }
};

onMounted(fetchBooking);

const statusSteps = ['PENDING', 'ACCEPTED', 'COMPLETED'];
const currentStepIndex = computed(() => {
    if (!booking.value) return 0;
    if (booking.value.status === 'CANCELLED') return -1;
    return statusSteps.indexOf(booking.value.status);
});

const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString.seconds ? dateString.seconds * 1000 : dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = parseDate(dateString);
    if (!date) return 'TBD';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Robustly parse Firestore Timestamp shapes, ISO strings, or Date objects
 */
const parseDate = (d) => {
    if (!d) return null;
    // Firestore server timestamp object may come as { seconds: number, nanoseconds: number }
    if (d.seconds && typeof d.seconds === 'number') return new Date(d.seconds * 1000);
    if (d._seconds && typeof d._seconds === 'number') return new Date(d._seconds * 1000);
    // If the backend serialized an ISO string
    if (typeof d === 'string') {
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? null : dt;
    }
    if (d.toDate && typeof d.toDate === 'function') return d.toDate();
    if (d instanceof Date) return d;
    return null;
};

const statusLabel = computed(() => {
    if (!booking.value) return '';
    if (booking.value.status === 'PENDING') return 'Your request is pending provider approval.';
    if (booking.value.status === 'ACCEPTED') return 'Provider has accepted safely.';
    if (booking.value.status === 'COMPLETED') return 'Service completed.';
    if (booking.value.status === 'CANCELLED') return 'This booking was cancelled.';
    return '';
});

// Review Logic
const reviewRating = ref(0);
const reviewComment = ref('');
const isSubmittingReview = ref(false);

const submitReview = async () => {
    if (!booking.value || !booking.value.id) return;
    if (!reviewRating.value || reviewRating.value <= 0) {
        alert('Please select a rating before submitting.');
        return;
    }
    isSubmittingReview.value = true;
    try {
        const payload = {
            bookingId: booking.value.id,
            rating: reviewRating.value,
            comment: reviewComment.value || ''
        };
        await createReview(payload);
        alert('Review submitted. Thank you!');
        // clear form
        reviewRating.value = 0;
        reviewComment.value = '';
        // refresh booking (to pick up any changes if backend marks reviewed)
        await fetchBooking();
    } catch (err) {
        console.error('Failed to submit review', err);
        alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
        isSubmittingReview.value = false;
    }
};

</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans pb-20">
    <Navbar />

    <div class="max-w-3xl mx-auto px-4 pt-8">
      <!-- Back Link -->
      <button @click="router.back()" class="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors">
        <ChevronLeft class="w-5 h-5 mr-1" />
        Back to Bookings
      </button>

      <div v-if="isLoading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>

      <div v-else-if="error" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div class="text-red-500 font-bold mb-2">Error</div>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button @click="fetchBooking" class="text-blue-700 font-bold hover:underline">Try Again</button>
      </div>

      <div v-else>
          <!-- Header Card -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div class="p-8">
                  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div>
                          <div class="flex items-center gap-3 mb-2">
                              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                  {{ booking.status }}
                              </span>
                              <span class="text-gray-400 text-xs font-medium uppercase tracking-wider">ID: #{{ booking.id.slice(0, 8).toUpperCase() }}</span>
                          </div>
                          <h1 class="text-3xl font-extrabold text-gray-900">{{ booking.serviceTitle }}</h1>
                          <p class="text-gray-500 mt-1 max-w-md">Service requested from {{ booking.providerName || 'Provider' }}</p>
                          
                          <!-- Tracking Button -->
                          <button 
                            v-if="booking.status === 'ACCEPTED'"
                            @click="router.push(`/booking/track/${booking.id}`)"
                            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all animate-pulse"
                          >
                              <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                              Track Live Location
                          </button>
                                                    <button
                                                        v-if="isClient && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'"
                                                        @click="cancelBooking"
                                                        class="mt-4 ml-3 inline-block bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold py-2 px-4 rounded-full transition-all"
                                                    >
                                                            Cancel Booking
                                                    </button>
                      </div>
                      <div class="text-right">
                          <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Price</div>
                          <div class="text-4xl font-extrabold text-blue-900">Ksh {{ booking.servicePrice || '0.00' }}</div>
                      </div>
                  </div>

                  <!-- Progress Bar -->
                   <div class="relative py-8 px-4" v-if="booking.status !== 'CANCELLED'">
                        <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                        <div 
                            class="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-500"
                            :style="{ width: `${currentStepIndex * 50}%` }"
                        ></div>

                        <div class="relative flex justify-between w-full">
                            <div v-for="(step, index) in statusSteps" :key="step" class="flex flex-col items-center group">
                                <div 
                                    :class="`w-8 h-8 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300 ${index <= currentStepIndex ? 'bg-blue-600 border-white shadow-md text-white' : 'bg-white border-gray-200 text-transparent'}`"
                                >
                                    <svg v-if="index <= currentStepIndex" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div :class="`mt-3 text-xs font-bold uppercase tracking-wide transition-colors ${index <= currentStepIndex ? 'text-blue-900' : 'text-gray-400'}`">
                                    {{ step.charAt(0) + step.slice(1).toLowerCase() }}
                                </div>
                                <div class="text-[10px] text-gray-400 font-medium mt-0.5">
                                    <!-- Date placeholder, could be real data if we tracked status change times -->
                                    {{ index === 0 ? formatDate(booking.createdAt) : '' }}
                                </div>
                            </div>
                        </div>
                   </div>
                   <div v-else class="bg-red-50 text-red-700 p-4 rounded-xl text-center font-bold">
                       Booking Cancelled
                   </div>
              </div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Provider Info -->
              <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Service Provider</h3>
                      <div class="flex items-center gap-4">
                          <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl overflow-hidden">
                              <img v-if="provider.avatar" :src="provider.avatar" alt="Provider" class="w-full h-full object-cover">
                              <span v-else>👨‍🔧</span>
                          </div>
                          <div>
                              <div v-if="isClient" class="text-xl font-bold text-gray-900">{{ provider.name }}</div>
                              <div v-else class="text-xl font-bold text-gray-900">{{ booking.client?.name || booking.clientName || 'Client' }}</div>
                              <div class="flex items-center text-sm text-blue-600 font-bold mt-1">
                                  <Star v-if="isClient" class="w-4 h-4 fill-current mr-1" />
                                  <span v-if="isClient && providerRating !== null">{{ providerRating.toFixed(1) }}</span>
                                  <!-- <span v-else>{{ provider.rating }}</span> -->
                                  <span v-if="isClient" class="text-gray-400 font-medium ml-1">({{ providerReviewsCount ?? provider.reviews }} reviews)</span>
                              </div>
                                                            <div v-if="!isClient" class="flex items-center text-sm text-blue-600 font-bold mt-1">
                                                                <span v-if="booking.clientLocation && booking.clientLocation.address">{{ booking.clientLocation.address }}</span>
                                                                <span v-else-if="booking.clientLocation && booking.clientLocation.lat && booking.clientLocation.lng">{{ booking.clientLocation.lat }}, {{ booking.clientLocation.lng }}</span>
                                                                <span v-else>Location not provided</span>
                                                            </div>
                          </div>
                      </div>
                  </div>
                  
                          <button @click="isChatOpen = true" class="w-full mt-8 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <MessageSquare class="w-4 h-4" />
                      Message Provider
                  </button>
                          <ChatModal :bookingId="booking.id" :isOpen="isChatOpen" :otherName="provider.name" @close="isChatOpen = false" />
              </div>

              <!-- Date & Time -->
               <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
                  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Scheduled Date & Time</h3>
                  
                  <div class="space-y-6">
                      <div class="flex items-start gap-4">
                          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Calendar class="w-5 h-5" />
                          </div>
                          <div>
                              <div class="text-gray-900 font-bold">{{ scheduledDateFormatted || formatDate(booking.scheduledDate) }}</div>
                              <div class="text-xs text-gray-500 font-medium">Visit Date</div>
                          </div>
                      </div>

                      <div class="flex items-start gap-4">
                          <div class="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                              <Clock class="w-5 h-5" />
                          </div>
                          <div>
                              <div class="text-gray-900 font-bold">{{ scheduledTimeFormatted || formatTime(booking.scheduledDate) }}</div>
                              <div class="text-xs text-gray-500 font-medium">Arrival Window</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>


          <!-- Review Section (Only if Completed) -->
          <div v-if="isClient && booking.status === 'COMPLETED'" class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Leave a Review</h2>
              <p class="text-gray-500 mb-8">How was your experience with {{ provider.name }}?</p>

              <div class="flex items-center gap-2 mb-6">
                  <button 
                    v-for="star in 5" 
                    :key="star" 
                    @click="reviewRating = star"
                    class="focus:outline-none transition-transform hover:scale-110"
                  >
                      <Star 
                        class="w-8 h-8 transition-colors" 
                        :class="star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" 
                      />
                  </button>
              </div>

              <textarea 
                v-model="reviewComment" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none h-32" 
                placeholder="Share your feedback with the community..."
              ></textarea>

              <div class="flex justify-end mt-6">
                  <button 
                    @click="submitReview" 
                    :disabled="isSubmittingReview"
                    class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                      <span v-if="!isSubmittingReview">Submit Review</span>
                      <span v-else>Submitting...</span>
                  </button>
              </div>
          </div>

      </div>
    </div>
  </div>
</template>
