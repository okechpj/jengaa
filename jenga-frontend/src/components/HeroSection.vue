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
            
            <!-- Main Image Placeholder (background image for better responsiveness) -->
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
               <div class="w-full h-[500px] hero-pattern" role="img" aria-label="Decorative pattern representing professional services"></div>

               <!-- Floating Card -->
               
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

/* Pattern background for hero (subtle blue/green diagonal grid) */
.hero-pattern {
  background-color: #eaf6ff;
  background-image:
    linear-gradient(135deg, rgba(16,185,129,0.06) 25%, transparent 25%),
    linear-gradient(225deg, rgba(30,58,138,0.04) 25%, transparent 25%),
    linear-gradient(45deg, rgba(16,185,129,0.06) 25%, transparent 25%),
    linear-gradient(315deg, rgba(30,58,138,0.04) 25%, transparent 25%);
  background-size: 40px 40px, 40px 40px, 40px 40px, 40px 40px;
  background-position: 0 0, 0 0, 20px 20px, 20px 20px;
}
</style>
