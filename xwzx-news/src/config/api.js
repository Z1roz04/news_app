/**
 * API配置文件
 * 包含API基础URL和AI问答功能所需的API参数
 */

// API基础URL配置
export const apiConfig = {
  // 后端API基础URL
  baseURL: 'http://127.0.0.1:8000',
}

export const aiChatConfig = {
  // DeepSeek API地址
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
  
  // API Key (在此处填写你的 DeepSeek API Key)
  apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  
  // 使用的模型
  model: 'deepseek-chat'
}
