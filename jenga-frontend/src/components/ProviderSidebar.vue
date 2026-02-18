<script setup>
import { LayoutDashboard, Briefcase, Calendar, DollarSign, Settings, LogOut, ArrowLeftRight } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/provider/dashboard' },
  { name: 'My Services', icon: Briefcase, path: '/provider/dashboard#services' }, // Point to section or page if exists
  { name: 'Bookings', icon: Calendar, path: '/provider/dashboard#bookings' },
  { name: 'Earnings', icon: DollarSign, path: '/provider/dashboard#earnings' },
  { name: 'Settings', icon: Settings, path: '/provider/dashboard#settings' },
];

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

const switchToUser = () => {
  router.push('/dashboard');
};
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-100 flex flex-col hidden lg:flex h-screen sticky top-0">
    <!-- Logo -->
    <div class="p-8 flex items-center gap-3">
      <div class="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div>
        <span class="text-xl font-bold text-gray-900 tracking-tight">Jengaa</span>
        <span class="block text-[10px] text-gray-400 font-bold tracking-widest uppercase">Provider Portal</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 space-y-2">
      <router-link 
        v-for="item in menuItems" 
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors group"
        active-class="bg-blue-50 text-blue-700 font-bold"
      >
        <component :is="item.icon" class="w-5 h-5 group-hover:text-blue-700 transition-colors" />
        {{ item.name }}
      </router-link>
    </nav>
    
    <!-- Footer Actions -->
    <div class="p-4 border-t border-gray-100 space-y-2">
      <button @click="switchToUser" class="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 bg-gray-100 font-bold rounded-xl hover:bg-gray-200 transition">
        <ArrowLeftRight class="w-4 h-4" />
        Switch to User
      </button>

      <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
        <LogOut class="w-5 h-5" />
        Log Out
      </button>
    </div>
  </aside>
</template>
