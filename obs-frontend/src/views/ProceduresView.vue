<template>
<div class="parent">
    
    <div class="div1">
      <Sidebar />
    </div>
    
    <div class="div2">
        <img src="../assets/images/logo-só-texto-amarelo.png" alt="">
    </div>
    
    <div class="div3">
      <div class="filters">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Buscar por nome ou tipo de procedimento..."
          class="search-input"
        >
        <select v-model="sortBy" class="sort-select">
          <option value="recent">Mais Recentes</option>
          <option value="oldest">Mais Antigos</option>
          <option value="name">Nome A-Z</option>
          <option value="price">Menor Preço</option>
          <option value="duration">Menor Duração</option>
        </select>
      </div>
    </div>
    
    <div class="div4">
      <button @click="showModal = true" class="btn-new-procedure">+ Novo Procedimento</button>
    </div>
    
    <div class="div5">
      <div v-if="loading" class="loading-message">
        <div class="spinner"></div>
        <p>Carregando procedimentos...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="filteredProcedures.length === 0" class="empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="9" cy="9" r="2"></circle>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </svg>
        <p>{{ searchQuery ? 'Nenhum procedimento encontrado' : 'Nenhum procedimento cadastrado' }}</p>
      </div>

      <div v-else class="procedures-grid">
        <div 
          v-for="procedure in filteredProcedures" 
          :key="procedure.id"
          class="procedure-card"
        >
          <div class="procedure-header">
            <div class="procedure-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <div class="procedure-info">
              <h3 class="procedure-name">{{ procedure.procedureName }}</h3>
              <p class="procedure-type">{{ procedure.procedureType }}</p>
            </div>
          </div>
          
          <div class="procedure-details">
            <div class="detail-row">
              <span class="detail-icon">💰</span>
              <span class="detail-label">Preço:</span>
              <span class="detail-value">R$ {{ formatPrice(procedure.procedurePrice) }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-icon">⏱️</span>
              <span class="detail-label">Duração:</span>
              <span class="detail-value">{{ formatDuration(procedure.duration) }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-icon">📅</span>
              <span class="detail-label">Cadastrado:</span>
              <span class="detail-value">{{ formatDate(procedure.createdAt) }}</span>
            </div>
          </div>
          
          <div class="procedure-actions">
            <button @click="editProcedure(procedure)" class="btn-edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              </svg>
              Editar
            </button>
            <button @click="deleteProcedure(procedure)" class="btn-delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Procedimento -->
    <NewProcedureModal
      :isOpen="showModal"
      @close="showModal = false"
      @procedure-created="handleProcedureCreated"
    />

    <!-- Modal de Edição -->
    <EditProcedureModal
      :isOpen="showEditModal"
      :procedure="selectedProcedure"
      @close="showEditModal = false"
      @procedure-updated="handleProcedureUpdated"
    />
</div>
</template>

<style scoped>
/* GRADE PRINCIPAL */
.parent {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(23, 1fr);
  height: 100vh;
  background-color: #0f0f0f;
  color: white;
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

.filters {
  display: flex;
  gap: 15px;
  width: 90%;
}

.search-input {
  flex: 1;
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

.sort-select {
  padding: 12px 20px;
  background-color: #121517;
  border: 2px solid #2a2d31;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: border-color 0.3s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cd8f35' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 40px;
}

.sort-select:focus {
  outline: none;
  border-color: #cd8f35;
}

.div4 {
  grid-column-start: 6;
  grid-row-start: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-new-procedure {
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  border: none;
  border-radius: 10px;
  width: 98%;
  height: 48px;
  color: white;
  font-weight: bolder;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-new-procedure:hover {
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

.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #ff6b6b;
  text-align: center;
}

.empty-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 20px;
  color: #666;
}

.empty-message svg {
  opacity: 0.5;
}

.empty-message p {
  font-size: 18px;
  margin: 0;
}

/* GRID DE PROCEDIMENTOS */
.procedures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
}

.procedure-card {
  background-color: #1a1d21;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.procedure-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(205, 143, 53, 0.3);
  border-color: #cd8f35;
}

.procedure-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a2d31;
}

.procedure-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #cd8f35 0%, #ffa726 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(205, 143, 53, 0.3);
}

.procedure-icon svg {
  color: #0f0f0f;
}

.procedure-info {
  flex: 1;
  min-width: 0;
}

.procedure-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.procedure-type {
  font-size: 14px;
  color: #cd8f35;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.procedure-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.detail-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.detail-label {
  color: #888;
  font-weight: 600;
  min-width: 90px;
}

.detail-value {
  color: #ffffff;
  font-weight: 500;
}

.procedure-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.btn-edit {
  background-color: #2a2d31;
  border: 1px solid #cd8f35;
  color: #cd8f35;
}

.btn-edit:hover {
  background-color: #cd8f35;
  color: #000;
}

.btn-delete {
  background-color: #2a2d31;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
}

.btn-delete:hover {
  background-color: #ff6b6b;
  color: #fff;
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

/* Responsividade */
@media (max-width: 1400px) {
  .procedures-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 1200px) {
  .procedures-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 900px) {
  .procedures-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
  
  .filters {
    flex-direction: column;
  }
}
</style>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
 import NewProcedureModal from '@/components/NewProcedureModal.vue';
 import EditProcedureModal from '@/components/EditProcedureModal.vue';
</script>

<script>
export default {
  data() {
    return {
      procedures: [],
      searchQuery: '',
      sortBy: 'recent',
      loading: true,
      error: null,
      showModal: false,
      showEditModal: false,
      selectedProcedure: null
    }
  },

  computed: {
    filteredProcedures() {
      let filtered = [...this.procedures];

      // Filtrar por busca
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(proc => 
          proc.procedureName.toLowerCase().includes(query) ||
          proc.procedureType.toLowerCase().includes(query)
        );
      }

      // Ordenar
      switch (this.sortBy) {
        case 'recent':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'name':
          filtered.sort((a, b) => a.procedureName.localeCompare(b.procedureName));
          break;
        case 'price':
          filtered.sort((a, b) => parseFloat(a.procedurePrice) - parseFloat(b.procedurePrice));
          break;
        case 'duration':
          filtered.sort((a, b) => a.duration - b.duration);
          break;
      }

      return filtered;
    }
  },

  mounted() {
    this.fetchProcedures();
  },

  methods: {
    async fetchProcedures() {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch('http://localhost:3000/procedures', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar procedimentos');
        }

        this.procedures = await response.json();

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    handleProcedureCreated() {
      this.fetchProcedures();
    },

    handleProcedureUpdated() {
      this.fetchProcedures();
    },

    editProcedure(procedure) {
      this.selectedProcedure = procedure;
      this.showEditModal = true;
    },

    async deleteProcedure(procedure) {
      if (!confirm(`Tem certeza que deseja excluir o procedimento "${procedure.procedureName}"?`)) {
        return;
      }

      try {
        const token = localStorage.getItem('jwt_token');
        
        const response = await fetch(`http://localhost:3000/procedures/${procedure.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir procedimento');
        }

        this.fetchProcedures();
      } catch (err) {
        alert('Erro ao excluir procedimento: ' + err.message);
        console.error('Erro:', err);
      }
    },

    formatPrice(price) {
      return parseFloat(price).toFixed(2).replace('.', ',');
    },

    formatDuration(minutes) {
      if (minutes < 60) {
        return `${minutes} min`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }
}
</script>