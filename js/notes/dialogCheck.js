(function () {
  const STORAGE_KEYS = {
    CHAT_STATES: 'chatStates',
    CHAT_DATA_PREFIX: 'chatData_'
  };

  class ChatManager {
    constructor() {
      this.initializeChats();
      this.startPeriodicCheck();
    }

    initializeChats() {
      document
        .querySelectorAll(".sf_sidebar_companies_list .sf_sidebar_company_chat")
        .forEach((chat) => {
          this.applyChatState(chat);
          this.addChatEventListeners(chat);
        });
    }

    addChatEventListeners(chat) {
      if (chat.dataset.listenerAdded) return;

      chat.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleChatCheck(chat);
      });

      chat.addEventListener("click", (e) => {
        const chatId = chat.getAttribute("data-id");
        this.handleChatClick(chatId, chat);
      });

      chat.dataset.listenerAdded = "true";
    }

    toggleChatCheck(chat) {
      const chatId = chat.getAttribute("data-id");
      const isChecked = chat.classList.toggle("checked");
      this.updateChatState(chatId, isChecked);
    }

    handleChatClick(chatId, chat) {
      const chatData = this.getChatData(chatId);
    }

    getChatData(chatId) {
      const key = `${STORAGE_KEYS.CHAT_DATA_PREFIX}${chatId}`;
      return JSON.parse(localStorage.getItem(key)) || {};
    }

    saveChatData(chatId, data) {
      const key = `${STORAGE_KEYS.CHAT_DATA_PREFIX}${chatId}`;
      localStorage.setItem(key, JSON.stringify(data));
    }

    updateChatState(chatId, isChecked) {
      let chatStates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_STATES)) || {};
      if (isChecked) {
        chatStates[chatId] = { checked: true };
      } else {
        delete chatStates[chatId];
      }
      localStorage.setItem(STORAGE_KEYS.CHAT_STATES, JSON.stringify(chatStates));
    }

    applyChatState(chat) {
      const chatId = chat.getAttribute("data-id");
      if (!chatId) return;

      const chatStates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_STATES)) || {};
      chat.classList.toggle("dialog-check", chatStates[chatId]?.checked);
    }

    handleChatClosed(chatId) {
      const chatData = this.getChatData(chatId);
      
      if (chatData) {
        if (chatData.saveNote) {
          chatData.indicatorFixed = false;
          this.saveChatData(chatId, chatData);
        } else {
          localStorage.removeItem(`${STORAGE_KEYS.CHAT_DATA_PREFIX}${chatId}`);
        }
        this.updateChatState(chatId, false);
      }
    }

    startPeriodicCheck() {
      setInterval(() => {
        const currentChats = document.querySelectorAll(
          ".sf_sidebar_companies_list .sf_sidebar_company_chat"
        );
        const existingChatIds = Array.from(currentChats).map(chat => 
          chat.getAttribute("data-id")
        );

        Object.keys(localStorage)
          .filter(key => key.startsWith(STORAGE_KEYS.CHAT_DATA_PREFIX))
          .forEach(key => {
            const chatId = key.replace(STORAGE_KEYS.CHAT_DATA_PREFIX, "");
            if (!existingChatIds.includes(chatId)) {
              this.handleChatClosed(chatId);
            }
          });
      }, 15000);
    }
  }

  const chatManager = new ChatManager();
})();
