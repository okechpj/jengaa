<script setup>
import { Star, MapPin } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
});

const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

// Placeholder images based on category (mapping to Unsplash or similar if available, else generic)
const getCategoryImage = (category) => {
    const images = {
        'cleaning': 'https://images.unsplash.com/photo-1581578731117-104f2a41795e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'plumbing': 'https://images.unsplash.com/photo-1504384308090-c54be3855833?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'carpentry': 'https://images.unsplash.com/photo-1622398925373-3f91b1e2e718?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'hvac': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'appliance-repair': 'https://images.unsplash.com/photo-1581092921461-eab6245b0262?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        'landscaping': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
    };
    return images[category] || 'https://images.unsplash.com/photo-1581578731117-104f2a41795e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80';
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
    <div class="relative h-48 bg-gray-100">
        <img :src="getCategoryImage(service.category)" :alt="service.title" class="w-full h-full object-cover" />
        <button class="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
    </div>
    
    <div class="p-5 flex-1 flex flex-col">
       <div class="flex justify-between items-start mb-2">
           <h3 class="font-bold text-lg text-gray-900 line-clamp-1" :title="service.title">{{ service.title }}</h3>
           <div class="flex items-center gap-1 text-sm font-medium text-gray-900">
               <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
               {{ service.ratingAverage > 0 ? service.ratingAverage.toFixed(1) : 'New' }}
           </div>
       </div>
       
       <div class="text-sm text-gray-500 mb-4">{{ service.providerName }}</div>

       <div class="mt-auto flex items-center justify-between">
           <div class="font-bold text-lg text-gray-900">{{ formatPrice(service.price) }}</div>
           <button 
                @click="router.push(`/booking/${service.id}`)"
                class="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition text-sm">
               Book Now
           </button>
       </div>
    </div>
  </div>
</template>
