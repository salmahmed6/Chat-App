// Chat App JavaScript
class ChatApp {
    constructor() {
      this.socket = io();
      this.user = null;
      this.accessToken = null;
      this.activeChat = null;
      this.isSignup = false;
      this.chats = [
        {
          id: '1',
          name: 'Team Standup',
          type: 'group',
          lastMessage: 'Great work everyone!',
          timestamp: '2 min ago',
          unread: 3,
          avatar: '👥',
          participants: ['John', 'Jane', 'Mike', 'Sarah']
        },
        {
          id: '2',
          name: 'Design Team',
          type: 'group',
          lastMessage: 'New mockups are ready',
          timestamp: '5 min ago',
          unread: 1,
          avatar: '🎨',
          participants: ['Alice', 'Bob', 'Carol']
        },
        {
          id: '3',
          name: 'John Doe',
          type: 'direct',
          lastMessage: 'See you tomorrow!',
          timestamp: '1 hour ago',
          unread: 0,
          avatar: '👤'
        },
        {
          id: '4',
          name: 'Jane Smith',
          type: 'direct',
          lastMessage: 'Thanks for the help',
          timestamp: '3 hours ago',
          unread: 2,
          avatar: '👩'
        },
        {
          id: '5',
          name: 'Project Alpha',
          type: 'group',
          lastMessage: 'Deadline moved to Friday',
          timestamp: '1 day ago',
          unread: 0,
          avatar: '🚀',
          participants: ['Team Lead', 'Developer 1', 'Developer 2']
        }
      ];
      this.messages = {};
      this.currentReactionMessage = null;
      
      this.init();
    }
  
    init() {
      this.setupEventListeners();
      this.handleURLParams();
      this.renderChats();
    }
  
