<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Novo Orçamento</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Nome do Cliente -->
        <div class="form-group">
          <label for="clientName">Nome do Cliente *</label>
          <input
            type="text"
            id="clientName"
            v-model="formData.clientName"
            placeholder="Digite o nome do cliente"
            required
          />
        </div>

        <!-- Telefone -->
        <div class="form-group">
          <label for="phone">Telefone *</label>
          <input
            type="tel"
            id="phone"
            v-model="formData.phone"
            placeholder="14996699666"
            @input="formatPhone"
            maxlength="15"
            required
          />
        </div>

        <!-- Valor -->
        <div class="form-group">
          <label for="price">Valor do Orçamento (R$) *</label>
          <input
            type="number"
            id="price"
            v-model.number="formData.price"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <!-- Validade -->
        <div class="form-group">
          <label for="validityDate">Validade do Orçamento *</label>
          <input
            type="date"
            id="validityDate"
            v-model="formData.validityDate"
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
          <button type="submit" class="btn-submit" :disabled="loading">
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
  max-width: 450px;
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

.form-group input {
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

.form-group input:focus {
  outline: none;
  border-bottom-color: #d7385a;
}

.form-group input::placeholder {
  color: #999;
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
    return {
      formData: {
        clientName: '',
        phone: '',
        price: 0,
        validityDate: ''
      },
      loading: false,
      error: null,
      success: false
    }
  },

  methods: {
    formatPhone(event) {
      let value = event.target.value.replace(/\D/g, '');
      
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      
      this.formData.phone = value;
    },

    closeModal() {
      if (!this.loading) {
        this.resetForm();
        this.$emit('close');
      }
    },

    resetForm() {
      this.formData = {
        clientName: '',
        phone: '',
        price: 0,
        validityDate: ''
      };
      this.error = null;
      this.success = false;
    },

    async handleSubmit() {
      try {
        this.loading = true;
        this.error = null;
        this.success = false;

        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error('Token não encontrado');

        const payload = {
          clientName: this.formData.clientName,
          phone: this.formData.phone,
          price: this.formData.price,
          validityDate: this.formData.validityDate
        };

        const response = await fetch(`${API_BASE_URL}/budgets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Erro ao criar orçamento');
        }

        const budget = await response.json();
        
        this.success = true;
        this.$emit('budget-created', budget);

        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao criar orçamento:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>