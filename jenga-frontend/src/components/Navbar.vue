<script setup>
import { Search, Menu, X } from 'lucide-vue-next';
import { ref } from 'vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20 items-center">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <router-link to="/" class="flex items-center gap-2">
            <div class="bg-blue-600 text-white p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span class="font-bold text-2xl text-blue-900 tracking-tight">Jengaa</span>
          </router-link>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" class="text-gray-600 hover:text-blue-600 font-medium transition">How it Works</a>
          <a href="#categories" class="text-gray-600 hover:text-blue-600 font-medium transition">Categories</a>
          <a href="#testimonials" class="text-gray-600 hover:text-blue-600 font-medium transition">Testimonials</a>
        </div>

        <!-- Right Side: Search & Auth -->
        <div class="hidden md:flex items-center space-x-4">
          <div class="relative">
             <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search class="h-4 w-4 text-gray-400" />
             </span>
             <input type="text" placeholder="Search services..." class="bg-gray-50 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          <router-link to="/login" class="text-gray-900 font-semibold hover:text-blue-600 px-4 py-2 transition">Login</router-link>
          <router-link to="/signup" class="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-full font-medium transition shadow-md hover:shadow-lg">Sign Up</router-link>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center md:hidden">
          <button @click="toggleMenu" class="text-gray-600 hover:text-blue-600 focus:outline-none">
            <Menu v-if="!isMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
      <div class="px-4 pt-4 pb-6 space-y-3">
        <a href="#how-it-works" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md">How it Works</a>
        <a href="#categories" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md">Categories</a>
        <a href="#testimonials" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md">Testimonials</a>
        <div class="mt-4 pt-4 border-t border-gray-100">
           <div class="relative mb-4">
             <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search class="h-4 w-4 text-gray-400" />
             </span>
             <input type="text" placeholder="Search services..." class="bg-gray-50 w-full text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <router-link to="/login" class="block w-full text-center px-4 py-3 text-gray-900 font-semibold border border-gray-200 rounded-lg mb-3 hover:bg-gray-50">Login</router-link>
          <router-link to="/signup" class="block w-full text-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Sign Up</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
