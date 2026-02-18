<script setup>
import { Twitter, Facebook, Instagram } from 'lucide-vue-next';
</script>

<template>
  <footer class="bg-white pt-20 pb-10 border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12 mb-16">
        <div class="col-span-2 lg:col-span-2">
           <a href="#" class="flex items-center gap-2 mb-6">
              <div class="bg-blue-600 text-white p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="font-bold text-xl text-blue-900 tracking-tight">Jengaa</span>
           </a>
           <p class="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
             Connecting quality service providers with customers who value speed and reliability. Your trusted neighborhood marketplace.
           </p>
           <div class="flex space-x-4">
              <a href="#" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition">
                <Facebook class="w-5 h-5" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition">
                <Twitter class="w-5 h-5" />
              </a>
               <a href="#" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition">
                <Instagram class="w-5 h-5" />
              </a>
           </div>
        </div>

        <div>
           <h4 class="font-bold text-gray-900 mb-6">Company</h4>
           <ul class="space-y-4 text-sm text-gray-500">
              <li><a href="#" class="hover:text-blue-600 transition">About Us</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Careers</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Press</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Impact</a></li>
           </ul>
        </div>

        <div>
           <h4 class="font-bold text-gray-900 mb-6">Services</h4>
           <ul class="space-y-4 text-sm text-gray-500">
              <li><a href="#" class="hover:text-blue-600 transition">Electrical</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Plumbing</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Handyman</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Gardening</a></li>
           </ul>
        </div>

        <div>
           <h4 class="font-bold text-gray-900 mb-6">Support</h4>
           <ul class="space-y-4 text-sm text-gray-500">
              <li><a href="#" class="hover:text-blue-600 transition">Help Center</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Safety</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Terms of Service</a></li>
              <li><a href="#" class="hover:text-blue-600 transition">Privacy</a></li>
           </ul>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
        <p>&copy; 2024 Jengaa Inc. All rights reserved.</p>
        <div class="flex space-x-6">
           <a href="#" class="hover:text-gray-600">English (US)</a>
           <a href="#" class="hover:text-gray-600">$ USD</a>
        </div>
      </div>
    </div>
  </footer>
</template>
