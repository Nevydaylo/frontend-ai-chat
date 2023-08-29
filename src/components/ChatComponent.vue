<template>
  <div class="chat-wrapper">
    <nav class="sidebar">
      <button @click="addNewChat" class="add-chat-button">+ New Chat</button>
      <div class="query-history">
  <div class="query-history-title">Query History</div>
  <div v-for="(query, index) in queryHistory" :key="index" class="query-history-item" @click="selectQuery(query)">
    <i class="fas fa-history query-icon"></i>
    {{ query }}
    <button @click="deleteQuery(index)" class="delete-query-button">
    <i class="fas fa-trash"></i>
  </button>
  </div>
</div>
    </nav>
    <div class="chat-container">
      <div class="chat-window">
        <div class="chat-messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', { 'bot-message': message.isBot }]">
             {{ message.text }}
          </div>
        </div>
      </div>
      <div class="input-container">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          class="input-field"
          type="text"
          placeholder="Type your message..."
        />
        <button @click="sendMessage" class="send-button">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import {connect_session, fetch_message} from "../backend_connector";
export default {
  data() {
    return {
      isBotTyping: false,
      typingDelay: 50,
      session_id: null,
      messages: [],
      inputMessage: '',
      chatHistory: [],
      queryHistory: [],
    };
  },
  mounted() {
  this.connect();
  const savedQueryHistory = localStorage.getItem('queryHistory');
  if (savedQueryHistory) {
    this.queryHistory = JSON.parse(savedQueryHistory);
  }
},
 
   methods: {
    async sendMessage() {
    if (this.inputMessage.trim() === "") {
      return;
    }

    this.messages.push({ text: this.inputMessage, session_id: this.session_id});
    this.queryHistory.push(this.inputMessage.substring(0,12));
      localStorage.setItem("queryHistory", JSON.stringify(this.queryHistory));
      await this.send(this.inputMessage);
      this.inputMessage = "";
    },

  async send(content) {
    this.messages.push({text: "", isBot: true});
    await this.fetchMessage(this.session_id, content);
  },

  async connect() {
    this.session_id = await connect_session();
    console.log("Session ID:", this.session_id);
    return this.session_id;
  },
  
  async fetchMessage(session_id, content) {
  await fetch_message(session_id, content, async chunk => {
      this.messages[this.messages.length - 1].text += chunk;
      await new Promise(resolve => setTimeout(resolve, this.typingDelay));
  });
},
async addNewChat (){
  this.messages = [];
  this.session_id = null;
  await this.connect();
},

selectQuery(query){
  this.messages.push({text: query, isBot: false})
},

deleteQuery(index) {
  const deletedQuery = this.queryHistory[index];
  const deletedChatId = deletedQuery.session_id;

  this.messages = this.messages.filter(
    (message) => message.session_id !== deletedChatId
  );

  
  this.queryHistory.splice(index, 1);
  localStorage.setItem("queryHistory", JSON.stringify(this.queryHistory));
    },
  },
};


</script>


<style scoped>

body {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f4f4;
}

.chat-container {
  background-size: cover;
  background-position: center;
  width: calc(100% - 200px);
  height: 100vh; 
  margin-left: 200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-window {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.message {
  padding: 8px;
  border-radius: 10px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, .2);
  margin-bottom: 10px;
  color: #fff;
  backdrop-filter: blur(20px);
  background: rgba(61, 22, 139, 1); 
}

.input-container {
  display: flex;
  align-items: center;
  padding: 10px;
}

.input-field {
  flex: 1;
  padding: 8px;
  border: 2px solid rgba(255, 255, 255, .2);
  border-radius: 20px;
  background: transparent;
  color: #fff;
}

.input-field::placeholder{
  color: #fff;
  font-size: 15px;
  text-align: center;
  font-family: 'Roboto', sans-serif;
  font-weight: 600;
}

.input-field:focus{
  outline: none;
}

.send-button {
  padding: 8px 12px;
  border: none;
  border-radius: 20px;
  background: transparent;
  backdrop-filter: blur(100px);
  border: 2px solid rgba(255, 255, 255, .2);
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
} 
.sidebar {
  background-color: rgba(61, 22, 139, 1);
  color: #fff;
  padding: 20px;
  width: 200px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  backdrop-filter: blur(10px);
}

.sidebar-link {
  display: block;
  padding: 10px 0;
  text-decoration: none;
  color: #fff;
  transition: background-color 0.3s;
}

.sidebar-link:hover {
  background-color: #555;
}

.chat-wrapper {
  background: url("img.jpg") no-repeat;
  background-size: cover;
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.add-chat-button {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.9);
  border: none;
  overflow: hidden;
  box-shadow: none;
  padding: 15px 20px;
  margin-top: 20px;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.add-chat-button:hover {
  color: rgba(255, 255, 255, 1);
}

.add-chat-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  transition: opacity 0.3s, border 0.3s;
}

.add-chat-button:hover::before {
  opacity: 0;
}

.add-chat-button::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: transparent;
  border-radius: 50%;
  transform: translate(-10px, -70px) scale(0.1);
  opacity: 0;
  z-index: -1;
  transition: transform 0.3s, opacity 0.3s, background-color 0.3s;
}

.add-chat-button:hover::after {
  opacity: 1;
  transform-origin: 100px 100px;
  transform: scale(1) translate(-10px, -70px);
}

.bot-message {
  font-family: "Open Sans";
  background: transparent;
  color: white; 
  border: 2px solid;
  }

  .query-history {
    display: flex;
    flex-direction: column;
    margin-top: 50px;
}

.query-history-title {
  font-size: 16px; 
  font-weight: bold;
  margin-bottom: 5px; 
}

.query-history ul {
  list-style: none;
  padding: 0;
}

.query-history-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: floralwhite;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
} 

.query-history-item:hover {
  background: linear-gradient(91.1deg, rgb(57, 31, 105) -2.3%, rgb(115, 43, 155) 44.4%, rgb(231, 75, 184) 103.4%);
  border-radius: 20px;
  white-space: pre;
  font-size: 16px;
  backdrop-filter: blur(10px);
}
.query-icon {
  margin-right: 8px; /* Добавляет небольшой отступ между иконкой и текстом */
  color: white; /* Устанавливает белый цвет иконки */
  font-size: 18px; 
  vertical-align: middle; 
}

.delete-query-button {
  border: none;
  border-radius: 5px;
  padding: 5px;
  margin-left: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}

.delete-query-button i {
  font-size: 14px;
}
.delete-query-button:hover {
  background-color: #ff3333;
}



</style>
