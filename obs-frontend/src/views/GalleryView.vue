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
          placeholder="Buscar por cliente ou procedimento..."
          class="search-input"
        >
        <select v-model="sortBy" class="sort-select">
          <option value="recent">Mais Recentes</option>
          <option value="oldest">Mais Antigos</option>
          <option value="client">Cliente A-Z</option>
        </select>
      </div>
    </div>
    
    <div class="div4">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalPhotos }}</span>
          <span class="stat-label">Fotos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalClients }}</span>
          <span class="stat-label">Clientes</span>
        </div>
      </div>
    </div>
    
    <div class="div5">
      <div v-if="loading" class="loading-message">
        <div class="spinner"></div>
        <p>Carregando galeria...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="filteredGallery.length === 0" class="empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <p>{{ searchQuery ? 'Nenhuma foto encontrada' : 'Nenhuma foto disponível na galeria' }}</p>
      </div>

      <div v-else class="gallery-grid">
        <div 
          v-for="item in filteredGallery" 
          :key="item.id"
          class="gallery-item"
          @click="openImage(item)"
        >
          <div class="image-wrapper">
            <img :src="item.appointmentPicture" :alt="item.procedure" />
            <div class="image-overlay">
              <div class="overlay-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="item-info">
            <div class="client-avatar">
              {{ getInitials(item.clientName) }}
            </div>
            <div class="item-details">
              <h3 class="client-name">{{ item.clientName }}</h3>
              <p class="procedure-name">{{ item.procedure }}</p>
              <div class="item-meta">
                <span class="meta-date">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {{ formatDate(item.appointmentDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Visualização de Imagem -->
    <ImageViewerModal
      :isOpen="showImageModal"
      :imageUrl="selectedImage.url"
      :clientName="selectedImage.clientName"
      :procedure="selectedImage.procedure"
      :appointmentDate="selectedImage.date"
      @close="showImageModal = false"
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
  background-color: #0f0f0f;
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
  padding: 0;
  background-color: #0f0f0f;
}

.stats {
  display: flex;
  gap: 30px;
  padding: 15px 30px;
  border-radius: 12px;
  background-color: transparent;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #cd8f35 0%, #ffa726 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
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

/* GRID DA GALERIA */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(23, 1fr);
  gap: 20px;
  padding-bottom: 20px;
}

.gallery-item {
  background-color: #1a1d21;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(205, 143, 53, 0.3);
  border-color: #cd8f35;
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Aspect ratio 1:1 */
  overflow: hidden;
  background-color: #2a2d31;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover .image-wrapper img {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(205, 143, 53, 0.8) 0%, rgba(255, 167, 38, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.overlay-content svg {
  color: white;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.item-info {
  padding: 15px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.client-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #cd8f35 0%, #ffa726 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: #0f0f0f;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(205, 143, 53, 0.3);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.client-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.procedure-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #cd8f35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #888;
}

.meta-date svg {
  color: #cd8f35;
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
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 1200px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .filters {
    flex-direction: column;
  }
}
</style>

<script setup>
import { API_BASE_URL } from '@/config/api';
import Sidebar from '@/components/Sidebar.vue';
import ImageViewerModal from '@/components/ImageViewerModal.vue';
</script>

<script>
export default {
  data() {
    return {
      appointments: [],
      commands: [],
      searchQuery: '',
      sortBy: 'recent',
      loading: true,
      error: null,
      showImageModal: false,
      selectedImage: {
        url: '',
        clientName: '',
        procedure: '',
        date: ''
      }
    }
  },

  computed: {
    galleryItems() {
      // Filtrar apenas appointments com fotos
      return this.appointments
        .filter(apt => apt.appointmentPicture)
        .map(apt => {
          const command = this.commands.find(cmd => cmd.id === apt.commandId);
          return {
            ...apt,
            clientName: command?.clienteName || 'Cliente não encontrado'
          };
        });
    },

    filteredGallery() {
      let filtered = [...this.galleryItems];

      // Filtrar por busca
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.clientName.toLowerCase().includes(query) ||
          item.procedure.toLowerCase().includes(query)
        );
      }

      // Ordenar
      switch (this.sortBy) {
        case 'recent':
          filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
          break;
        case 'client':
          filtered.sort((a, b) => a.clientName.localeCompare(b.clientName));
          break;
      }

      return filtered;
    },

    totalPhotos() {
      return this.galleryItems.length;
    },

    totalClients() {
      const uniqueClients = new Set(this.galleryItems.map(item => item.clientName));
      return uniqueClients.size;
    }
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [appointmentsRes, commandsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/appointments`, { headers }),
          fetch(`${API_BASE_URL}/commands`, { headers })
        ]);

        if (!appointmentsRes.ok || !commandsRes.ok) {
          throw new Error('Erro ao buscar dados');
        }

        this.appointments = await appointmentsRes.json();
        this.commands = await commandsRes.json();

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    openImage(item) {
      this.selectedImage = {
        url: item.appointmentPicture,
        clientName: item.clientName,
        procedure: item.procedure,
        date: item.appointmentDate
      };
      this.showImageModal = true;
    },

    getInitials(name) {
      if (!name) return '?';
      const names = name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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