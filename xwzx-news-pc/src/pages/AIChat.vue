<template>
  <div class="ai-chat-container">
    <div class="chat-content">
      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-content">
            <div v-if="message.role === 'assistant' && message.content === ''" class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div v-else v-html="formatMessage(message.content)"></div>
          </div>
        </div>
      </div>

      <div class="input-container">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="1"
          autosize
          placeholder="请输入问题..."
          class="chat-input"
          @keypress.enter.prevent="sendMessage"
        />
        <el-button
          type="primary"
          class="send-button"
          :disabled="isLoading || !userInput.trim()"
          @click="sendMessage"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import * as marked from 'marked';
import DOMPurify from 'dompurify';
import { apiConfig } from '../config/api';
import { useUserStore } from '../store/user';

const userStore = useUserStore();

const messages = ref([
  { role: 'assistant', content: '你好！我是AI助手，有什么可以帮助你的吗？' }
]);
const userInput = ref('');
const messagesContainer = ref(null);
const isLoading = ref(false);

const formatMessage = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(marked.parse(content));
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  if (!userStore.token) {
    ElMessage.warning('请先登录后再使用 AI 问答');
    return;
  }

  const userMessage = userInput.value.trim();
  messages.value.push({ role: 'user', content: userMessage });
  userInput.value = '';

  messages.value.push({ role: 'assistant', content: '' });

  await nextTick();
  scrollToBottom();

  isLoading.value = true;
  try {
    await fetchAIResponse(userMessage);
  } catch (error) {
    console.error('Error fetching AI response:', error);
    messages.value[messages.value.length - 1].content = `发生错误: ${error.message || '请检查网络或稍后重试'}`;
    ElMessage.error('请求失败');
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const fetchAIResponse = async (userMessage) => {
  const historyForApi = messages.value
    .slice(0, -2)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .filter((m) => m.content && m.content.trim() !== '')
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch(`${apiConfig.baseURL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: userStore.token,
    },
    body: JSON.stringify({
      message: userMessage,
      history: historyForApi,
      stream: false,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err =
      payload.message ||
      (typeof payload.detail === 'string' ? payload.detail : null) ||
      `HTTP ${response.status}`;
    throw new Error(err);
  }

  if (payload.code !== 200) {
    throw new Error(payload.message || 'AI 请求失败');
  }

  const reply = payload.data?.reply?.trim() || '';
  if (!reply) {
    messages.value[messages.value.length - 1].content = '抱歉，没有收到有效回复。';
    return;
  }

  messages.value[messages.value.length - 1].content = reply;
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(messages, () => {
  nextTick(scrollToBottom);
}, { deep: true });

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  background: #f7f8fa;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 16px;
  max-width: 75%;
  display: flex;
}

.user-message {
  margin-left: auto;
  justify-content: flex-end;
}

.ai-message {
  margin-right: auto;
  justify-content: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 14px;
  word-break: break-word;
  font-size: 15px;
  line-height: 1.6;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.user-message .message-content {
  background-color: #1677ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-content {
  background-color: #fff;
  color: #333;
  border: 1px solid #eee;
  border-bottom-left-radius: 4px;
}

.input-container {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background-color: #fff;
  border-radius: 12px;
  margin: 0 20px 10px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
}

.chat-input {
  flex: 1;
  margin-right: 10px;
}

.send-button {
  align-self: flex-end;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
}

.message-content pre {
  background-color: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid #eee;
}

.message-content code {
  background-color: #f2f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.message-content img {
  max-width: 100%;
  border-radius: 6px;
  margin: 6px 0;
}

.typing-indicator {
  display: flex;
  padding: 4px 0;
  align-items: center;
}

.typing-indicator span {
  height: 7px;
  width: 7px;
  background-color: #bbb;
  border-radius: 50%;
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

:deep(p) { margin: 6px 0; }
:deep(ul), :deep(ol) { padding-left: 20px; margin: 6px 0; }
:deep(a) { color: #1677ff; }
:deep(h1),:deep(h2),:deep(h3),:deep(h4) { margin: 10px 0 6px; line-height: 1.4; }
</style>