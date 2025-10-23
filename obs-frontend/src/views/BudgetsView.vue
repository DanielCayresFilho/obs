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
        placeholder="Buscar orçamento..."
        class="search-input"
      >
    </div>

    <div class="div4">
      <button @click="showNewModal = true" class="btn-new-budget">+ Novo Orçamento</button>

      <NewBudgetModal
        :isOpen="showNewModal"
        @close="showNewModal = false"
        @budget-created="handleBudgetCreated"
      />
    </div>

    <div class="div5">
      <!-- Abas de filtro por status -->
      <div class="tabs-container">
        <button
          @click="selectedStatus = null"
          :class="['tab-btn', { active: selectedStatus === null }]"
        >
          Todos
        </button>
        <button
          @click="selectedStatus = 'pending'"
          :class="['tab-btn', { active: selectedStatus === 'pending' }]"
        >
          Pendentes
        </button>
        <button
          @click="selectedStatus = 'approved'"
          :class="['tab-btn', { active: selectedStatus === 'approved' }]"
        >
          Aprovados
        </button>
        <button
          @click="selectedStatus = 'rejected'"
          :class="['tab-btn', { active: selectedStatus === 'rejected' }]"
        >
          Recusados
        </button>
        <button
          @click="selectedStatus = 'converted'"
          :class="['tab-btn', { active: selectedStatus === 'converted' }]"
        >
          Convertidos
        </button>
      </div>

      <div v-if="loading" class="loading-message">
        Carregando orçamentos...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="filteredBudgets.length === 0" class="empty-message">
        {{ searchQuery ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento cadastrado' }}
      </div>

      <div v-else class="budgets-grid">
        <div
          v-for="budget in filteredBudgets"
          :key="budget.id"
          class="budget-card"
        >
          <div class="budget-header">
            <h3 class="budget-name">{{ budget.budgetName }}</h3>
            <span :class="['status-badge', `status-${budget.status}`]">
              {{ getStatusLabel(budget.status) }}
            </span>
          </div>

          <div class="budget-details">
            <div class="detail-item">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value">{{ budget.clientName }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Valor estimado:</span>
              <span class="detail-value">{{ formatCurrency(budget.estimatedPrice) }}</span>
            </div>

            <div class="detail-item" v-if="budget.discount > 0">
              <span class="detail-label">Desconto:</span>
              <span class="detail-value">{{ formatCurrency(budget.discount) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Valor final:</span>
              <span class="detail-value final-price">{{ formatCurrency(budget.finalPrice) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Validade:</span>
              <span class="detail-value">{{ formatDate(budget.validityDate) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Criado em:</span>
              <span class="detail-value">{{ formatDate(budget.createdAt) }}</span>
            </div>
          </div>

          <div class="budget-actions">
            <button @click="viewBudget(budget)" class="btn-view">Ver Detalhes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Visualização -->
    <ViewBudgetModal
      :isOpen="showViewModal"
      :budget="selectedBudget"
      @close="showViewModal = false"
      @budget-updated="handleBudgetUpdated"
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

.btn-new-budget {
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

.btn-new-budget:hover {
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

/* TABS DE FILTRO */
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background-color: transparent;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  background-color: #1a1d21;
  border: 2px solid #2a2d31;
  border-radius: 8px;
  color: #888;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  border-color: #cd8f35;
  color: #cd8f35;
}

.tab-btn.active {
  background-color: #cd8f35;
  border-color: #cd8f35;
  color: #000;
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

/* GRID DE ORÇAMENTOS */
.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  background-color: transparent;
}

.budget-card {
  background-color: #1a1d21;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.budget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(205, 143, 53, 0.2);
  border-color: #cd8f35;
}

.budget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a2d31;
  background-color: transparent;
}

.budget-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-pending {
  background-color: rgba(205, 143, 53, 0.2);
  color: #cd8f35;
}

.status-approved {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-rejected {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-converted {
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.budget-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  background-color: transparent;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  background-color: transparent;
}

.detail-label {
  color: #cd8f35;
  font-weight: 600;
}

.detail-value {
  color: #ffffff;
  text-align: right;
}

.final-price {
  font-size: 16px;
  font-weight: bold;
  color: #4caf50;
}

.budget-actions {
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
  .budgets-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .parent {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .div1 {
    grid-row: 1;
    grid-column: 1;
  }

  .div2 {
    grid-column: 1;
    padding: 20px 0;
  }

  .div3, .div4 {
    grid-column: 1;
    left: 0;
    padding: 0 20px;
  }

  .div5 {
    grid-column: 1;
    padding: 10px;
  }

  .budgets-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import NewBudgetModal from '@/components/NewBudgetModal.vue';
import ViewBudgetModal from '@/components/ViewBudgetModal.vue';
</script>

<script>
export default {
  data() {
    return {
      budgets: [],
      searchQuery: '',
      selectedStatus: null,
      loading: true,
      error: null,
      showNewModal: false,
      showViewModal: false,
      selectedBudget: null
    }
  },

  computed: {
    filteredBudgets() {
      let filtered = this.budgets;

      // Filtrar por status
      if (this.selectedStatus) {
        filtered = filtered.filter(budget => budget.status === this.selectedStatus);
      }

      // Filtrar por busca
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(budget =>
          budget.budgetName.toLowerCase().includes(query) ||
          budget.clientName.toLowerCase().includes(query)
        );
      }

      return filtered;
    }
  },

  mounted() {
    this.fetchBudgets();
  },

  methods: {
    async fetchBudgets() {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');

        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch('http://localhost:3000/budgets', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar orçamentos');
        }

        this.budgets = await response.json();

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    handleBudgetCreated() {
      this.fetchBudgets();
    },

    handleBudgetUpdated() {
      this.fetchBudgets();
    },

    viewBudget(budget) {
      this.selectedBudget = budget;
      this.showViewModal = true;
    },

    getStatusLabel(status) {
      const labels = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'rejected': 'Recusado',
        'converted': 'Convertido'
      };
      return labels[status] || status;
    },

    formatCurrency(value) {
      return parseFloat(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
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
