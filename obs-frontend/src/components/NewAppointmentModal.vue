<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Novo Agendamento</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Cliente -->
        <div class="form-group">
          <label for="client">Cliente *</label>
          <select
            id="client"
            v-model="formData.idClient"
            @change="onClientChange"
            required
          >
            <option value="">Selecione um cliente</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>

        <!-- Data e Hora -->
        <div class="form-group">
          <label for="appointmentDate">Data e Hora do Agendamento *</label>
          <input
            type="datetime-local"
            id="appointmentDate"
            v-model="formData.appointmentDate"
            required
          />
        </div>

        <!-- Procedimentos -->
        <div class="form-group">
          <label>Procedimentos *</label>
          <div class="materials-container">
            <div v-for="(proc, index) in formData.procedures" :key="index" class="material-item">
              <select v-model="proc.id" @change="onProcedureChange(index)" class="material-select" required>
                <option value="">Selecione um procedimento</option>
                <option v-for="procedure in procedures" :key="procedure.id" :value="procedure.id">
                  {{ procedure.procedureName }} - {{ procedure.procedureType }} (R$ {{ procedure.procedurePrice }})
                </option>
              </select>
              
              <button type="button" @click="removeProcedure(index)" class="btn-remove" v-if="formData.procedures.length > 1">
                &times;
              </button>
            </div>
            
            <button type="button" @click="addProcedure" class="btn-add-material">
              + Adicionar Procedimento
            </button>
          </div>
        </div>

        <!-- Upload de Foto -->
        <div class="form-group">
          <label for="photo">Decalque</label>
          <div class="photo-upload-area">
            <input
              type="file"
              id="photo"
              ref="photoInput"
              @change="handlePhotoChange"
              accept="image/*"
              style="display: none;"
            />
            
            <div v-if="!photoPreview" class="upload-placeholder" @click="$refs.photoInput.click()">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>Clique para adicionar foto do procedimento</p>
            </div>

            <div v-else class="photo-preview">
              <img :src="photoPreview" alt="Preview" />
              <button type="button" class="remove-photo-btn" @click="removePhoto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Materiais Utilizados</label>
          <div class="materials-container">
            <div v-for="(material, index) in formData.materials" :key="index" class="material-item">
              <select v-model="material.idStock" @change="onMaterialChange(index)" class="material-select">
                <option value="">Selecione um material</option>
                <option v-for="stock in stockItems" :key="stock.id" :value="stock.id">
                  {{ stock.name }} (Disponível: {{ stock.usable }})
                </option>
              </select>
              
              <input
                type="number"
                v-model.number="material.used"
                :placeholder="`Máx: ${material.idStock ? stockUsableMap[material.idStock] : '0'}`"
                :max="material.idStock ? stockUsableMap[material.idStock] : null"
                step="0.01"
                min="0"
                class="material-input"
                :class="{ 'input-error': material.used > stockUsableMap[material.idStock] }"
              />
              
              <button type="button" @click="removeMaterial(index)" class="btn-remove">
                &times;
              </button>
            </div>
            
            <button type="button" @click="addMaterial" class="btn-add-material">
              + Adicionar Material
            </button>
          </div>
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
          />
        </div>

        <!-- Valor Total (calculado) -->
        <div class="form-group">
          <label>Valor Total</label>
          <div class="total-price">
            R$ {{ calculateTotal() }}
          </div>
        </div>

        <!-- Tipo de Pagamento -->
        <div class="form-group">
          <label for="paymentType">Forma de Pagamento</label>
          <select id="paymentType" v-model="formData.paymentType">
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

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Agendamento criado com sucesso!
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Criando...' : 'Criar Agendamento' }}
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

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-bottom-color: #d7385a;
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236d2335' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 30px;
}

