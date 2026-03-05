<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end justify-center p-4">
    <div @click="close" class="absolute inset-0 bg-black/50"></div>
    <div class="bg-white rounded-t-2xl shadow-xl w-full max-w-lg z-10">
      <div class="p-4 border-b flex items-center justify-between">
        <div class="font-bold">Chat with {{ otherName }}</div>
        <div class="flex items-center gap-3">
          <button @click="handleRequestEndSession" :disabled="pendingEndRequest" class="text-sm px-3 py-1 rounded bg-red-100 text-red-700">
            <span v-if="!pendingEndRequest">End Session</span>
            <span v-else>Requested...</span>
          </button>
          <button @click="close" class="text-gray-500">Close</button>
        </div>
      </div>

      <div class="p-4 h-96 overflow-y-auto flex flex-col" ref="scrollRoot">
        <div v-if="loading" class="text-center text-sm text-gray-500">Loading...</div>
        <div v-else>
          <div v-for="m in messages" :key="m.id" class="mb-3">
            <div :class="m.senderId === currentUserId ? 'text-right' : 'text-left'">
              <div :class="['inline-block px-4 py-2 rounded-lg', m.senderId === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900']">
                <div class="text-sm">{{ m.message }}</div>
                <div class="text-xs opacity-70 mt-1">{{ formatTimestamp(m.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Incoming end-session confirmation -->
      <div v-if="incomingEndRequest" class="p-4 border-t bg-yellow-50">
        <div class="text-sm font-bold">Session end requested by {{ incomingEndRequest.requester.name || incomingEndRequest.requester.id }}</div>
        <div class="text-xs text-gray-600 mt-2">Do you confirm ending this conversation? This will delete the chat history for both users.</div>
        <div class="mt-3 flex gap-2">
          <button @click="confirmEndSession(true)" class="px-4 py-2 bg-red-600 text-white rounded">Confirm End Session</button>
          <button @click="confirmEndSession(false)" class="px-4 py-2 bg-gray-200 rounded">Decline</button>
        </div>
      </div>

      <div class="p-4 border-t flex gap-2">
        <input v-model="text" @keydown.enter.prevent="handleSend" placeholder="Write a message..." class="flex-1 border rounded-lg px-3 py-2" />
        <button @click="handleSend" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { getMessagesForBooking } from '../services/api';

const props = defineProps({ bookingId: String, isOpen: Boolean, otherName: { type: String, default: 'Provider' } });
const emit = defineEmits(['close']);

const messages = ref([]);
const loading = ref(false);
const text = ref('');
const socket = ref(null);
const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id || null;
const scrollRoot = ref(null);
const pendingEndRequest = ref(false);
const incomingEndRequest = ref(null);

const formatTimestamp = (t) => {
  if (!t) return '';
  // handle Firestore timestamp shapes
  if (t.seconds) return new Date(t.seconds * 1000).toLocaleString();
  if (t._seconds) return new Date(t._seconds * 1000).toLocaleString();
  return new Date(t).toLocaleString();
};

const loadHistory = async () => {
  if (!props.bookingId) return;
  loading.value = true;
  try {
    const res = await getMessagesForBooking(props.bookingId);
    messages.value = res.data.data || [];
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('Failed to load messages', err);
  } finally {
    loading.value = false;
  }
};

const ensureConnected = () => {
  if (!getSocket() || !getSocket().connected) {
    const token = localStorage.getItem('token');
    socket.value = connectSocket(token);
  } else {
    socket.value = getSocket();
  }
}

const joinRoom = () => {
  if (!socket.value) return;
  socket.value.emit('joinConversation', props.bookingId, (res) => {
    if (!res || !res.success) {
      console.warn('Failed to join conversation', res && res.error);
    }
  });
}

const handleNewMessage = (msg) => {
  messages.value.push(msg);
  nextTick(scrollToBottom);
}

const handleEndSessionRequested = (payload) => {
  // payload: { bookingId, requester }
  if (!payload || payload.bookingId !== props.bookingId) return;
  // if requester is current user, set pending flag
  if (payload.requester && payload.requester.id === currentUserId) {
    pendingEndRequest.value = true;
    return;
  }
  // otherwise show incoming request prompt
  incomingEndRequest.value = payload;
};

const handleEndSessionDeclined = (payload) => {
  if (!payload || payload.bookingId !== props.bookingId) return;
  pendingEndRequest.value = false;
  alert('The other user declined to end the session.');
};

const handleConversationClosed = (payload) => {
  if (!payload || payload.bookingId !== props.bookingId) return;
  alert('This conversation has been closed. Messages will be removed.');
  messages.value = [];
  // close the modal
  emit('close');
};

const handleRequestEndSession = () => {
  if (!socket.value) {
    alert('Not connected');
    return;
  }
  socket.value.emit('requestEndSession', props.bookingId, (res) => {
    if (res && res.success) {
      pendingEndRequest.value = true;
    } else {
      alert(res && res.error ? res.error : 'Failed to request end session');
    }
  });
};

const confirmEndSession = (confirm) => {
  if (!socket.value) return;
  socket.value.emit('confirmEndSession', { bookingId: props.bookingId, confirm }, (res) => {
    if (res && res.success) {
      incomingEndRequest.value = null;
      pendingEndRequest.value = false;
      if (!confirm) {
        alert('You declined to end the session.');
      }
    } else {
      alert(res && res.error ? res.error : 'Failed to confirm end session');
    }
  });
};

const handleSend = () => {
  if (!text.value || !text.value.trim()) return;
  if (!socket.value) return;
  const payload = { bookingId: props.bookingId, message: text.value.trim() };
  socket.value.emit('sendMessage', payload, (res) => {
    if (res && res.success && res.data) {
      // message will also be received via newMessage, but append optimistically
      // messages.value.push(res.data);
      text.value = '';
    } else {
      alert(res && res.error ? res.error : 'Failed to send message');
    }
  });
}

const scrollToBottom = () => {
  if (scrollRoot.value) {
    scrollRoot.value.scrollTop = scrollRoot.value.scrollHeight;
  }
}

onMounted(async () => {
  if (!props.isOpen) return;
  ensureConnected();
  socket.value.on('newMessage', handleNewMessage);
  socket.value.on('endSessionRequested', handleEndSessionRequested);
  socket.value.on('endSessionDeclined', handleEndSessionDeclined);
  socket.value.on('conversationClosed', handleConversationClosed);
  joinRoom();
  await loadHistory();
});

watch(() => props.isOpen, async (v) => {
  if (v) {
    ensureConnected();
    socket.value.on('newMessage', handleNewMessage);
    socket.value.on('endSessionRequested', handleEndSessionRequested);
    socket.value.on('endSessionDeclined', handleEndSessionDeclined);
    socket.value.on('conversationClosed', handleConversationClosed);
    joinRoom();
    await loadHistory();
  } else {
    if (socket.value) {
      socket.value.off('newMessage', handleNewMessage);
      socket.value.off('endSessionRequested', handleEndSessionRequested);
      socket.value.off('endSessionDeclined', handleEndSessionDeclined);
      socket.value.off('conversationClosed', handleConversationClosed);
    }
  }
});

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.off('newMessage', handleNewMessage);
    socket.value.off('endSessionRequested', handleEndSessionRequested);
    socket.value.off('endSessionDeclined', handleEndSessionDeclined);
    socket.value.off('conversationClosed', handleConversationClosed);
  }
  // do not disconnect global socket here to allow reuse across modals
});


const close = () => emit('close');
</script>
