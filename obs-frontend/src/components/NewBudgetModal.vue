<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Novo Orçamento</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Nome do Orçamento -->
        <div class="form-group">
          <label for="budgetName">Nome do Orçamento *</label>
          <input
            type="text"
            id="budgetName"
            v-model="formData.budgetName"
            placeholder="Ex: Tatuagem Braço - João Silva"
            required
          />
        </div>

        <!-- Cliente -->
        <div class="form-group">
          <label for="client">Cliente *</label>
          <select
            id="client"
            v-model="selectedClientId"
            @change="onClientChange"
            required
          >
            <option value="">Selecione um cliente</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>

        <!-- Procedimentos -->
        <div class="form-group">
          <label>Procedimentos *</label>
          <div class="materials-container">
            <div v-for="(proc, index) in selectedProcedures" :key="index" class="material-item">
              <select 
                v-model="proc.id" 
                @change="onProcedureChange(index)" 
                class="material-select" 
                required
              >
                <option value="">Selecione um procedimento</option>
                <option v-for="procedure in procedures" :key="procedure.id" :value="procedure.id">
                  {{ procedure.procedureName }} - {{ procedure.procedureType }} (R$ {{ procedure.procedurePrice }})
                </option>
              </select>
              
              <button 
                type="button" 
                @click="removeProcedure(index)" 
                class="btn-remove" 
                v-if="selectedProcedures.length > 1"
              >
                &times;
              </button>
            </div>
            
            <button type="button" @click="addProcedure" class="btn-add-material">
              + Adicionar Procedimento
            </button>
          </div>
        </div>

        <!-- Descrição -->
        <div class="form-group">
          <label for="description">Descrição/Observações</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Detalhes sobre cores, tamanho, local do corpo, etc..."
            rows="4"
          ></textarea>
        </div>

        <!-- Desconto -->
        <div class="form-group">
          <label for="discount">Desconto (R$)</label>
          <input
            type="number"
            id="discount"
            v-model.number="formData.discount"
            placeholder="0.00"
            step="0.01"
            min="0"
            @input="calculateFinalPrice"
          />
        </div>

        <!-- Valor Total -->
        <div class="form-group">
          <label>Valor Total</label>
          <div class="total-price">
            {{ formatCurrency(formData.finalPrice) }}
          </div>
        </div>

        <!-- Data de Validade -->
        <div class="form-group">
          <label for="validityDate">Validade do Orçamento *</label>
          <input
            type="date"
            id="validityDate"
            v-model="formData.validityDate"
            :min="minValidityDate"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Orçamento criado com sucesso!
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-submit" 
            :disabled="loading || !selectedProcedures.some(p => p.id !== '')"
          >
            {{ loading ? 'Criando...' : 'Criar Orçamento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: #f0f0f0;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
}

.modal-header h2 {
  background: linear-gradient(1deg, #5a1e2b, #d7385a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-size: 28px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #5a1e2b;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #d7385a;
}

.modal-form {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #6d2335;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid #e0e0e0;
  color: black;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: black;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  font-family: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-bottom-color: #d7385a;
}

.form-group textarea:focus {
  border-color: #d7385a;
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236d2335' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 30px;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #999;
}

.total-price {
  padding: 16px;
  background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
  border: 2px solid #d7385a;
  border-radius: 8px;
  color: #5a1e2b;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

/* Materiais/Procedimentos */
.materials-container {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #fafafa;
}

.material-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.material-select {
  flex: 2;
  padding: 10px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: black;
  font-size: 14px;
}

.btn-remove {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.btn-remove:hover {
  background-color: #ff5252;
}

.btn-add-material {
  width: 100%;
  padding: 10px;
  background-color: white;
  color: #6d2335;
  border: 2px dashed #d7385a;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-add-material:hover {
  background-color: #fef5f7;
  border-color: #5a1e2b;
}

.error-message {
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.success-message {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
  color: #4caf50;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #5a1e2b;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #d0d0d0;
}

.btn-submit {
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  color: #ffffff;
}

.btn-submit:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(219, 32, 76, 0.4);
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.modal-container::-webkit-scrollbar-thumb {
  background: #d7385a;
  border-radius: 4px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: #5a1e2b;
}
</style>

<script>
import { API_BASE_URL } from '@/config/api';
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },

  data() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      formData: {
        budgetName: '',
        idClient: null,
        clientName: '',
        idUser: null,
        userResponsibility: '',
        description: '',
        procedures: '',
        estimatedPrice: 0,
        discount: 0,
        finalPrice: 0,
        validityDate: ''
      },
      clients: [],
      procedures: [],
      selectedClientId: '',
      selectedProcedures: [{ id: '', name: '', price: 0 }],
      loading: false,
      error: null,
      success: false,
      minValidityDate: tomorrow.toISOString().split('T')[0]
    }
  },

  watch: {
    isOpen(newValue) {
      if (newValue) {
        this.resetForm();
        this.fetchClients();
        this.fetchProcedures();
        this.loadUserData();
      }
    }
  },

  methods: {
    async fetchClients() {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Erro ao buscar clientes');

        this.clients = await response.json();
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      }
    },

    async fetchProcedures() {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/procedures`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Erro ao buscar procedimentos');

        this.procedures = await response.json();
      } catch (err) {
        console.error('Erro ao buscar procedimentos:', err);
      }
    },

    loadUserData() {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      this.formData.idUser = userData.id;
      this.formData.userResponsibility = userData.name;
    },

    onClientChange() {
      const client = this.clients.find(c => c.id === parseInt(this.selectedClientId));
      if (client) {
        this.formData.idClient = client.id;
        this.formData.clientName = client.name;
      }
    },

    addProcedure() {
      this.selectedProcedures.push({ id: '', name: '', price: 0 });
    },

    removeProcedure(index) {
      if (this.selectedProcedures.length > 1) {
        this.selectedProcedures.splice(index, 1);
        this.calculatePrices();
      }
    },

    onProcedureChange(index) {
      const selectedId = this.selectedProcedures[index].id;
      const procedure = this.procedures.find(p => p.id === selectedId);

      if (procedure) {
        this.selectedProcedures[index].name = procedure.procedureName;
        this.selectedProcedures[index].price = parseFloat(procedure.procedurePrice);
        this.calculatePrices();
      }
    },

    calculatePrices() {
      this.formData.estimatedPrice = this.selectedProcedures.reduce(
        (sum, proc) => sum + (parseFloat(proc.price) || 0),
        0
      );
      this.calculateFinalPrice();
    },

    calculateFinalPrice() {
      const discount = parseFloat(this.formData.discount) || 0;
      this.formData.finalPrice = Math.max(0, this.formData.estimatedPrice - discount);
    },

    async handleSubmit() {
      const hasValidProcedure = this.selectedProcedures.some(p => p.id !== '');

      if (!hasValidProcedure) {
        this.error = 'Selecione pelo menos um procedimento';
        return;
      }

      try {
        this.loading = true;
        this.error = null;
        this.success = false;

        const token = localStorage.getItem('jwt_token');

        const selectedProceduresNames = this.selectedProcedures
          .filter(p => p.id !== '')
          .map(p => p.name);
        this.formData.procedures = JSON.stringify(selectedProceduresNames);

        const response = await fetch(`${API_BASE_URL}/budgets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao criar orçamento');
        }

        const budget = await response.json();

        this.success = true;
        this.$emit('budget-created', budget);

        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    closeModal() {
      if (!this.loading) {
        this.$emit('close');
      }
    },

    resetForm() {
      this.formData = {
        budgetName: '',
        idClient: null,
        clientName: '',
        idUser: null,
        userResponsibility: '',
        description: '',
        procedures: '',
        estimatedPrice: 0,
        discount: 0,
        finalPrice: 0,
        validityDate: ''
      };
      this.selectedClientId = '';
      this.selectedProcedures = [{ id: '', name: '', price: 0 }];
      this.error = null;
      this.success = false;
      this.loadUserData();
    },

    formatCurrency(value) {
      return parseFloat(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }
  }
}
</script>