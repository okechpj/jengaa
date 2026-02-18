<script setup>
import { Search } from 'lucide-vue-next';
</script>

<template>
  <section class="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        
        <!-- Text Content -->
        <div class="text-center md:text-left">
          <h1 class="text-4xl md:text-6xl font-extrabold text-[#1e3a8a] leading-tight mb-6">
            Find Trusted <br class="hidden md:block" />
            Services. <span class="text-[#10b981]">Fast.</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Connect with verified professionals in your area for any home or business task. Quality work guaranteed.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start mb-12">
            <button class="flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
              <Search class="w-5 h-5" />
              Find a Service
            </button>
            <button class="bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0369a1] px-8 py-4 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto border border-transparent hover:border-blue-200">
              Become a Provider
            </button>
          </div>

          <!-- Social Proof -->
          <div class="flex items-center justify-center md:justify-start gap-4">
             <div class="flex -space-x-3">
                <img class="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" />
                <img class="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" />
                <img class="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" alt="User" />
                <div class="w-10 h-10 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-white text-xs font-bold">99+</div>
             </div>
             <p class="text-sm text-slate-500 font-medium">Trusted by over 20,000+ locals</p>
          </div>
        </div>

        <!-- Hero Image/Illustration -->
        <div class="relative hidden md:block">
            <!-- Decorative blobs -->
            <div class="absolute -top-10 -right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div class="absolute -bottom-10 -left-10 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            
            <!-- Main Image Placeholder (using a reliable placeholder that looks decent) -->
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
               <img src="https://images.unsplash.com/photo-1581578731117-104f2a863a30?auto=format&fit=crop&w=800&q=80" alt="Professional Worker" class="object-cover w-full h-[500px]" />
               
               <!-- Floating Card -->
               <div class="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50 max-w-xs animate-bounce-slow">
                 <div class="flex items-center gap-3">
                   <div class="bg-green-100 p-2 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                     </svg>
                   </div>
                   <div>
                     <p class="text-xs text-gray-500">Service Status</p>
                     <p class="text-sm font-bold text-gray-800">Job Completed!</p>
                   </div>
                 </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animate-bounce-slow {
    animation: bounce 3s infinite;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>
