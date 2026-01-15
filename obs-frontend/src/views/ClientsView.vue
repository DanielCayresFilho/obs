<template>
<div class="parent">
    
    <div class="div1">
      <Sidebar />
    </div>
    
    <div class="div2">
        <img src="../assets/images/logo-só-texto-amarelo.png" alt="">
    </div>
    
    <div class="div3">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Buscar cliente..."
        class="search-input"
      >
    </div>
    
    <div class="div4">
      <button @click="showModal = true" class="btn-new-client">+ Novo</button>
      
      <NewClientModal 
        :isOpen="showModal" 
        @close="showModal = false"
        @client-created="handleClientCreated"
      />
    </div>
    
    <div class="div5">
      <div v-if="loading" class="loading-message">
        Carregando clientes...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="filteredClients.length === 0" class="empty-message">
        {{ searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado' }}
      </div>

      <div v-else class="clients-grid">
        <div 
          v-for="client in filteredClients" 
          :key="client.id"
          class="client-card"
        >
          <div class="client-header">
            <div class="client-avatar" v-if="!client.clientPicture">
              {{ getInitials(client.name) }}
            </div>
            <div class="client-avatar-photo" v-else>
              <img :src="client.clientPicture" :alt="client.name" />
            </div>
            <div class="client-info">
              <h3 class="client-name">{{ client.name }}</h3>
              <p class="client-phone">{{ formatPhone(client.phone) }}</p>
            </div>
          </div>
          
          <div class="client-details">
            <div class="detail-item">
              <span class="detail-label">Nascimento:</span>
              <span class="detail-value">{{ formatBirthday(client.birthday) }}</span>
            </div>
            
            <div class="detail-item" v-if="client.instagram">
              <span class="detail-label">Insta:</span>
              <span class="detail-value">{{ client.instagram }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Cliente desde:</span>
              <span class="detail-value">{{ formatDate(client.createdAt) }}</span>
            </div>
          </div>
          
          <div class="client-actions">
            <button @click="viewClient(client)" class="btn-view">Ver Detalhes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edição (fora do loop) -->
    <UpdateClientModal 
      :isOpen="showUpdateModal" 
      :client="selectedClient"
      @close="showUpdateModal = false"
      @client-updated="handleClientUpdated"
      @client-deleted="handleClientDeleted"
    />
</div>
</template>

<style scoped>
div {
  background-color: #0f0f0f;
  color: white;
}

/* GRADE PRINCIPAL */
.parent {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(23, 1fr);
  gap: 10px;
  height: 100vh;
}

.div1 {
  grid-row: span 23 / span 23;
  grid-column: 1 / 2;
  display: flex;
  flex-direction: column;
}



.div3 {
  grid-column: span 3 / span 4;
  grid-column-start: 2;
  grid-row-start: 3;
  display: flex;
  align-items: center;

  position: relative;
  left: 20px;
}

.search-input {
  width: 90%;
  padding: 12px 20px;
  background-color: #121517;
  border: 2px solid #2a2d31;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  transition: border-color 0.3s;

}

.search-input:focus {
  outline: none;
  border-color: #cd8f35;
}

.search-input::placeholder {
  color: #666;
}

.div4 {
  grid-column-start: 6;
  grid-row-start: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-new-client {
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  border: none;
  border-radius: 10px;
  width: 80%;
  height: 48px;
  color: white;
  font-weight: bolder;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-new-client:hover {
  transform: scale(1.05);
}

.div5 {
  grid-column: span 5 / span 5;
  grid-row: span 20 / span 20;
  grid-column-start: 2;
  grid-row-start: 4;
  background-color: transparent;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
}

/* MENSAGENS DE ESTADO */
.loading-message,
.error-message,
.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #888;
}

.error-message {
  color: #ff6b6b;
}

/* GRID DE CLIENTES */
.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  background-color: transparent;
}

.client-card {
  background-color: #1a1d21;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.client-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(205, 143, 53, 0.2);
  border-color: #cd8f35;
}

.client-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  background-color: transparent;
}

.client-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #cd8f35 0%, #b87d2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.client-avatar-photo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #030303;
  background-color: #1a1d21;
}

.client-avatar-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.client-info {
  flex: 1;
  min-width: 0;
  background-color: transparent;
}

.client-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-phone {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  background-color: transparent
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  background-color: transparent
}

.detail-label {
  color: #cd8f35;
  font-weight: 600;
}

.detail-value {
  color: #ffffff;
  text-align: right;
}

.client-actions {
  display: flex;
  gap: 10px;
}

.btn-view {
  flex: 1;
  padding: 10px;
  background-color: #2a2d31;
  border: 1px solid #cd8f35;
  border-radius: 8px;
  color: #cd8f35;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background-color: #cd8f35;
  color: #000;
}

/* SCROLLBAR */
.div5::-webkit-scrollbar {
  width: 8px;
}

.div5::-webkit-scrollbar-track {
  background: #1a1d21;
  border-radius: 4px;
}

.div5::-webkit-scrollbar-thumb {
  background: #cd8f35;
  border-radius: 4px;
}

.div5::-webkit-scrollbar-thumb:hover {
  background: #b87d2e;
}

/* RESPONSIVIDADE */
@media (max-width: 1200px) {
  .clients-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .div2 img {
    max-width: 50%;
  }
}

@media (max-width: 768px) {
  .parent {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
    min-height: 100vh;
  }

  .div1 {
    grid-row: 1;
    grid-column: 1;
    height: auto;
  }

  .div2 {
    grid-column: 1;
    grid-row: 2;
    padding: 20px 0;
  }

  .div2 img {
    max-width: 60%;
  }

  .div3 {
    grid-column: 1;
    grid-row: 3;
    left: 0;
    padding: 0 20px;
  }

  .search-input {
    width: 100%;
  }

  .div4 {
    grid-column: 1;
    grid-row: 4;
    padding: 0 20px;
  }

  .btn-new-client {
    width: 100%;
  }

  .div5 {
    grid-column: 1;
    grid-row: 5;
    padding: 10px;
  }

  .clients-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>

<script setup>
import { API_BASE_URL } from '@/config/api';
import Sidebar from '@/components/Sidebar.vue';
import NewClientModal from '@/components/NewClientModal.vue';
import UpdateClientModal from '@/components/UpdateClientModal.vue';
</script>

<script>
export default {
  data() {
    return {
      clients: [],
      searchQuery: '',
      loading: true,
      error: null,
      showModal: false,
      showUpdateModal: false,
      selectedClient: null
    }
  },

  computed: {
    filteredClients() {
      if (!this.searchQuery) {
        return this.clients;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.clients.filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        (client.instagram && client.instagram.toLowerCase().includes(query))
      );
    }
  },

  mounted() {
    this.fetchClients();
  },

  methods: {
    async fetchClients() {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch(`${API_BASE_URL}/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar clientes');
        }

        this.clients = await response.json();

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    handleClientCreated(client) {
      console.log('Cliente criado:', client);
      this.fetchClients();
    },

    handleClientUpdated(client) {
      console.log('Cliente atualizado:', client);
      this.fetchClients();
    },

    handleClientDeleted(clientId) {
      console.log('Cliente excluído:', clientId);
      this.fetchClients();
    },

    viewClient(client) {
      this.selectedClient = client;
      this.showUpdateModal = true;
    },

    getInitials(name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },

    formatPhone(phone) {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
      }
      return phone;
    },

    formatBirthday(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
}
</script>