    setupEventListeners() {
      // Auth form
      document.getElementById('login-form').addEventListener('submit', (e) => this.handleAuth(e));
      document.getElementById('switch-to-signup').addEventListener('click', () => this.toggleAuthMode());
      document.getElementById('toggle-password').addEventListener('click', () => this.togglePassword());
  
      // Chat functionality
      document.getElementById('message-form').addEventListener('submit', (e) => this.handleSendMessage(e));
      document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e));
      
      // Mobile menu
      document.getElementById('mobile-menu').addEventListener('click', () => this.toggleSidebar());
      document.getElementById('mobile-menu-chat').addEventListener('click', () => this.toggleSidebar());
      document.getElementById('view-chats-mobile').addEventListener('click', () => this.toggleSidebar());
      document.getElementById('close-sidebar').addEventListener('click', () => this.closeSidebar());
      document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());
  
      // Reaction picker
      document.getElementById('reaction-picker').addEventListener('click', (e) => this.handleReaction(e));
      document.addEventListener('click', (e) => this.handleClickOutside(e));
  
      // Socket events
      this.socket.on('chat message', (msg) => this.receiveMessage(msg));
      this.socket.on('typing', ({ username }) => this.showTyping(username));
  
      // Message input typing
      let typingTimer;
      document.getElementById('message-input').addEventListener('input', () => {
        if (this.user && this.activeChat) {
          this.socket.emit('typing', { room: this.activeChat, username: this.user.username });
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            document.getElementById('typing-indicator').textContent = '';
          }, 3000);
        }
      });
    }
  
    handleURLParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const errorMessage = document.getElementById('error-message');
      
      if (urlParams.get('error') === 'verify-email') {
        this.showError('Please verify your email to continue.');
      } else if (urlParams.get('verified') === 'true') {
        this.showError('Email verified successfully! Please log in.');
      } else if (urlParams.get('accessToken')) {
        this.accessToken = urlParams.get('accessToken');
        this.user = {
          id: urlParams.get('userId'),
          username: urlParams.get('username'),
          email: urlParams.get('email'),
          isVerified: urlParams.get('isVerified') === 'true'
        };
        
        if (!this.user.isVerified) {
          this.showError('Please verify your email to fully activate your account.');
        }
        
        this.showChatInterface();
        window.history.replaceState({}, document.title, '/');
      }
    }
  
    async handleAuth(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const username = formData.get('username');
      const email = formData.get('email');
      const password = formData.get('password');
      const endpoint = this.isSignup ? '/api/auth/signup' : '/api/auth/login';
  
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.isSignup ? { username, email, password } : { email, password })
        });
  
        const data = await response.json();
        
        if (response.ok) {
          this.accessToken = data.accessToken;
          this.user = data.user;
          
          if (!this.user.isVerified) {
            this.showError('Please verify your email to fully activate your account.');
          }
          
          this.showChatInterface();
        } else {
          this.showError(data.message);
        }
      } catch (error) {
        this.showError('Error: ' + error.message);
      }
    }
  
    toggleAuthMode() {
      this.isSignup = !this.isSignup;
      const title = document.getElementById('auth-title');
      const switchButton = document.getElementById('switch-to-signup');
      const usernameField = document.getElementById('username');
      const submitButton = document.querySelector('.auth-button');
      
      title.textContent = this.isSignup ? 'Create Account' : 'Welcome Back';
      switchButton.textContent = this.isSignup ? 'Switch to Login' : 'Switch to Signup';
      usernameField.style.display = this.isSignup ? 'block' : 'none';
      submitButton.textContent = this.isSignup ? 'Sign Up' : 'Sign In';
      
      this.clearError();
    }
  
    togglePassword() {
      const passwordField = document.getElementById('password');
      const toggleIcon = document.querySelector('#toggle-password i');
      
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
      } else {
        passwordField.type = 'password';
        toggleIcon.className = 'fas fa-eye';
      }
    }
  
    showError(message) {
      const errorDiv = document.getElementById('error-message');
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  
    clearError() {
      const errorDiv = document.getElementById('error-message');
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  
    showChatInterface() {
      document.getElementById('auth').style.display = 'none';
      document.getElementById('chat').style.display = 'flex';
      
      // Update user profile
      document.getElementById('user-name').textContent = this.user.username;
      document.getElementById('user-email').textContent = this.user.email;
      document.getElementById('user-avatar').textContent = this.user.username.charAt(0).toUpperCase();
      
      this.socket.emit('join room', 'general');
      this.loadSampleMessages();
    }
  
    renderChats() {
      const groupChats = this.chats.filter(chat => chat.type === 'group');
      const directChats = this.chats.filter(chat => chat.type === 'direct');
      
      this.renderChatList('group-chats', groupChats);
      this.renderChatList('direct-chats', directChats);
      
      document.getElementById('group-count').textContent = groupChats.length;
      document.getElementById('direct-count').textContent = directChats.length;
    }
  
    renderChatList(containerId, chats) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      
      chats.forEach(chat => {
        const li = document.createElement('li');
        li.className = 'chat-item';
        li.dataset.chatId = chat.id;
        
        li.innerHTML = `
          <div class="chat-avatar">${chat.avatar}</div>
          <div class="chat-info">
            <div class="chat-name">${chat.name}</div>
            <div class="chat-last-message">${chat.lastMessage}</div>
            ${chat.participants ? `<div class="chat-participants">${chat.participants.join(', ')}</div>` : ''}
          </div>
          <div class="chat-meta">
            <div class="chat-time">${chat.timestamp}</div>
            ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
          </div>
        `;
        
        li.addEventListener('click', () => this.selectChat(chat.id));
        container.appendChild(li);
      });
    }
  
    selectChat(chatId) {
      this.activeChat = chatId;
      const chat = this.chats.find(c => c.id === chatId);
      
      // Update active chat styling
      document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
      });
      document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('active');
      
      // Update chat header
      document.getElementById('chat-avatar').textContent = chat.avatar;
      document.getElementById('chat-name').textContent = chat.name;
      document.getElementById('chat-members').textContent = 
        chat.type === 'group' ? `${chat.participants.length} members` : '';
      
      // Show active chat, hide welcome screen
      document.getElementById('welcome-screen').style.display = 'none';
      document.getElementById('active-chat').style.display = 'flex';
      
      // Load messages for this chat
      this.loadChatMessages(chatId);
      
      // Close sidebar on mobile
      this.closeSidebar();
    }
  
    loadChatMessages(chatId) {
      // Sample messages for different chats
      const sampleMessages = {
        '1': [
          { id: '1', sender: 'John', content: 'Good morning team! Ready for today\'s standup?', timestamp: '9:00 AM', reactions: { '👍': ['Jane', 'Mike'], '❤️': ['Sarah'] } },
          { id: '2', sender: 'Jane', content: 'Yes! I finished the user authentication feature yesterday.', timestamp: '9:02 AM', reactions: { '🎉': ['John', 'Mike'] } },
          { id: '3', sender: 'Mike', content: 'Great work everyone! The new design looks amazing.', timestamp: '9:05 AM', reactions: {} }
        ],
        '2': [
          { id: '4', sender: 'Alice', content: 'I\'ve uploaded the new mockups to Figma', timestamp: '10:30 AM', reactions: { '👍': ['Bob'] } },
          { id: '5', sender: 'Bob', content: 'The color scheme looks perfect!', timestamp: '10:32 AM', reactions: { '❤️': ['Alice', 'Carol'] } }
        ],
        '3': [
          { id: '6', sender: 'John Doe', content: 'Hey! How are you doing?', timestamp: '2:00 PM', reactions: {} },
          { id: '7', sender: 'You', content: 'I\'m doing great! Thanks for asking.', timestamp: '2:02 PM', reactions: { '😊': ['John Doe'] } }
        ]
      };
      
      this.messages[chatId] = sampleMessages[chatId] || [];
      this.renderMessages();
    }
  
    loadSampleMessages() {
      // Load sample messages for all chats
      this.chats.forEach(chat => {
        this.loadChatMessages(chat.id);
      });
    }
  
    renderMessages() {
      const messagesContainer = document.getElementById('messages');
      messagesContainer.innerHTML = '';
      
      const chatMessages = this.messages[this.activeChat] || [];
      
      chatMessages.forEach(message => {
        const li = document.createElement('li');
        li.className = `message ${message.sender === 'You' || message.sender === this.user?.username ? 'own' : 'other'}`;
        li.dataset.messageId = message.id;
        
        li.innerHTML = `
          <div class="message-bubble ${message.sender === 'You' || message.sender === this.user?.username ? 'own' : 'other'}">
            ${message.sender !== 'You' && message.sender !== this.user?.username ? `<div class="message-sender">${message.sender}</div>` : ''}
            <div class="message-content">${message.content}</div>
            <div class="message-time">${message.timestamp}</div>
            <button class="reaction-button-trigger" data-message-id="${message.id}">
              <i class="fas fa-smile"></i>
            </button>
          </div>
          ${this.renderMessageReactions(message.reactions)}
        `;
        
        messagesContainer.appendChild(li);
      });
      
      this.scrollToBottom();
      this.setupMessageReactionTriggers();
    }
  
    renderMessageReactions(reactions) {
      if (!reactions || Object.keys(reactions).length === 0) return '';
      
      const reactionsHtml = Object.entries(reactions).map(([emoji, users]) => 
        `<button class="reaction-button ${users.includes(this.user?.username || 'You') ? 'active' : ''}" 
                 data-emoji="${emoji}">
           ${emoji} ${users.length}
         </button>`
      ).join('');
      
      return `<div class="message-reactions">${reactionsHtml}</div>`;
    }
  
    setupMessageReactionTriggers() {
      document.querySelectorAll('.reaction-button-trigger').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const messageId = button.dataset.messageId;
          this.showReactionPicker(messageId, button);
        });
      });
    }
  
    showReactionPicker(messageId, triggerButton) {
      this.currentReactionMessage = messageId;
      const picker = document.getElementById('reaction-picker');
      const rect = triggerButton.getBoundingClientRect();
      
      picker.style.display = 'flex';
      picker.style.top = `${rect.top - 50}px`;
      picker.style.left = `${rect.left}px`;
    }
  
    handleReaction(e) {
      if (e.target.dataset.emoji && this.currentReactionMessage) {
        const emoji = e.target.dataset.emoji;
        const messageId = this.currentReactionMessage;
        
        // Find the message and update reactions
        const chatMessages = this.messages[this.activeChat];
        const message = chatMessages.find(m => m.id === messageId);
        
        if (message) {
          if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
          }
          
          const userIndex = message.reactions[emoji].indexOf(this.user?.username || 'You');
          if (userIndex > -1) {
            message.reactions[emoji].splice(userIndex, 1);
            if (message.reactions[emoji].length === 0) {
              delete message.reactions[emoji];
            }
          } else {
            message.reactions[emoji].push(this.user?.username || 'You');
          }
          
          this.renderMessages();
        }
        
        this.hideReactionPicker();
      }
    }
  
    hideReactionPicker() {
      document.getElementById('reaction-picker').style.display = 'none';
      this.currentReactionMessage = null;
    }
  
    handleClickOutside(e) {
      const picker = document.getElementById('reaction-picker');
      if (!picker.contains(e.target) && !e.target.closest('.reaction-button-trigger')) {
        this.hideReactionPicker();
      }
    }
  
    handleSendMessage(e) {
      e.preventDefault();
      const input = document.getElementById('message-input');
      const content = input.value.trim();
      
      if (content && this.activeChat) {
        const newMessage = {
          id: Date.now().toString(),
          sender: this.user?.username || 'You',
          content: content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: {}
        };
        
        if (!this.messages[this.activeChat]) {
          this.messages[this.activeChat] = [];
        }
        
        this.messages[this.activeChat].push(newMessage);
        this.renderMessages();
        
        // Emit to socket
        this.socket.emit('chat message', {
          content: content,
          room: this.activeChat,
          userId: this.user?.id
        });
        
        input.value = '';
      }
    }
  
    receiveMessage(msg) {
      if (this.activeChat && this.messages[this.activeChat]) {
        const newMessage = {
          id: Date.now().toString(),
          sender: msg.sender,
          content: msg.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: {}
        };
        
        this.messages[this.activeChat].push(newMessage);
        this.renderMessages();
      }
    }
  
    showTyping(username) {
      const indicator = document.getElementById('typing-indicator');
      indicator.textContent = `${username} is typing...`;
      setTimeout(() => {
        indicator.textContent = '';
      }, 3000);
    }
  
    handleSearch(e) {
      const query = e.target.value.toLowerCase();
      const filteredChats = this.chats.filter(chat => 
        chat.name.toLowerCase().includes(query)
      );
      
      const groupChats = filteredChats.filter(chat => chat.type === 'group');
      const directChats = filteredChats.filter(chat => chat.type === 'direct');
      
      this.renderChatList('group-chats', groupChats);
      this.renderChatList('direct-chats', directChats);
    }
  
    toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      
      sidebar.classList.add('open');
      overlay.style.display = 'block';
    }
  
    closeSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    }
  
    scrollToBottom() {
      const container = document.getElementById('messages-container');
      container.scrollTop = container.scrollHeight;
    }
  }
  
  // Initialize the chat app when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
  });