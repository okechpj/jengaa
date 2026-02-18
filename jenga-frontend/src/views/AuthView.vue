<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { User, Mail, Phone, Lock, Eye, EyeOff, Briefcase, Search, Loader2 } from 'lucide-vue-next';
import api from '../services/api';

const router = useRouter();
const route = useRoute();

const isSignUp = computed(() => route.path === '/signup');
const userType = ref('client'); // 'client' or 'provider'
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
});

// Clear errors and form when switching routes (optional, but good UX)
watch(() => route.path, () => {
  errorMessage.value = '';
  form.value = { name: '', email: '', phone: '', password: '' };
});

const selectUserType = (type) => {
  userType.value = type;
};

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    if (isSignUp.value) {
      // Registration Logic
      const payload = {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password,
        role: userType.value.toUpperCase() // FIX: Uppercase role for backend
      };
      
      const response = await api.post('/auth/register', payload);
      
      const { token, user } = response.data.data;

       if (token) {
           localStorage.setItem('token', token);
           localStorage.setItem('user', JSON.stringify(user));
           
           const redirectPath = user.role === 'PROVIDER' ? '/provider/dashboard' : '/dashboard';
           router.push(redirectPath);
       } else {
           router.push('/login'); // Redirect to login on success
       }

    } else {
      // Login Logic
      const payload = {
        email: form.value.email,
        password: form.value.password
      };

      const response = await api.post('/auth/login', payload);
      
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
       
      const redirectPath = user.role === 'PROVIDER' ? '/provider/dashboard' : '/dashboard';
      router.push(redirectPath);
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = error.response?.data?.message || 'An error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- Top Bar with Logo -->
    <div class="px-8 py-6 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="bg-blue-900 text-white p-1.5 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
           </svg>
        </div>
        <span class="font-bold text-xl text-gray-900 tracking-tight">Jengaa</span>
      </div>
      <div class="text-sm font-medium">
        {{ isSignUp ? 'Already have an account?' : 'Don\'t have an account?' }}
        <router-link :to="isSignUp ? '/login' : '/signup'" class="text-blue-700 hover:underline ml-1">
          {{ isSignUp ? 'Log in' : 'Sign up' }}
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-lg border border-gray-100">
        
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900 mb-2">
            {{ isSignUp ? 'Create your account' : 'Welcome back' }}
          </h1>
          <p class="text-gray-500">
            {{ isSignUp ? 'Join the Jengaa community and start building today.' : 'Enter your details to access your account.' }}
          </p>
        </div>
        
        <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center">
            {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit">
          
          <!-- Role Selection (Sign Up Only) -->
          <div v-if="isSignUp" class="mb-8">
             <p class="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">I want to...</p>
             <div class="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  @click="selectUserType('client')"
                  :class="`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${userType === 'client' ? 'border-blue-700 bg-blue-50/50 ring-1 ring-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`"
                >
                   <Search :class="`w-6 h-6 mb-3 ${userType === 'client' ? 'text-blue-700' : 'text-gray-400'}`" />
                   <span class="font-bold text-gray-900 text-sm mb-1">Hire a pro</span>
                   <span class="text-xs text-gray-500">Find talent for your project</span>
                </button>

                <button 
                  type="button"
                  @click="selectUserType('provider')"
                  :class="`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${userType === 'provider' ? 'border-blue-700 bg-blue-50/50 ring-1 ring-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`"
                >
                   <Briefcase :class="`w-6 h-6 mb-3 ${userType === 'provider' ? 'text-blue-700' : 'text-gray-400'}`" />
                   <span class="font-bold text-gray-900 text-sm mb-1">Provide services</span>
                   <span class="text-xs text-gray-500">Grow your business here</span>
                </button>
             </div>
          </div>

          <div class="space-y-5">
            <!-- Full Name (Sign Up Only) -->
            <div v-if="isSignUp">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div class="relative">
                 <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User class="h-5 w-5 text-gray-400" />
                 </div>
                 <input v-model="form.name" type="text" required class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none" placeholder="John Doe">
              </div>
            </div>

            <!-- Email Address -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
               <div class="relative">
                 <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail class="h-5 w-5 text-gray-400" />
                 </div>
                 <input v-model="form.email" type="email" required class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none" placeholder="john@example.com">
              </div>
            </div>

            <!-- Phone Number (Sign Up Only) -->
            <div v-if="isSignUp">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
               <div class="relative">
                 <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone class="h-5 w-5 text-gray-400" />
                 </div>
                 <input v-model="form.phone" type="tel" required class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none" placeholder="+1 (555) 000-0000">
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
               <div class="relative">
                 <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock class="h-5 w-5 text-gray-400" />
                 </div>
                 <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required class="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none" :placeholder="isSignUp ? 'Min. 8 characters' : 'Enter your password'">
                 <div class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" @click="showPassword = !showPassword">
                    <component :is="showPassword ? EyeOff : Eye" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                 </div>
              </div>
            </div>
          </div>

          <button type="submit" :disabled="isLoading" class="w-full mt-8 bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="!isLoading">{{ isSignUp ? 'Sign Up' : 'Log In' }}</span>
            <Loader2 v-else class="animate-spin h-5 w-5" />
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          <p class="text-xs text-center text-gray-400 mt-6 leading-relaxed">
            By clicking "{{ isSignUp ? 'Sign Up' : 'Log In' }}", you agree to Jengaa's <a href="#" class="underline hover:text-gray-600">Terms of Service</a> and <a href="#" class="underline hover:text-gray-600">Privacy Policy</a>.
          </p>

        </form>
      </div>
    </div>
  </div>
</template>
