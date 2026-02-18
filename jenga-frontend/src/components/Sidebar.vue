<script setup>
import { LayoutDashboard, Calendar, User, HelpCircle, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = [
  { name: 'Browse Services', icon: LayoutDashboard, route: '/dashboard' },
  { name: 'My Bookings', icon: Calendar, route: '/bookings' },
  { name: 'Profile', icon: User, route: '/profile' },
  { name: 'Help Center', icon: HelpCircle, route: '/help' },
];

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
};
</script>

<template>
  <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
    <div class="p-6 flex items-center gap-3 mb-6">
       <div class="bg-blue-600 text-white p-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
       </div>
       <span class="font-bold text-2xl text-blue-900 tracking-tight">Jengaa</span>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <router-link 
        v-for="item in menuItems" 
        :key="item.name" 
        :to="item.route"
        class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition font-medium"
        active-class="bg-blue-50 text-blue-700 font-semibold"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-gray-100">
       <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 w-full transition font-medium">
          <LogOut class="w-5 h-5" />
          Log Out
       </button>
    </div>
  </aside>
</template>
