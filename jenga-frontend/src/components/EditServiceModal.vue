<script setup>
import { ref, onMounted, watch } from 'vue';
import { X, Loader2 } from 'lucide-vue-next';
import { updateService } from '../services/api';
import { getAvailabilitiesForService, createAvailability, updateAvailability, deleteAvailability } from '../services/api';

const props = defineProps({ service: Object, isOpen: Boolean });
const emit = defineEmits(['close', 'updated']);

const form = ref({ title: '', description: '', category: '', price: 0, image: '' });
const isSubmitting = ref(false);
const error = ref(null);

watch(() => props.service, (s) => {
  if (s) {
    form.value = {
      title: s.title || '',
      description: s.description || '',
      category: s.category || 'plumbing',
      price: s.price || 0,
      image: s.image || ''
    };
  }
}, { immediate: true });

const submit = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;
    const payload = {
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      price: parseFloat(form.value.price),
      image: form.value.image || null
    };
    await updateService(props.service.id, payload);
    emit('updated');
    emit('close');
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Failed to update';
  } finally {
    isSubmitting.value = false;
  }
};

// Availability management
const availabilities = ref([]);
const loadingAvail = ref(false);
const newAvail = ref({ from: '', to: '', notes: '' });

const fetchAvail = async () => {
  if (!props.service) return;
  loadingAvail.value = true;
  try {
    const res = await getAvailabilitiesForService(props.service.id);
    availabilities.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch availabilities', err);
  } finally {
    loadingAvail.value = false;
  }
};

watch(() => props.service, () => { fetchAvail(); }, { immediate: true });

const addAvail = async () => {
  try {
    await createAvailability(props.service.id, newAvail.value);
    newAvail.value = { from: '', to: '', notes: '' };
    await fetchAvail();
  } catch (err) {
    console.error('Failed to create availability', err);
  }
};

const removeAvail = async (id) => {
  try {
    await deleteAvailability(id);
    await fetchAvail();
  } catch (err) {
    console.error('Failed to delete availability', err);
  }
};

const editAvail = async (id, updates) => {
  try {
    await updateAvailability(id, updates);
    await fetchAvail();
  } catch (err) {
    console.error('Failed to update availability', err);
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="emit('close')" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl relative z-10 overflow-hidden">
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-bold">Edit Service</h3>
        <button @click="emit('close')" class="p-2"><X class="w-5 h-5" /></button>
      </div>

      <div class="p-6">
        <div v-if="error" class="text-red-600 mb-3">{{ error }}</div>
        <div class="space-y-4">
          <input v-model="form.title" class="w-full p-3 border rounded" placeholder="Title" />
          <select v-model="form.category" class="w-full p-3 border rounded">
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="cleaning">Cleaning</option>
            <option value="carpentry">Carpentry</option>
            <option value="painting">Painting</option>
            <option value="hvac">HVAC</option>
            <option value="appliance-repair">Appliance Repair</option>
            <option value="landscaping">Landscaping</option>
          </select>
          <input v-model="form.price" type="number" class="w-full p-3 border rounded" placeholder="Price" />
          <input v-model="form.image" type="url" class="w-full p-3 border rounded" placeholder="Image URL" />
          <textarea v-model="form.description" class="w-full p-3 border rounded" rows="4" placeholder="Description"></textarea>
        </div>
      </div>
      <div class="p-6 border-t">
        <h4 class="font-bold mb-3">Availability</h4>
        <div class="space-y-2 mb-4">
          <div v-if="loadingAvail" class="text-sm text-gray-500">Loading...</div>
          <div v-else>
            <div v-if="availabilities.length === 0" class="text-sm text-gray-500">No availability set.</div>
            <ul class="space-y-2">
              <li v-for="a in availabilities" :key="a.id" class="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div class="text-sm">
                  <div class="font-bold">{{ new Date(a.from.seconds ? a.from.seconds*1000 : a.from).toLocaleString() }} - {{ new Date(a.to.seconds ? a.to.seconds*1000 : a.to).toLocaleString() }}</div>
                  <div class="text-gray-500 text-xs">{{ a.notes }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button @click="removeAvail(a.id)" class="text-red-600 text-sm">Delete</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-4">
          <input v-model="newAvail.from" type="datetime-local" class="p-2 border rounded" />
          <input v-model="newAvail.to" type="datetime-local" class="p-2 border rounded" />
        </div>
        <input v-model="newAvail.notes" placeholder="Notes" class="w-full p-2 border rounded mb-4" />
        <div class="flex justify-end gap-3">
          <button @click="emit('close')" class="px-4 py-2 bg-white border rounded">Cancel</button>
          <button @click="addAvail" class="px-4 py-2 bg-green-600 text-white rounded">Add Availability</button>
          <button @click="submit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-700 text-white rounded">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
