<script setup>
import { Zap, Wrench, Droplet, Briefcase } from 'lucide-vue-next';

const categories = [
  {
    name: "Electrical",
    description: "Certified Electricians",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    image: "https://images.unsplash.com/photo-1621905251189-08b96d50dc65?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Plumbing",
    description: "Expert Plumbers",
    icon: Wrench,
    color: "text-blue-500",
    bg: "bg-blue-50",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Cleaning",
    description: "Professional Cleaners",
    icon: Droplet,
    color: "text-cyan-500",
    bg: "bg-cyan-50",
    image: "https://images.unsplash.com/photo-1581578731117-104f2a863a30?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Repairs",
    description: "General Maintenance",
    icon: Briefcase,
    color: "text-orange-500",
    bg: "bg-orange-50",
    image: "https://images.unsplash.com/photo-1632737520005-2d7c0f167e41?auto=format&fit=crop&w=400&q=80"
  }
];
</script>

<template>
  <section id="categories" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-end mb-12">
        <div>
           <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
           <p class="text-gray-600 max-w-2xl">From emergency fixes to planned renovations, find the right expert for every job.</p>
        </div>
        <a href="#" class="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition">
          View all categories 
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="category in categories" :key="category.name" class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100">
          <div class="h-48 overflow-hidden relative">
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition z-10"></div>
            <img :src="category.image" :alt="category.name" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
            <div class="absolute top-4 left-4 z-20 bg-white p-2 rounded-lg shadow-sm">
                <component :is="category.icon" :class="`h-6 w-6 ${category.color}`" />
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{{ category.name }}</h3>
            <p class="text-sm text-gray-500">{{ category.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="mt-8 text-center md:hidden">
         <a href="#" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition">
          View all categories 
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>
