<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Novo Cliente</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="name">Nome *</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            placeholder="Digite o nome completo"
            required
          />
        </div>

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

        <div class="form-group">
          <label for="birthday">Data de Nascimento *</label>
          <input
            type="date"
            id="birthday"
            v-model="formData.birthday"
            required
          />
        </div>

        <div class="form-group">
          <label for="instagram">Instagram</label>
          <input
            type="text"
            id="instagram"
            v-model="formData.instagram"
            placeholder="@usuario"
          />
        </div>

        <div class="form-group">
          <label for="observations">Observações</label>
          <textarea
            id="observations"
            v-model="formData.observations"
            placeholder="Ex: Indicação da Maria, alergia a látex..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="photo">Foto do Cliente</label>
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
              <p>Clique para selecionar uma foto</p>
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

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Cliente cadastrado com sucesso!
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar Cliente' }}
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
  /* background: linear-gradient(1deg, #5a1e2b, #d7385a); */
  margin: 0;
  font-size: 28px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
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
  color: black;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #cd8f35;
}

.form-group input::placeholder {
  color: #666;
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

/* Estilos para upload de foto */
.photo-upload-area {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #6d2335;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(109, 35, 53, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  cursor: pointer;
  color: #6d2335;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  background-color: rgba(109, 35, 53, 0.1);
  border-color: #cd8f35;
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
  height: 200px;
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
      formData: {
        name: '',
        phone: '',
        birthday: '',
        instagram: '',
        observations: ''
      },
      photoFile: null,
      photoPreview: null,
      loading: false,
      error: null,
      success: false
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
        name: '',
        phone: '',
        birthday: '',
        instagram: '',
        observations: ''
      };
      this.photoFile = null;
      this.photoPreview = null;
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = '';
      }
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

        // Criar FormData para enviar arquivo e dados
        const formData = new FormData();
        formData.append('name', this.formData.name);
        formData.append('phone', this.formData.phone);
        formData.append('birthday', this.formData.birthday);
        
        if (this.formData.instagram) {
          formData.append('instagram', this.formData.instagram);
        }
        
        if (this.formData.observations) {
          formData.append('observations', this.formData.observations);
        }
        
        // Adicionar foto se existir
        if (this.photoFile) {
          formData.append('file', this.photoFile);
        }

        const response = await fetch(`${API_BASE_URL}/clients`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Não enviar Content-Type, o browser define automaticamente para multipart/form-data
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao cadastrar cliente');
        }

        const data = await response.json();
        
        this.success = true;
        
        // Emitir evento de sucesso com os dados do cliente criado
        this.$emit('client-created', data);

        // Fechar modal após 1.5 segundos
        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao cadastrar cliente:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>