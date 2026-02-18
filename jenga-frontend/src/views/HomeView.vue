<script setup>
import Navbar from '../components/Navbar.vue';
import HeroSection from '../components/HeroSection.vue';
import CategorySection from '../components/CategorySection.vue';
import HowItWorksSection from '../components/HowItWorksSection.vue';
import TestimonialsSection from '../components/TestimonialsSection.vue';
import CTASection from '../components/CTASection.vue';
import Footer from '../components/Footer.vue';
</script>

<template>
  <div class="font-sans antialiased text-gray-900 bg-white">
    <Navbar />
    <main>
      <HeroSection />
      <CategorySection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </main>
    <Footer />
  </div>
</template>
