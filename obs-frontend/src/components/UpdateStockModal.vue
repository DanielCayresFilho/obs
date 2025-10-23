<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Editar Item de Estoque</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="name">Nome do Item *</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            placeholder="Ex: Agulha 5RL"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="type">Tipo *</label>
            <select
              id="type"
              v-model="formData.type"
              required
            >
              <option value="intern">Uso Interno</option>
              <option value="sale">Para Venda</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category">Categoria *</label>
            <input
              type="text"
              id="category"
              v-model="formData.category"
              placeholder="Ex: Agulhas"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="price">Preço (R$) *</label>
            <input
              type="text"
              id="price"
              v-model="formData.price"
              placeholder="0,00"
              @input="formatPrice"
              required
            />
          </div>

          <div class="form-group">
            <label for="quantity">Quantidade *</label>
            <input
              type="number"
              id="quantity"
              v-model.number="formData.quantity"
              min="0"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="length">Comprimento (ml/g)</label>
            <input
              type="text"
              id="length"
              v-model="formData.length"
              placeholder="0,00"
              @input="formatLength"
            />
            <small class="helper-text">Para tintas e líquidos</small>
          </div>

          <div class="form-group">
            <label for="usable">Utilizável (ml/g)</label>
            <input
              type="text"
              id="usable"
              v-model="formData.usable"
              placeholder="0,00"
              @input="formatUsable"
            />
            <small class="helper-text">Quantidade disponível para uso</small>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Item atualizado com sucesso!
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-delete" @click="handleDelete" :disabled="loading">
            🗑️ Excluir
          </button>
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar' }}
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

.btn-delete,
.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete {
  background-color: #ff6b6b;
  color: #ffffff;
}

.btn-delete:hover:not(:disabled) {
  background-color: #ff5252;
  transform: scale(1.02);
}

.btn-cancel {
  flex: 1;
  background-color: #2a2d31;
  color: #ffffff;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #3a3d41;
}

.btn-submit {
  flex: 1;
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  color: #ffffff;
}

.btn-submit:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(219, 32, 76, 0.4);
}

.btn-delete:disabled,
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

  .modal-actions {
    flex-wrap: wrap;
  }

  .btn-delete {
    width: 100%;
  }
}
</style>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    stock: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      formData: {
        name: '',
        type: 'intern',
        price: '',
        quantity: 0,
        length: '0',
        usable: '0',
        category: ''
      },
      loading: false,
      error: null,
      success: false
    }
  },

  watch: {
    stock: {
      handler(newStock) {
        if (newStock) {
          this.formData = {
            name: newStock.name,
            type: newStock.type,
            price: parseFloat(newStock.price).toFixed(2).replace('.', ','),
            quantity: newStock.quantity,
            length: parseFloat(newStock.length).toFixed(2).replace('.', ','),
            usable: parseFloat(newStock.usable).toFixed(2).replace('.', ','),
            category: newStock.category
          };
        }
      },
      immediate: true
    }
  },

  methods: {
    formatPrice(event) {
      let value = event.target.value.replace(/\D/g, '');
      
      if (value.length === 0) {
        this.formData.price = '';
        return;
      }

      const numValue = parseInt(value) / 100;
      this.formData.price = numValue.toFixed(2).replace('.', ',');
    },

    formatLength(event) {
      let value = event.target.value.replace(/\D/g, '');
      
      if (value.length === 0) {
        this.formData.length = '0';
        return;
      }

      const numValue = parseInt(value) / 100;
      this.formData.length = numValue.toFixed(2).replace('.', ',');
    },

    formatUsable(event) {
      let value = event.target.value.replace(/\D/g, '');
      
      if (value.length === 0) {
        this.formData.usable = '0';
        return;
      }

      const numValue = parseInt(value) / 100;
      this.formData.usable = numValue.toFixed(2).replace('.', ',');
    },

    closeModal() {
      if (!this.loading) {
        this.error = null;
        this.success = false;
        this.$emit('close');
      }
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

        const priceValue = parseFloat(this.formData.price.replace(',', '.'));
        const lengthValue = parseFloat(this.formData.length.replace(',', '.'));
        const usableValue = parseFloat(this.formData.usable.replace(',', '.'));

        if (isNaN(priceValue) || priceValue < 0) {
          throw new Error('Preço inválido');
        }

        const payload = {
          name: this.formData.name,
          type: this.formData.type,
          price: priceValue,
          quantity: this.formData.quantity,
          length: lengthValue,
          usable: usableValue,
          category: this.formData.category
        };

        const response = await fetch(`http://localhost:3000/stock/${this.stock.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao atualizar item');
        }

        const data = await response.json();
        
        this.success = true;
        this.$emit('stock-updated', data);

        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao atualizar item:', err);
      } finally {
        this.loading = false;
      }
    },

    async handleDelete() {
      if (!confirm(`Tem certeza que deseja excluir "${this.stock.name}"?`)) {
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch(`http://localhost:3000/stock/${this.stock.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao excluir item');
        }

        this.$emit('stock-deleted', this.stock);
        this.closeModal();

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao excluir item:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>