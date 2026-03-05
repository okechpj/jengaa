<script setup>
import { ref, watch, onMounted } from 'vue';
import { X, Loader2, Star } from 'lucide-vue-next';
import { getServiceById } from '../services/api';
import axios from 'axios';

const props = defineProps({
  serviceId: String,
  isOpen: Boolean
});
const emit = defineEmits(['close']);

const service = ref(null);
const reviews = ref([]);
const averageRating = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchDetails = async (id) => {
  if (!id) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await getServiceById(id);
    service.value = res.data.data;
    // fetch reviews
    const reviewsRes = await axios.get(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/reviews/services/${id}`);
    reviews.value = reviewsRes.data.data || [];
    if (reviews.value.length > 0) {
      const sum = reviews.value.reduce((acc, it) => acc + (it.rating || 0), 0);
      averageRating.value = sum / reviews.value.length;
    } else {
      averageRating.value = service.value && typeof service.value.ratingAverage === 'number' ? service.value.ratingAverage : null;
    }
  } catch (err) {
    console.error('Failed to load service details', err);
    error.value = err.response?.data?.error || 'Failed to load details';
  } finally {
    loading.value = false;
  }
};

watch(() => props.serviceId, (id) => {
  if (props.isOpen && id) fetchDetails(id);
});

onMounted(() => {
  if (props.isOpen && props.serviceId) fetchDetails(props.serviceId);
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="emit('close')" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative z-10 overflow-hidden">
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-bold">Service Details</h3>
        <button @click="emit('close')" class="p-2">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 max-h-[70vh] overflow-y-auto">
        <div v-if="loading" class="flex justify-center py-10">
          <Loader2 class="w-8 h-8 animate-spin" />
        </div>

        <div v-else>
          

          <div v-if="service" class="space-y-4">
            <div class="w-full h-64 bg-gray-100 rounded-md overflow-hidden">
              <img :src="service.image || (service.category && `https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80`)" class="w-full h-full object-cover" />
            </div>

            <div>
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold">{{ service.title }}</h2>
                  <div class="text-sm text-gray-500">by {{ service.providerName }}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-xl">Ksh. {{ (service.price || 0).toLocaleString('en-KE') }}</div>
                  <div class="flex items-center gap-1 text-sm text-gray-600">
                    <Star class="w-4 h-4 text-yellow-400" />
                    {{ averageRating !== null && averageRating !== undefined ? averageRating.toFixed(1) : (service.ratingAverage ? service.ratingAverage.toFixed(1) : 'New') }}
                  </div>
                </div>
              </div>

              <p class="mt-4 text-gray-700">{{ service.description }}</p>

              <div class="mt-6">
                <h4 class="font-bold">Reviews</h4>
                <div v-if="reviews.length === 0" class="text-sm text-gray-500">No reviews yet.</div>
                <ul class="space-y-3 mt-3">
                  <li v-for="r in reviews" :key="r.id" class="border rounded-md p-3 bg-gray-50">
                    <div class="flex items-center justify-between">
                      <div class="font-bold">{{ r.clientName }}</div>
                      <div class="text-sm text-gray-600">{{ r.rating }} ★</div>
                    </div>
                    <div class="text-sm text-gray-700 mt-2">{{ r.comment }}</div>
                  </li>
                </ul>
              </div>

              <div class="mt-6">
                <h4 class="font-bold">Next Steps</h4>
                <div class="mt-2 text-sm text-gray-600">You can book this service using the "Book Now" button on the card, or contact the provider for more details.</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t flex justify-end gap-3 bg-gray-50">
        <button @click="emit('close')" class="px-4 py-2 bg-white border rounded">Close</button>
      </div>
    </div>
  </div>
</template>
