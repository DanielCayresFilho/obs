<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Novo Procedimento</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="procedureName">Nome do Procedimento *</label>
          <input
            type="text"
            id="procedureName"
            v-model="formData.procedureName"
            placeholder="Ex: Tatuagem Pequena (Fine Line)"
            required
          />
        </div>

        <div class="form-group">
          <label for="procedureType">Tipo de Procedimento *</label>
          <select
            id="procedureType"
            v-model="formData.procedureType"
            required
          >
            <option value="" disabled>Selecione o tipo</option>
            <option value="Braço">Braço</option>
            <option value="Antebraço">Antebraço</option>
            <option value="Mão">Mão</option>
            <option value="Coxa">Coxa</option>
            <option value="Canela">Canela</option>
            <option value="Panturilha">Panturilha</option>
            <option value="Pé">Pé</option>
            <option value="Cabeça">Cabeça</option>
            <option value="Pescoço">Pescoço</option>
            <option value="Rosto">Rosto</option>
            <option value="Costas">Costas</option>
            <option value="Gluteos">Gluteos</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="duration">Duração (minutos) *</label>
            <input
              type="number"
              id="duration"
              v-model.number="formData.duration"
              placeholder="60"
              min="15"
              step="15"
              required
            />
          </div>

          <div class="form-group">
            <label for="procedurePrice">Preço (R$) *</label>
            <input
              type="text"
              id="procedurePrice"
              v-model="formData.procedurePrice"
              placeholder="250,00"
              @input="formatPrice"
              required
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Procedimento cadastrado com sucesso!
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar Procedimento' }}
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
  max-width: 500px;
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

/* Scrollbar customizada */
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
        procedureName: '',
        procedureType: '',
        duration: 60,
        procedurePrice: ''
      },
      loading: false,
      error: null,
      success: false
    }
  },

  methods: {
    formatPrice(event) {
      let value = event.target.value.replace(/\D/g, '');
      
      if (value.length === 0) {
        this.formData.procedurePrice = '';
        return;
      }

      // Converter para número e dividir por 100 para ter os centavos
      const numValue = parseInt(value) / 100;
      
      // Formatar com vírgula
      this.formData.procedurePrice = numValue.toFixed(2).replace('.', ',');
    },

    closeModal() {
      if (!this.loading) {
        this.resetForm();
        this.$emit('close');
      }
    },

    resetForm() {
      this.formData = {
        procedureName: '',
        procedureType: '',
        duration: 60,
        procedurePrice: ''
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

        // Converter preço de string para número
        const priceValue = parseFloat(this.formData.procedurePrice.replace(',', '.'));

        if (isNaN(priceValue) || priceValue <= 0) {
          throw new Error('Preço inválido');
        }

        const payload = {
          procedureName: this.formData.procedureName,
          procedureType: this.formData.procedureType,
          duration: this.formData.duration,
          procedurePrice: priceValue
        };

        const response = await fetch('http://localhost:3000/procedures', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao cadastrar procedimento');
        }

        const data = await response.json();
        
        this.success = true;
        
        // Emitir evento de sucesso
        this.$emit('procedure-created', data);

        // Fechar modal após 1.5 segundos
        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao cadastrar procedimento:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>