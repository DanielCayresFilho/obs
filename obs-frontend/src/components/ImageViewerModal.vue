<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="header-info">
          <h2>{{ clientName }}</h2>
          <p>{{ procedure }}</p>
        </div>
        <div class="header-actions">
          <button @click="printImage" class="btn-print" title="Imprimir">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
          </button>
          <button @click="downloadImage" class="btn-download" title="Baixar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button @click="closeModal" class="btn-close" title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="image-container">
        <img 
          :src="imageUrl" 
          :alt="procedure"
          ref="imageElement"
          @click="toggleZoom"
          :class="{ 'zoomed': isZoomed }"
        />
        
        <div class="zoom-hint" v-if="!isZoomed">
          Clique na imagem para ampliar
        </div>
      </div>

      <div class="image-info">
        <div class="info-item">
          <span class="info-label">📅 Data:</span>
          <span class="info-value">{{ formatDate(appointmentDate) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">⏰ Horário:</span>
          <span class="info-value">{{ formatTime(appointmentDate) }}</span>
        </div>
      </div>
    </div>

    <!-- Área de impressão (oculta) -->
    <div class="print-area">
      <div class="print-header">
        <h1>{{ clientName }}</h1>
        <p>{{ procedure }}</p>
        <p class="print-date">{{ formatDate(appointmentDate) }} - {{ formatTime(appointmentDate) }}</p>
      </div>
      <img :src="imageUrl" :alt="procedure" />
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
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  width: 95%;
  height: 95%;
  display: flex;
  flex-direction: column;
  background-color: #1a1d21;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(135deg, #2a2d31 0%, #1a1d21 100%);
  border-bottom: 2px solid #cd8f35;
}

.header-info h2 {
  margin: 0;
  font-size: 28px;
  color: #ffffff;
  font-weight: bold;
}

.header-info p {
  margin: 5px 0 0 0;
  font-size: 16px;
  color: #cd8f35;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-print,
.btn-download,
.btn-close {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.btn-print {
  background-color: #4caf50;
}

.btn-print:hover {
  background-color: #45a049;
  transform: scale(1.1);
}

.btn-download {
  background-color: #2196f3;
}

.btn-download:hover {
  background-color: #1976d2;
  transform: scale(1.1);
}

.btn-close {
  background-color: #f44336;
}

.btn-close:hover {
  background-color: #da190b;
  transform: scale(1.1);
}

.image-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  position: relative;
  overflow: auto;
  background-color: #0f0f0f;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.image-container img.zoomed {
  cursor: zoom-out;
  max-width: none;
  max-height: none;
  width: auto;
  height: auto;
  transform: scale(1.5);
}

.zoom-hint {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: none;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.image-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px 30px;
  background: linear-gradient(135deg, #1a1d21 0%, #2a2d31 100%);
  border-top: 2px solid #cd8f35;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-size: 16px;
  color: #888;
  font-weight: 600;
}

.info-value {
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
}

/* Estilos para impressão */
.print-area {
  display: none;
}

@media print {
  body * {
    visibility: hidden;
  }
  
  .print-area,
  .print-area * {
    visibility: visible;
  }
  
  .print-area {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    display: block;
    padding: 20mm;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 2px solid #000;
  }
  
  .print-header h1 {
    margin: 0 0 10px 0;
    font-size: 32px;
    color: #000;
  }
  
  .print-header p {
    margin: 5px 0;
    font-size: 18px;
    color: #333;
  }
  
  .print-date {
    font-weight: bold;
    margin-top: 10px !important;
  }
  
  .print-area img {
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
    page-break-inside: avoid;
  }
}

/* Scrollbar para área de zoom */
.image-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.image-container::-webkit-scrollbar-track {
  background: #1a1d21;
}

.image-container::-webkit-scrollbar-thumb {
  background: #cd8f35;
  border-radius: 5px;
}

.image-container::-webkit-scrollbar-thumb:hover {
  background: #b87d2e;
}
</style>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    },
    clientName: {
      type: String,
      default: ''
    },
    procedure: {
      type: String,
      default: ''
    },
    appointmentDate: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      isZoomed: false
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        this.isZoomed = false;
      }
    }
  },

  methods: {
    closeModal() {
      this.$emit('close');
    },

    toggleZoom() {
      this.isZoomed = !this.isZoomed;
    },

    printImage() {
      window.print();
    },

    async downloadImage() {
      try {
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fileName = `${this.clientName}_${this.procedure}_${new Date().toISOString().split('T')[0]}.png`;
        link.download = fileName.replace(/\s+/g, '_');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao baixar imagem:', error);
        alert('Erro ao baixar a imagem. Tente novamente.');
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },

  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>