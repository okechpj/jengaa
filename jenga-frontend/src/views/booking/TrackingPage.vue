<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import { getBookingById, updateProviderLocation } from '../../services/api';
import { Phone, MessageSquare, ShieldCheck } from 'lucide-vue-next';

const route = useRoute();
const booking = ref(null);
const mapContainer = ref(null);
let map = null;
let providerMarker = null;
let clientMarker = null;
let pollingInterval = null;

// Mock user role check (in real app, use auth store)
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isProvider = computed(() => user.role === 'PROVIDER');

const fetchBooking = async () => {
    try {
        const response = await getBookingById(route.params.bookingId);
        booking.value = response.data.data;
        updateMapMarkers();
    } catch (err) {
        console.error("Fetch error", err);
    }
};

const updateMapMarkers = () => {
    if (!map || !booking.value) return;

    const L = window.L;

    // Routing Line
    let routeLine = null;

    // Client Marker
    if (!booking.value.clientLocation) {
        console.warn("Client location missing, using default fallback.");
        booking.value.clientLocation = { lat: -1.2921, lng: 36.8219 };
    }

    if (booking.value.clientLocation) {
        const { lat, lng } = booking.value.clientLocation;
        console.log("Creating Client Marker at:", lat, lng);
        if (!clientMarker) {
            const clientIcon = L.divIcon({
                className: 'beacon-marker beacon-red',
                html: `<div class="beacon-pulse"></div><div class="beacon-core"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            clientMarker = L.marker([lat, lng], {icon: clientIcon}).addTo(map).bindPopup("Client Location");
        }
    }

    // Provider Marker
    if (booking.value.providerLocation) {
        const { lat, lng } = booking.value.providerLocation;
        if (!providerMarker) {
             const providerIcon = L.divIcon({
                className: 'beacon-marker beacon-blue',
                html: `<div class="beacon-pulse"></div><div class="beacon-core"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            providerMarker = L.marker([lat, lng], {icon: providerIcon}).addTo(map).bindPopup("Provider Location").openPopup();
        } else {
            // Animate move
            providerMarker.setLatLng([lat, lng]);
        }
    }

    // Fit Bounds & Draw Line
    if (booking.value.clientLocation && booking.value.providerLocation) {
        const clientLatLng = [booking.value.clientLocation.lat, booking.value.clientLocation.lng];
        const providerLatLng = [booking.value.providerLocation.lat, booking.value.providerLocation.lng];
        
        // Draw/Update Line
        if (window.routeLine) {
            window.routeLine.setLatLngs([providerLatLng, clientLatLng]);
        } else {
            window.routeLine = L.polyline([providerLatLng, clientLatLng], {
                color: 'blue',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(map);
        }

        // Fit bounds (only if not manually moved recently? for now always fit to show progress)
        const bounds = L.latLngBounds([clientLatLng, providerLatLng]);
        map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
    } else if (booking.value.clientLocation) {
        map.setView([booking.value.clientLocation.lat, booking.value.clientLocation.lng], 15);
    }
};

const initMap = () => {
    if (!mapContainer.value) return;
    const L = window.L;
    if (!L) return;

    // Default view
    map = L.map(mapContainer.value).setView([-1.2921, 36.8219], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
};

const startLocationTracking = () => {
    if (!navigator.geolocation) {
        console.error("Geolocation not supported");
        return;
    }

    // specificId for clearing watch
    const watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Send update to backend
                await updateProviderLocation(booking.value.id, { 
                    lat: latitude, 
                    lng: longitude 
                });
                
                // Update local state immediately
                if (!booking.value.providerLocation) booking.value.providerLocation = {};
                booking.value.providerLocation.lat = latitude;
                booking.value.providerLocation.lng = longitude;
                
                updateMapMarkers();
            } catch (err) {
                console.error("Failed to update location", err);
            }
        },
        (err) => console.error("Location tracking error", err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
    
    return watchId;
};

let watchId = null;

onMounted(async () => {
    setTimeout(() => {
        initMap();
        fetchBooking();
    }, 100);

    // If Provider: Start tracking real location
    // If Client: Poll for provider location updates
    
    if (isProvider.value) {
        // Wait for booking to be fetched to get ID, then start tracking
        const checkBooking = setInterval(() => {
            if (booking.value && booking.value.id) {
                clearInterval(checkBooking);
                watchId = startLocationTracking();
            }
        }, 1000);
    } else {
        // Client: Poll every 5s for updates
        pollingInterval = setInterval(() => {
             fetchBooking();
        }, 5000);
    }
});

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
});

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
});