.form-group input::placeholder {
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

/* Materiais */
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

.material-input {
  flex: 1;
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

/* Estilos para upload de foto */
.photo-upload-area {
  width: 100%;
  min-height: 180px;
  border: 2px dashed #d7385a;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(215, 56, 90, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  cursor: pointer;
  color: #6d2335;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  background-color: rgba(215, 56, 90, 0.1);
  border-color: #5a1e2b;
}

.upload-placeholder svg {
  margin-bottom: 12px;
  opacity: 0.6;
}

.upload-placeholder p {
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 180px;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 59, 48, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.remove-photo-btn:hover {
  background-color: rgba(255, 59, 48, 1);
  transform: scale(1.1);
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

.input-error {
  border-color: #ff6b6b !important;
  background-color: rgba(255, 107, 107, 0.1) !important;
}

.material-input:focus {
  outline: none;
  border-color: #d7385a !important;
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
      default: false
    }
  },

  data() {
    return {
      clients: [],
      procedures: [],
      stockItems: [],
      stockUsableMap: {},
      photoFile: null,
      photoPreview: null,
      formData: {
        idClient: '',
        clienteName: '',
        appointmentDate: '',
        procedures: [{ id: '', name: '', type: '', price: 0 }],
        discount: 0,
        paymentType: 'money',
        materials: []
      },
      loading: false,
      error: null,
      success: false
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.fetchInitialData();
      }
    }
  },

  methods: {
    handlePhotoChange(event) {
      const file = event.target.files[0];
      
      if (file) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          this.error = 'Por favor, selecione apenas arquivos de imagem';
          return;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.error = 'A imagem deve ter no máximo 5MB';
          return;
        }

        this.photoFile = file;
        
        // Criar preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.photoPreview = e.target.result;
        };
        reader.readAsDataURL(file);
        
        this.error = null;
      }
    },

    removePhoto() {
      this.photoFile = null;
      this.photoPreview = null;
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = '';
      }
    },

    async fetchInitialData() {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error('Token não encontrado');

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const clientsRes = await fetch(`${API_BASE_URL}/clients`, { headers });
        if (clientsRes.ok) this.clients = await clientsRes.json();

        const proceduresRes = await fetch(`${API_BASE_URL}/procedures`, { headers });
        if (proceduresRes.ok) this.procedures = await proceduresRes.json();

        const stockRes = await fetch(`${API_BASE_URL}/stock`, { headers });
        if (stockRes.ok) {
          this.stockItems = await stockRes.json();
          
          this.stockUsableMap = {};
          this.stockItems.forEach(item => {
            this.stockUsableMap[item.id] = parseFloat(item.usable || 0);
          });
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        this.error = 'Erro ao carregar dados iniciais';
      }
    },

    onClientChange() {
      const client = this.clients.find(c => c.id === this.formData.idClient);
      if (client) {
        this.formData.clienteName = client.name;
      }
    },

    onProcedureChange(index) {
      const proc = this.formData.procedures[index];
      const procedure = this.procedures.find(p => p.id === proc.id);
      if (procedure) {
        proc.name = procedure.procedureName;
        proc.type = procedure.procedureType;
        proc.price = parseFloat(procedure.procedurePrice);
      }
    },

    addProcedure() {
      this.formData.procedures.push({
        id: '',
        name: '',
        type: '',
        price: 0
      });
    },

    removeProcedure(index) {
      this.formData.procedures.splice(index, 1);
    },

    onMaterialChange(index) {
      const material = this.formData.materials[index];
      const stock = this.stockItems.find(s => s.id === material.idStock);
      if (stock) {
        material.nameStock = stock.name;
        material.stockType = stock.type;
        material.cost = parseFloat(stock.price);
      }
    },

    addMaterial() {
      this.formData.materials.push({
        idStock: '',
        nameStock: '',
        cost: 0,
        used: null,
        quantity: null,
        length: null,
        stockType: ''
      });
    },

    removeMaterial(index) {
      this.formData.materials.splice(index, 1);
    },

    calculateTotal() {
      const proceduresTotal = this.formData.procedures.reduce((sum, proc) => {
        return sum + (proc.price || 0);
      }, 0);
      const discount = this.formData.discount || 0;
      const total = proceduresTotal - discount;
      return total.toFixed(2);
    },

    getUserId() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 3;
    },

    getUserName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.name || 'daniel';
    },

    closeModal() {
      if (!this.loading) {
        this.resetForm();
        this.$emit('close');
      }
    },

    resetForm() {
      this.formData = {
        idClient: '',
        clienteName: '',
        appointmentDate: '',
        procedures: [{ id: '', name: '', type: '', price: 0 }],
        discount: 0,
        paymentType: 'money',
        materials: []
      };
      this.photoFile = null;
      this.photoPreview = null;
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = '';
      }
      this.error = null;
      this.success = false;
    },

    validateMaterials() {
      for (const material of this.formData.materials) {
        if (material.idStock && material.used) {
          const available = this.stockUsableMap[material.idStock] || 0;
          if (material.used > available) {
            const stockName = this.stockItems.find(s => s.id === material.idStock)?.name || 'Material';
            throw new Error(`${stockName}: quantidade solicitada (${material.used}) excede o disponível (${available})`);
          }
        }
      }
    },

    async handleSubmit() {
      try {
        this.loading = true;
        this.error = null;
        this.success = false;

        this.validateMaterials();

        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error('Token não encontrado');

        const userId = this.getUserId();
        const userName = this.getUserName();

        const procedureTypes = this.formData.procedures
          .map(p => p.type)
          .filter(t => t)
          .join(', ');

        const commandPayload = {
          commandName: `${procedureTypes || 'Procedimento'} - ${this.formData.clienteName}`,
          idUser: userId,
          userResponsibility: userName,
          idClient: this.formData.idClient,
          clienteName: this.formData.clienteName,
          discount: this.formData.discount || 0,
          totalPrice: parseFloat(this.calculateTotal()),
          paymentType: this.formData.paymentType
        };

        const commandRes = await fetch(`${API_BASE_URL}/commands`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(commandPayload)
        });

        if (!commandRes.ok) {
          const errData = await commandRes.json();
          throw new Error(errData.message || 'Erro ao criar comanda');
        }

        const command = await commandRes.json();
        const commandId = command.id;

        // Criar agendamentos para cada procedimento
        for (const proc of this.formData.procedures) {
          if (proc.id) {
            // Usar FormData para enviar foto junto com dados do appointment
            const formData = new FormData();
            formData.append('procedure', proc.name);
            formData.append('appointmentDate', new Date(this.formData.appointmentDate).toISOString());
            
            // Adicionar foto se existir (apenas no primeiro procedimento)
            if (this.photoFile && this.formData.procedures.indexOf(proc) === 0) {
              formData.append('file', this.photoFile);
            }

            const appointmentRes = await fetch(`http://localhost:3000/appointments/commands/${commandId}/appointments`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
                // Não enviar Content-Type, o browser define automaticamente
              },
              body: formData
            });

            if (!appointmentRes.ok) {
              throw new Error('Erro ao criar agendamento');
            }
          }
        }

        // Criar movimentações de estoque
        for (const material of this.formData.materials) {
          if (material.idStock) {
            const stockMovementPayload = {
              idStock: material.idStock,
              nameStock: material.nameStock,
              cost: material.cost,
              used: material.used || 0,
              quantity: material.quantity || null,
              length: material.length || null,
              stockType: material.stockType,
              operational: true,
              movementType: 'output',
              commandId: commandId
            };

            await fetch(`${API_BASE_URL}/stock-movement`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(stockMovementPayload)
            });
          }
        }

        this.success = true;
        this.$emit('appointment-created', command);

        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao criar agendamento:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>