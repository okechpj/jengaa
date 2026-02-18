<script setup>
import { Star } from 'lucide-vue-next';

const testimonials = [
  {
    name: "Sarah Miller",
    role: "Homeowner, Austin",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    text: "Jengaa saved my weekend! I had a burst pipe at 9PM on a Friday and found an expert plumber within 10 minutes. He arrived quickly and fixed everything perfectly."
  },
  {
    name: "James Wilson",
    role: "Business Owner, NYC",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80",
    text: "Finding reliable cleaning staff for my office used to be a headache. With Jengaa, I can see ratings and insurance info upfront. Truly a game changer for pros."
  },
  {
    name: "Elena Rodriguez",
    role: "Property Manager",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    text: "The booking system is seamless. I manage 8 properties and Jengaa is my go-to for all maintenance needs. The providers are professional and punctual."
  }
];
</script>

<template>
  <section id="testimonials" class="py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Loved by the Community</h2>
         <div class="flex items-center justify-center gap-1 mb-2">
            <Star v-for="i in 5" :key="i" class="w-5 h-5 fill-current text-[#10b981]" />
         </div>
        <p class="text-gray-600 font-medium">4.9/5 from 10k+ reviews</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
         <div v-for="review in testimonials" :key="review.name" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
               <img :src="review.image" :alt="review.name" class="w-14 h-14 rounded-full object-cover ring-4 ring-gray-50" />
               <div>
                  <h4 class="font-bold text-gray-900">{{ review.name }}</h4>
                  <p class="text-sm text-gray-500">{{ review.role }}</p>
               </div>
            </div>
            <p class="text-gray-600 leading-relaxed italic">"{{ review.text }}"</p>
         </div>
      </div>
    </div>
  </section>
</template>
