<template>
  <section class="py-20 bg-[#111827] relative overflow-hidden">
     <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 bg-[#1f2937] p-10 md:p-16 rounded-3xl shadow-2xl border border-gray-700">
        <div class="max-w-xl">
           <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">Ready to get things done?</h2>
           <p class="text-gray-400 text-lg mb-8">Join over 50,000 monthly active users and find your next trusted professional today.</p>
           
           <div class="flex flex-col sm:flex-row gap-4">
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
                Get Started Now
              </button>
              <button class="bg-transparent border border-gray-600 hover:border-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition hover:bg-gray-800">
                Download App
              </button>
           </div>
        </div>
        
        <!-- Illustration/Graphic Placeholder -->
         <div class="relative w-full max-w-sm hidden md:block">
            <div class="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
            <!-- Simple device mock or abstract shape -->
            <div class="relative bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
               <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                     <div class="h-2 w-24 bg-gray-600 rounded mb-2"></div>
                     <div class="h-2 w-16 bg-gray-700 rounded"></div>
                  </div>
               </div>
               <div class="space-y-3">
                  <div class="h-20 bg-gray-700/50 rounded-xl w-full"></div>
                  <div class="h-20 bg-gray-700/50 rounded-xl w-full"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </section>
</template>
