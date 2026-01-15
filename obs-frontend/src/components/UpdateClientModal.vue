<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Editar Cliente</h2>
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
            
            <div v-if="!photoPreview && !currentPhoto" class="upload-placeholder" @click="$refs.photoInput.click()">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>Clique para selecionar uma foto</p>
            </div>

            <div v-else class="photo-preview">
              <img :src="photoPreview || currentPhoto" alt="Preview" />
              <div class="photo-actions">
                <button type="button" class="change-photo-btn" @click="$refs.photoInput.click()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button type="button" class="remove-photo-btn" @click="removePhoto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Cliente atualizado com sucesso!
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-delete" @click="handleDelete" :disabled="loading">
            Excluir
          </button>
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
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
.btn-submit:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete {
  flex: 0.5;
  padding: 12px 16px;
  border: 2px solid #ff4444;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background-color: transparent;
  color: #ff4444;
}

.btn-delete:hover:not(:disabled) {
  background-color: #ff4444;
  color: white;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: black;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  resize: vertical;
  font-family: inherit;
}

.form-group textarea:focus {
  outline: none;
  border-color: #d7385a;
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

.photo-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.change-photo-btn,
.remove-photo-btn {
  background-color: rgba(0, 0, 0, 0.7);
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

.change-photo-btn:hover {
  background-color: rgba(205, 143, 53, 0.9);
  transform: scale(1.1);
}

.remove-photo-btn:hover {
  background-color: rgba(255, 59, 48, 0.9);
  transform: scale(1.1);
}
</style>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    client: {
      type: Object,
      default: null
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
      currentPhoto: null,
      photoFile: null,
      photoPreview: null,
      loading: false,
      error: null,
      success: false
    }
  },

  watch: {
    client: {
      immediate: true,
      handler(newClient) {
        if (newClient) {
          this.loadClientData(newClient);
        }
      }
    }
  },

  methods: {
    loadClientData(client) {
      this.formData = {
        name: client.name || '',
        phone: client.phone || '',
        birthday: this.formatDateForInput(client.birthday) || '',
        instagram: client.instagram || '',
        observations: client.observations || ''
      };
      this.currentPhoto = client.clientPicture || null;
      this.photoFile = null;
      this.photoPreview = null;
    },

    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

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
      this.currentPhoto = null;
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
      this.currentPhoto = null;
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

        if (!this.client || !this.client.id) {
          throw new Error('Cliente não encontrado');
        }

        // 1. Atualizar dados básicos do cliente
        const updatePayload = {
          name: this.formData.name,
          phone: this.formData.phone,
          birthday: this.formData.birthday,
          instagram: this.formData.instagram || null,
          observations: this.formData.observations || null
        };

        const updateResponse = await fetch(`http://localhost:3000/clients/${this.client.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.message || 'Erro ao atualizar cliente');
        }

        let updatedClient = await updateResponse.json();

        // 2. Atualizar foto se houver uma nova
        if (this.photoFile) {
          const photoFormData = new FormData();
          photoFormData.append('file', this.photoFile);

          const photoResponse = await fetch(`http://localhost:3000/clients/${this.client.id}/profile-pic`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: photoFormData
          });

          if (!photoResponse.ok) {
            const errorData = await photoResponse.json();
            throw new Error(errorData.message || 'Erro ao atualizar foto');
          }

          updatedClient = await photoResponse.json();
        }

        this.success = true;
        
        // Emitir evento de sucesso com os dados do cliente atualizado
        this.$emit('client-updated', updatedClient);

        // Fechar modal após 1.5 segundos
        setTimeout(() => {
          this.closeModal();
        }, 1500);

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao atualizar cliente:', err);
      } finally {
        this.loading = false;
      }
    },

    async handleDelete() {
      if (!confirm('Tem certeza que deseja EXCLUIR este cliente? Esta ação não pode ser desfeita.')) {
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        if (!this.client || !this.client.id) {
          throw new Error('Cliente não encontrado');
        }

        const response = await fetch(`http://localhost:3000/clients/${this.client.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao excluir cliente');
        }

        this.$emit('client-deleted', this.client.id);
        this.closeModal();

      } catch (err) {
        this.error = err.message;
        console.error('Erro ao excluir cliente:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>