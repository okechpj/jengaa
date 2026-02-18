<script setup>
import { Search, Calendar, Smile } from 'lucide-vue-next';
</script>

<template>
  <section id="how-it-works" class="py-24 bg-[#1e40af] text-white overflow-hidden relative">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
       <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
       <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#10b981] blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      <h2 class="text-3xl md:text-5xl font-bold mb-16">Simple Steps to Peace of Mind</h2>

      <div class="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 relative">
         <!-- Connector Line (Desktop) -->
         <div class="hidden md:block absolute top-12 left-[18%] right-[18%] h-0.5 bg-blue-400/30 -z-10"></div>

         <!-- Step 1 -->
         <div class="flex-1 flex flex-col items-center max-w-sm">
           <div class="w-24 h-24 bg-[#2dd4bf] rounded-full flex items-center justify-center shadow-lg mb-6 relative group transform transition hover:scale-110">
             <div class="absolute -top-2 -right-2 w-8 h-8 bg-white text-[#1e40af] rounded-full flex items-center justify-center font-bold shadow-md">1</div>
             <Search class="w-10 h-10 text-white" />
           </div>
           <h3 class="text-2xl font-bold mb-4">Search</h3>
           <p class="text-blue-100 leading-relaxed">Browse thousands of verified professionals by skill, location, and real customer ratings.</p>
         </div>

         <!-- Step 2 -->
         <div class="flex-1 flex flex-col items-center max-w-sm">
           <div class="w-24 h-24 bg-[#2dd4bf] rounded-full flex items-center justify-center shadow-lg mb-6 relative group transform transition hover:scale-110">
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-white text-[#1e40af] rounded-full flex items-center justify-center font-bold shadow-md">2</div>
             <Calendar class="w-10 h-10 text-white" />
           </div>
           <h3 class="text-2xl font-bold mb-4">Book</h3>
           <p class="text-blue-100 leading-relaxed">Choose your preferred provider, schedule a convenient time, and pay securely online.</p>
         </div>

         <!-- Step 3 -->
         <div class="flex-1 flex flex-col items-center max-w-sm">
           <div class="w-24 h-24 bg-[#2dd4bf] rounded-full flex items-center justify-center shadow-lg mb-6 relative group transform transition hover:scale-110">
             <div class="absolute -top-2 -right-2 w-8 h-8 bg-white text-[#1e40af] rounded-full flex items-center justify-center font-bold shadow-md">3</div>
             <Smile class="w-10 h-10 text-white" />
           </div>
           <h3 class="text-2xl font-bold mb-4">Relax</h3>
           <p class="text-blue-100 leading-relaxed">Your professional arrives and completes the job. We hold funds until you're satisfied.</p>
         </div>
      </div>
    </div>
  </section>
</template>