const statusColor = computed(() => {
    const s = booking.value?.status;
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
    if (s === 'ACCEPTED') return 'bg-blue-100 text-blue-700'; // On the way logic could be here
    if (s === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (s === 'CANCELLED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
});

const statusText = computed(() => {
     const s = booking.value?.status;
     if (s === 'ACCEPTED') return 'Driver is on the way';
     return s;
});

const distanceInfo = computed(() => {
    if (!booking.value?.clientLocation || !booking.value?.providerLocation) return { dist: '...', time: '...' };
    
    const L = window.L;
    if (!L) return { dist: '...', time: '...' };

    const client = L.latLng(booking.value.clientLocation.lat, booking.value.clientLocation.lng);
    const provider = L.latLng(booking.value.providerLocation.lat, booking.value.providerLocation.lng);
    
    const distMeters = client.distanceTo(provider);
    const distKm = (distMeters / 1000).toFixed(1);
    
    // Assume average speed 40km/h for city driving => 40000m / 60min = ~666 m/min
    const timeMin = Math.ceil(distMeters / 666);
    
    return {
        dist: `${distKm} km`,
        time: `${timeMin}`
    };
});
</script>

<template>
  <div class="h-screen w-full bg-gray-100 flex flex-col relative overflow-hidden">
    <!-- Map (Full Screen) -->
    <div ref="mapContainer" class="absolute inset-0 z-0"></div>

    <!-- Top Overlay (Status) -->
    <div class="absolute top-0 left-0 w-full p-4 z-10 flex justify-center">
        <div v-if="booking" :class="`px-6 py-3 rounded-full shadow-lg font-bold text-sm uppercase tracking-wider backdrop-blur-md ${statusColor}`">
            {{ statusText }}
        </div>
    </div>

    <!-- Bottom Card -->
    <div class="absolute bottom-0 left-0 w-full p-4 z-10">
        <div v-if="booking" class="bg-white rounded-3xl shadow-2xl p-6 mb-4 max-w-md mx-auto">
             <div class="flex items-center gap-4 mb-6">
                 <div class="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow">
                     <img src="https://i.pravatar.cc/150?img=11" alt="Provider" class="w-full h-full object-cover">
                 </div>
                 <div>
                     <h2 class="text-xl font-bold text-gray-900">{{ booking.providerName || 'Provider' }}</h2>
                     <div class="flex items-center text-yellow-500 font-bold text-sm">
                         ★ 4.9 <span class="text-gray-400 font-medium ml-1">(120 jobs)</span>
                     </div>
                     <div class="text-gray-500 text-xs mt-1">Toyota Prius • KBA 123A</div>
                 </div>
                 <div class="ml-auto text-right">
                     <div class="text-2xl font-extrabold text-blue-900">{{ distanceInfo.time }}</div>
                     <div class="text-xs font-bold text-gray-400 uppercase">min away</div>
                     <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ distanceInfo.dist }}</div>
                 </div>
             </div>

             <div class="grid grid-cols-2 gap-3">
                 <button class="bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                     <MessageSquare class="w-5 h-5" />
                     Message
                 </button>
                 <button class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-800/20">
                     <Phone class="w-5 h-5" />
                     Call Now
                 </button>
             </div>
             
             <!-- Safety -->
             <div class="mt-6 flex items-center justify-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 py-2 rounded-lg">
                 <ShieldCheck class="w-4 h-4" />
                 Verified Professional
             </div>
        </div>
    </div>

    <!-- Close/Home Button -->
    <button @click="$router.push(user.role === 'PROVIDER' ? '/provider/dashboard' : '/dashboard')" class="absolute top-6 left-6 z-20 bg-white p-3 rounded-full shadow-lg text-gray-700 hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    </button>
  </div>
</template>

<style>
/* Global styles for Leaflet custom icons */
.beacon-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    overflow: visible !important; /* Crucial for pulse animation spillover */
}

.beacon-core {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    position: relative;
    z-index: 10;
}

.beacon-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    opacity: 0;
    z-index: 1;
    animation: pulse-animation 2s infinite;
}

.beacon-red .beacon-core { background-color: #ef4444 !important; }
.beacon-red .beacon-pulse { background-color: rgba(239, 68, 68, 0.8) !important; animation-delay: 1s; } /* Increased opacity */

.beacon-blue .beacon-core { background-color: #2563eb !important; }
.beacon-blue .beacon-pulse { background-color: rgba(37, 99, 235, 0.6) !important; }

@keyframes pulse-animation {
    0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(2.5);
        opacity: 0;
    }
}
</style>
