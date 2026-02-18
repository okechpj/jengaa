<script setup>
import { ref } from 'vue';
import { X, Loader2 } from 'lucide-vue-next';
import { createService } from '../services/api';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'service-added']);

const form = ref({
    title: '',
    category: 'plumbing',
    price: '',
    description: ''
});

const isSubmitting = ref(false);
const error = ref(null);

const categories = [
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'carpentry', name: 'Carpentry' },
    { id: 'painting', name: 'Painting' },
    { id: 'hvac', name: 'HVAC' },
    { id: 'appliance-repair', name: 'Appliance Repair' },
    { id: 'landscaping', name: 'Landscaping' }
];

const handleSubmit = async () => {
    // Basic validation
    if (!form.value.title || !form.value.price || !form.value.description) {
        error.value = "All fields are required.";
        return;
    }

    isSubmitting.value = true;
    error.value = null;

    try {
        const payload = {
            ...form.value,
            price: parseFloat(form.value.price)
        };
        
        await createService(payload);
        
        // Reset form
        form.value = {
            title: '',
            category: 'plumbing',
            price: '',
            description: ''
        };

        emit('service-added');
        emit('close');
        alert("Service added successfully!");
    } catch (err) {
        console.error(err);
        error.value = err.response?.data?.error || "Failed to create service.";
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div @click="emit('close')" class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
    
    <!-- Modal -->
    <div class="bg-white rounded-3xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 class="text-xl font-bold text-gray-900">Add New Service</h2>
            <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X class="w-5 h-5" />
            </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-6 overflow-y-auto">
            <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2">
                <span>⚠️</span> {{ error }}
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Title</label>
                    <input 
                      v-model="form.title" 
                      type="text" 
                      placeholder="e.g. Broken Pipe Repair" 
                      class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                        <select 
                          v-model="form.category"
                          class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
                        >
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price ($)</label>
                        <input 
                          v-model="form.price" 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00" 
                          class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      v-model="form.description" 
                      rows="4" 
                      placeholder="Describe what this service includes..." 
                      class="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
                    ></textarea>
                </div>
            </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button @click="emit('close')" type="button" class="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">
                Cancel
            </button>
            <button 
              @click="handleSubmit" 
              :disabled="isSubmitting"
              class="px-8 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                <span>{{ isSubmitting ? 'Creating...' : 'Create Listing' }}</span>
            </button>
        </div>
    </div>
  </div>
</template>
