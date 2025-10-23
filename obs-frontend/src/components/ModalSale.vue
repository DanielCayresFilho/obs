<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Nova Venda</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="idStock">Produto *</label>
          <select
            id="idStock"
            v-model="formData.idStock"
            @change="onProductChange"
            required
          >
            <option value="" disabled>Selecione um produto</option>
            <option 
              v-for="item in stockItems" 
              :key="item.id" 
              :value="item.id"
            >
              {{ item.name }} - Estoque: {{ item.quantity }} (R$ {{ formatCurrency(item.price) }})
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="quantity">Quantidade *</label>
            <input
              type="number"
              id="quantity"
              v-model.number="formData.quantity"
              min="1"
              :max="selectedProduct?.quantity || 999999"
              placeholder="1"
              required
            />
            <small v-if="selectedProduct" class="helper-text">
              Disponível: {{ selectedProduct.quantity }}
            </small>
          </div>

          <div class="form-group">
            <label for="unitPrice">Preço Unitário (R$) *</label>
            <input
              type="text"
              id="unitPrice"
              v-model="formData.unitPrice"
              placeholder="0,00"
              @input="formatPrice"
              required
            />
          </div>
        </div>

        <div class="form-group total-price">
          <label>Total da Venda</label>
          <div class="total-display">
            R$ {{ calculateTotal() }}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="paymentType">Forma de Pagamento *</label>
            <select
              id="paymentType"
              v-model="formData.paymentType"
              required
            >
              <option value="" disabled>Selecione</option>
              <option value="money">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="debit">Débito</option>
              <option value="credit">Crédito à vista</option>
              <option value="credit2x">Crédito 2x</option>
              <option value="credit3x">Crédito 3x</option>
              <option value="credit4x">Crédito 4x</option>
              <option value="credit5x">Crédito 5x</option>
              <option value="credit6x">Crédito 6x</option>
            </select>
          </div>

          <div class="form-group">
            <label for="paymentStatus">Status *</label>
            <select
              id="paymentStatus"
              v-model="formData.paymentStatus"
              required
            >
              <option value="" disabled>Selecione</option>
              <option value="paid">Pago</option>
              <option value="unpaid">Pendente</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="clientId">ID do Cliente (Opcional)</label>
            <input
              type="number"
              id="clientId"
              v-model.number="formData.clientId"
              placeholder="ID do cliente"
            />
          </div>

          <div class="form-group">
            <label for="clientName">Nome do Cliente (Opcional)</label>
            <input
              type="text"
              id="clientName"
              v-model="formData.clientName"
              placeholder="Nome do cliente"
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Venda realizada com sucesso!
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading || !canSubmit">
            {{ loading ? 'Processando...' : 'Finalizar Venda' }}
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
  color: #6d2335;
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
  color: #cd8f35;
}

.modal-form {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
  border: 2px solid #6d2335;
  border-radius: 8px;
  color: black;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236d2335' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 40px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #cd8f35;
}

.form-group input::placeholder {
  color: #999;
}

.helper-text {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.total-price {
  background: linear-gradient(135deg, rgba(109, 35, 53, 0.1) 0%, rgba(205, 143, 53, 0.1) 100%);
  border-radius: 8px;
  padding: 15px;
  margin: 25px 0;
}

.total-price label {
  font-size: 16px;
  margin-bottom: 10px;
}

.total-display {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #6d2335 0%, #cd8f35 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  padding: 10px 0;
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
  background-color: #2a2d31;
  color: #ffffff;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #3a3d41;
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
  background: #1a1d21;
}

.modal-container::-webkit-scrollbar-thumb {
  background: #cd8f35;
  border-radius: 4px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: #b87d2e;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      formData: {
        idStock: '',
        quantity: 1,
        unitPrice: '',
        paymentType: 'money',
        paymentStatus: 'paid',
        clientId: null,
        clientName: ''
      },
      stockItems: [],
      loading: false,
      error: null,
      success: false
    }
  },

  computed: {
    selectedProduct() {
      return this.stockItems.find(item => item.id === this.formData.idStock);
    },

    canSubmit() {
      return (
        this.formData.idStock &&
        this.formData.quantity > 0 &&
        this.formData.unitPrice &&
        (!this.selectedProduct || this.formData.quantity <= this.selectedProduct.quantity)
      );
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.loadStockItems();
      }
    }
  },

  methods: {
    formatCurrency(value) {
      return parseFloat(value).toFixed(2).replace('.', ',');
    },

    formatPrice(event) {
      let value = event.target.value.replace(/\D/g, '');
      
      if (value.length === 0) {
        this.formData.unitPrice = '';
        return;
      }

      const numValue = parseInt(value) / 100;
      this.formData.unitPrice = numValue.toFixed(2).replace('.', ',');
    },

    calculateTotal() {
      if (!this.formData.unitPrice || !this.formData.quantity) {
        return '0,00';
      }

      const price = parseFloat(this.formData.unitPrice.replace(',', '.'));
      const total = price * this.formData.quantity;
      
      return total.toFixed(2).replace('.', ',');
    },

    onProductChange() {
      if (this.selectedProduct) {
        // Preenche o preço unitário com o preço do produto
        const price = parseFloat(this.selectedProduct.price);
        this.formData.unitPrice = price.toFixed(2).replace('.', ',');
      }
    },

    async loadStockItems() {
      try {
        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch('http://localhost:3000/stock', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar produtos do estoque');
        }

        const data = await response.json();
        // Filtra apenas itens com quantidade disponível
        this.stockItems = data.filter(item => item.quantity > 0);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao carregar estoque:', err);
      }
    },

    closeModal() {
      if (!this.loading) {
        this.resetForm();
        this.$emit('close');
      }
    },

    resetForm() {
      this.formData = {
        idStock: '',
        quantity: 1,
        unitPrice: '',
        paymentType: 'money',
        paymentStatus: 'paid',
        clientId: null,
        clientName: ''
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
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        // Validação de quantidade
        if (this.selectedProduct && this.formData.quantity > this.selectedProduct.quantity) {
          throw new Error(`Quantidade indisponível. Estoque atual: ${this.selectedProduct.quantity}`);
        }

        const unitPrice = parseFloat(this.formData.unitPrice.replace(',', '.'));

        if (isNaN(unitPrice) || unitPrice <= 0) {
          throw new Error('Preço unitário inválido');
        }

        const payload = {
          idStock: this.formData.idStock,
          quantity: this.formData.quantity,
          unitPrice: unitPrice,
          paymentType: this.formData.paymentType,
          paymentStatus: this.formData.paymentStatus
        };

        // Adiciona informações do cliente se fornecidas
        if (this.formData.clientId) {
          payload.clientId = this.formData.clientId;
        }
        if (this.formData.clientName) {
          payload.clientName = this.formData.clientName;
        }

        const response = await fetch('http://localhost:3000/sales', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao realizar venda');
        }

        const data = await response.json();
        
        this.success = true;
        this.$emit('sale-created', data);

        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao realizar venda:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>