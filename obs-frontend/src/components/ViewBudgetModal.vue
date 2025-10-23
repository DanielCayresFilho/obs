<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Detalhes do Orçamento</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-content" v-if="budget">
        <!-- Status e informações básicas -->
        <div class="info-section">
          <div class="info-header">
            <h3>{{ budget.budgetName }}</h3>
            <span :class="['status-badge', `status-${budget.status}`]">
              {{ getStatusLabel(budget.status) }}
            </span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Cliente:</span>
              <span class="info-value">{{ budget.clientName }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Responsável:</span>
              <span class="info-value">{{ budget.userResponsibility }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Criado em:</span>
              <span class="info-value">{{ formatDate(budget.createdAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Validade:</span>
              <span class="info-value">{{ formatDate(budget.validityDate) }}</span>
            </div>
          </div>
        </div>

        <!-- Procedimentos -->
        <div class="info-section">
          <h4>Procedimentos</h4>
          <ul class="procedures-list">
            <li v-for="(procedure, index) in parsedProcedures" :key="index">
              {{ procedure }}
            </li>
          </ul>
        </div>

        <!-- Descrição -->
        <div class="info-section" v-if="budget.description">
          <h4>Descrição/Observações</h4>
          <p class="description-text">{{ budget.description }}</p>
        </div>

        <!-- Valores -->
        <div class="info-section">
          <h4>Valores</h4>
          <div class="values-grid">
            <div class="value-item">
              <span class="value-label">Valor Estimado:</span>
              <span class="value-amount">{{ formatCurrency(budget.estimatedPrice) }}</span>
            </div>

            <div class="value-item" v-if="budget.discount > 0">
              <span class="value-label">Desconto:</span>
              <span class="value-amount discount">- {{ formatCurrency(budget.discount) }}</span>
            </div>

            <div class="value-item final">
              <span class="value-label">Valor Final:</span>
              <span class="value-amount final-price">{{ formatCurrency(budget.finalPrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Ações de aprovação/rejeição -->
        <div class="status-actions" v-if="budget.status === 'pending'">
          <button @click="updateStatus('approved')" class="btn-approve" :disabled="loading">
            ✓ Aprovar
          </button>
          <button @click="updateStatus('rejected')" class="btn-reject" :disabled="loading">
            ✗ Recusar
          </button>
        </div>

        <!-- Mostrar botão de recusar se já foi aprovado mas não convertido -->
        <div class="status-actions" v-if="budget.status === 'approved'">
          <button @click="updateStatus('rejected')" class="btn-reject-alt" :disabled="loading">
            ✗ Recusar Orçamento
          </button>
        </div>

        <!-- Conversão para comanda -->
        <div class="conversion-section" v-if="budget.status === 'approved' && !showConversionForm">
          <button @click="showConversionForm = true" class="btn-convert">
            🎨 Converter em Comanda e Agendar
          </button>
        </div>

        <!-- Formulário de conversão -->
        <div class="conversion-form" v-if="showConversionForm && budget.status === 'approved'">
          <h4>Converter para Comanda</h4>

          <div class="form-group">
            <label for="appointmentDate">Data e Hora do Agendamento *</label>
            <input
              type="datetime-local"
              id="appointmentDate"
              v-model="conversionData.appointmentDate"
              :min="minAppointmentDate"
              required
            />
          </div>

          <div class="form-group">
            <label for="paymentType">Forma de Pagamento *</label>
            <select id="paymentType" v-model="conversionData.paymentType" required>
              <option value="">Selecione...</option>
              <option value="pix">PIX</option>
              <option value="money">Dinheiro</option>
              <option value="debit">Débito (+0,88%)</option>
              <option value="credit">Crédito (+3,14%)</option>
              <option value="credit2x">Crédito 2x (+9,48%)</option>
              <option value="credit3x">Crédito 3x (+9,48%)</option>
              <option value="credit4x">Crédito 4x (+9,48%)</option>
              <option value="credit5x">Crédito 5x (+9,48%)</option>
              <option value="credit6x">Crédito 6x (+9,48%)</option>
            </select>
          </div>

          <div class="conversion-info" v-if="conversionData.paymentType">
            <p class="info-text">
              <strong>Valor com taxa:</strong> {{ calculateFeePrice() }}
            </p>
          </div>

          <div class="conversion-actions">
            <button @click="showConversionForm = false" class="btn-cancel" :disabled="loading">
              Cancelar
            </button>
            <button @click="convertToCommand" class="btn-confirm" :disabled="loading || !conversionData.appointmentDate || !conversionData.paymentType">
              {{ loading ? 'Convertendo...' : 'Confirmar Conversão' }}
            </button>
          </div>
        </div>

        <!-- Mensagens de status convertido -->
        <div class="converted-info" v-if="budget.status === 'converted' && budget.linkedCommandId">
          <p class="success-message">
            ✓ Este orçamento já foi convertido em comanda #{{ budget.linkedCommandId }}
          </p>
        </div>

        <!-- Mensagens de erro/sucesso -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>
      </div>
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
  padding: 1rem;
  box-sizing: border-box;
}

.modal-container {
  background-color: #f0f0f0;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid #ddd;
  flex-shrink: 0;
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
  font-size: 32px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #000;
}

.modal-content {
  padding: 25px;
  overflow-y: auto;
  flex: 1;
}

.info-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.info-section:last-child {
  border-bottom: none;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.info-header h3 {
  margin: 0;
  color: #333;
  font-size: 22px;
}

h4 {
  color: #333;
  font-size: 16px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-pending {
  background-color: rgba(255, 193, 7, 0.2);
  color: #f57c00;
}

.status-approved {
  background-color: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}

.status-rejected {
  background-color: rgba(244, 67, 54, 0.2);
  color: #c62828;
}

.status-converted {
  background-color: rgba(158, 158, 158, 0.2);
  color: #616161;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.procedures-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.procedures-list li {
  padding: 10px;
  background-color: white;
  border-left: 3px solid #cd8f35;
  margin-bottom: 8px;
  border-radius: 4px;
  color: #333;
}

.description-text {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  color: #333;
  line-height: 1.6;
  margin: 0;
}

.values-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: white;
  border-radius: 8px;
}

.value-item.final {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #4caf50;
}

.value-label {
  font-weight: 600;
  color: #666;
}

.value-amount {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.value-amount.discount {
  color: #f44336;
}

.value-amount.final-price {
  font-size: 22px;
  color: #2e7d32;
}

.status-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.btn-approve,
.btn-reject {
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
}

.btn-approve:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-reject {
  background: linear-gradient(135deg, #f44336, #c62828);
  color: white;
}

.btn-reject:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.btn-reject-alt {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #f44336, #c62828);
  color: white;
}

.btn-reject-alt:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.conversion-section {
  margin-top: 20px;
}

.btn-convert {
  width: 100%;
  padding: 16px;
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-convert:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(219, 32, 76, 0.4);
}

.conversion-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #cd8f35;
  margin-top: 20px;
}

.conversion-form h4 {
  margin-top: 0;
  color: #cd8f35;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  background-color: white;
  color: #333;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #cd8f35;
}

.conversion-info {
  background-color: #fff3e0;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #ff9800;
  margin-bottom: 15px;
}

.info-text {
  margin: 0;
  color: #e65100;
  font-size: 14px;
}

.conversion-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 15px;
}

.btn-cancel,
.btn-confirm {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #666;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #d0d0d0;
}

.btn-confirm {
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(219, 32, 76, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.converted-info {
  background-color: #e8f5e9;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #4caf50;
  margin-top: 20px;
}

.error-message,
.success-message {
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 14px;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #66bb6a;
}

/* Scrollbar */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cd8f35;
  border-radius: 4px;
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-header h2 {
    font-size: 22px;
  }

  .modal-content {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .status-actions,
  .conversion-actions {
    grid-template-columns: 1fr;
  }

  .info-header h3 {
    font-size: 18px;
  }

  .value-amount.final-price {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 12px 15px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .modal-content {
    padding: 15px;
  }

  h4 {
    font-size: 14px;
  }

  .info-header h3 {
    font-size: 16px;
  }

  .status-badge {
    font-size: 10px;
    padding: 4px 10px;
  }

  .value-amount {
    font-size: 16px;
  }

  .value-amount.final-price {
    font-size: 18px;
  }

  .btn-approve,
  .btn-reject,
  .btn-convert,
  .btn-cancel,
  .btn-confirm {
    font-size: 14px;
    padding: 12px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-group input,
  .form-group select {
    padding: 10px;
    font-size: 13px;
  }
}
</style>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    budget: {
      type: Object,
      default: null
    }
  },

  data() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const minDate = now.toISOString().slice(0, 16);

    return {
      showConversionForm: false,
      conversionData: {
        appointmentDate: '',
        paymentType: ''
      },
      loading: false,
      error: null,
      success: null,
      minAppointmentDate: minDate
    }
  },

  computed: {
    parsedProcedures() {
      if (!this.budget || !this.budget.procedures) return [];
      try {
        return JSON.parse(this.budget.procedures);
      } catch (e) {
        return [];
      }
    }
  },

  watch: {
    isOpen(newValue) {
      if (!newValue) {
        this.resetConversionForm();
      }
    }
  },

  methods: {
    async updateStatus(newStatus) {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');

        const response = await fetch(`http://localhost:3000/budgets/${this.budget.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar status do orçamento');
        }

        this.success = newStatus === 'approved' ? 'Orçamento aprovado!' : 'Orçamento recusado';
        this.$emit('budget-updated');

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

    async convertToCommand() {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');

        const response = await fetch(`http://localhost:3000/budgets/${this.budget.id}/convert`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.conversionData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao converter orçamento');
        }

        const result = await response.json();

        this.success = `Orçamento convertido com sucesso! Comanda #${result.command.id} criada.`;
        this.$emit('budget-updated');

        setTimeout(() => {
          this.closeModal();
        }, 2000);

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    calculateFeePrice() {
      if (!this.budget || !this.conversionData.paymentType) return '';

      let price = parseFloat(this.budget.finalPrice);

      switch (this.conversionData.paymentType) {
        case 'debit':
          price *= 1.0088;
          break;
        case 'credit':
          price *= 1.0314;
          break;
        case 'credit2x':
        case 'credit3x':
        case 'credit4x':
        case 'credit5x':
        case 'credit6x':
          price *= 1.0948;
          break;
      }

      return this.formatCurrency(price.toFixed(2));
    },

    closeModal() {
      this.$emit('close');
    },

    resetConversionForm() {
      this.showConversionForm = false;
      this.conversionData = {
        appointmentDate: '',
        paymentType: ''
      };
      this.error = null;
      this.success = null;
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
