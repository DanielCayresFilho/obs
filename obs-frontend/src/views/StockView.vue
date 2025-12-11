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
        placeholder="Buscar item no estoque..."
        class="search-input"
      >
    </div>
    
    <div class="div4">
      <button @click="showModal = true" class="btn-new-stock">+ Novo Item</button>
      
      <NewStockModal 
        :isOpen="showModal" 
        @close="showModal = false"
        @stock-created="handleStockCreated"
      />
    </div>
    
    <div class="div5">
      <div v-if="loading" class="loading-message">
        <div class="spinner"></div>
        <p>Carregando estoque...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="filteredStock.length === 0" class="empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 16v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="12" height="12" rx="2"></rect>
        </svg>
        <p>{{ searchQuery ? 'Nenhum item encontrado' : 'Nenhum item no estoque' }}</p>
      </div>

      <div v-else class="stock-grid">
        <div 
          v-for="item in filteredStock" 
          :key="item.id"
          class="stock-card"
          :class="{ 'low-stock': item.quantity <= 5 && item.quantity > 0, 'out-of-stock': item.quantity === 0 }"
        >
          <div class="stock-header">
            <div class="stock-badge" :class="item.type">
              {{ item.type === 'intern' ? '🔧 Interno' : '💰 Venda' }}
            </div>
            <div class="stock-category">{{ item.category }}</div>
          </div>

          <div class="stock-body">
            <h3 class="stock-name">{{ item.name }}</h3>
            
            <div class="stock-details">
              <div class="detail-row">
                <span class="detail-label">Preço:</span>
                <span class="detail-value price">R$ {{ formatPrice(item.price) }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Quantidade:</span>
                <span class="detail-value" :class="getQuantityClass(item.quantity)">
                  {{ item.quantity }} un
                </span>
              </div>

              <div v-if="parseFloat(item.length) > 0" class="detail-row">
                <span class="detail-label">Comprimento:</span>
                <span class="detail-value">{{ formatPrice(item.length) }} ml/g</span>
              </div>

              <div v-if="parseFloat(item.usable) > 0" class="detail-row">
                <span class="detail-label">Utilizável:</span>
                <span class="detail-value">{{ formatPrice(item.usable) }} ml/g</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Cadastrado:</span>
                <span class="detail-value">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="stock-footer">
            <button @click="viewStock(item)" class="btn-edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              </svg>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edição -->
    <UpdateStockModal 
      :isOpen="showUpdateModal" 
      :stock="selectedStock"
      @close="showUpdateModal = false"
      @stock-updated="handleStockUpdated"
      @stock-deleted="handleStockDeleted"
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

.btn-new-stock {
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

.btn-new-stock:hover {
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

/* LOADING */
.loading-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #2a2d31;
  border-top-color: #cd8f35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-message p {
  font-size: 18px;
  color: #888;
}

/* MENSAGENS DE ESTADO */
.error-message,
.empty-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  height: 100%;
  font-size: 18px;
  color: #888;
}

.empty-message svg {
  opacity: 0.5;
}

.error-message {
  color: #ff6b6b;
}

/* GRID DE ESTOQUE */
.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  background-color: transparent;
}

.stock-card {
  background-color: #1a1d21;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
}

.stock-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(205, 143, 53, 0.2);
  border-color: #cd8f35;
}



.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  background-color: transparent;
}

.stock-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}


.stock-category {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  background-color: transparent;
}

.stock-body {
  flex: 1;
  background-color: transparent;
}

.stock-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 15px 0;
}

.stock-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: transparent;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  background-color: transparent;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(205, 143, 53, 0.1);
}

.detail-label {
  color: #888;
  font-weight: 600;
}

.detail-value {
  color: #ffffff;
  text-align: right;
  font-weight: 600;
}

.detail-value.price {
  color: #cd8f35;
  font-size: 16px;
  font-weight: bold;
}

.stock-footer {
  margin-top: 15px;
  background-color: transparent;
}

.btn-edit {
  width: 100%;
  padding: 12px;
  background-color: #2a2d31;
  border: 1px solid #cd8f35;
  border-radius: 8px;
  color: #cd8f35;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-edit:hover {
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

@media (max-width: 1400px) {
  .stock-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .stock-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup>
import { API_BASE_URL } from '@/config/api';
import Sidebar from '@/components/Sidebar.vue';
import NewStockModal from '@/components/NewStockModal.vue';
import UpdateStockModal from '@/components/UpdateStockModal.vue';
</script>

<script>
export default {
  data() {
    return {
      stock: [],
      searchQuery: '',
      loading: true,
      error: null,
      showModal: false,
      showUpdateModal: false,
      selectedStock: null
    }
  },

  computed: {
    filteredStock() {
      if (!this.searchQuery) {
        return this.stock;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.stock.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    }
  },

  mounted() {
    this.fetchStock();
  },

  methods: {
    async fetchStock() {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch(`${API_BASE_URL}/stock`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar estoque');
        }

        this.stock = await response.json();

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    handleStockCreated(stock) {
      console.log('Item criado:', stock);
      this.fetchStock();
    },

    handleStockUpdated(stock) {
      console.log('Item atualizado:', stock);
      this.fetchStock();
    },

    handleStockDeleted(stock) {
      console.log('Item excluído:', stock);
      this.fetchStock();
    },

    viewStock(stock) {
      this.selectedStock = stock;
      this.showUpdateModal = true;
    },

    getQuantityClass(quantity) {
      if (quantity === 0) return 'out';
      if (quantity <= 5) return 'low';
      return '';
    },

    formatPrice(value) {
      return parseFloat(value).toFixed(2).replace('.', ',');
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