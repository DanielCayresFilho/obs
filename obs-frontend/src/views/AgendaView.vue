<template>
<div class="parent">
    
    <div class="div1">
      <Sidebar />
    </div>
    
    <div class="div2">
        <img src="../assets/images/logo-só-texto-amarelo.png" alt="">
    </div>
    
    <div class="div3">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Buscar agendamento..."
        class="search-input"
      >
    </div>
    
    <div class="div4">
      <button @click="showModal = true" class="btn-new-appointment">+ Novo</button>
      
      <NewAppointmentModal 
        :isOpen="showModal" 
        @close="showModal = false"
        @appointment-created="handleAppointmentCreated"
      />
    </div>
    
    <div class="div5">
      <div v-if="loading" class="loading-message">
        Carregando agendamentos...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="filteredAppointments.length === 0" class="empty-message">
        {{ searchQuery ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento cadastrado' }}
      </div>

      <div v-else class="appointments-grid">
        <div 
          v-for="appointment in filteredAppointments" 
          :key="appointment.id"
          class="appointment-card"
          :class="getStatusClass(appointment.appointment)"
        >
          <div class="appointment-header">
            <div class="appointment-photo" v-if="appointment.appointmentPicture">
              <img :src="appointment.appointmentPicture" :alt="appointment.procedure" />
            </div>
            <div class="appointment-placeholder" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div class="appointment-info">
              <h3 class="appointment-client">{{ getCommandData(appointment.commandId)?.clienteName || 'Cliente não encontrado' }}</h3>
              <p class="appointment-procedure">{{ appointment.procedure }}</p>
            </div>
          </div>
          
          <div class="appointment-details">
            <div class="detail-item">
              <span class="detail-label">📅 Data:</span>
              <span class="detail-value">{{ formatAppointmentDate(appointment.appointmentDate) }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">⏰ Horário:</span>
              <span class="detail-value">{{ formatAppointmentTime(appointment.appointmentDate) }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">💰 Valor Total:</span>
              <span class="detail-value">R$ {{ getCommandData(appointment.commandId)?.totalPrice || '0.00' }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">💳 Pagamento:</span>
              <span class="detail-value">{{ formatPaymentType(getCommandData(appointment.commandId)?.paymentType) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">📊 Status:</span>
              <span class="detail-value status-badge" :class="getStatusClass(appointment.appointment)">
                {{ formatStatus(appointment.appointment) }}
              </span>
            </div>
          </div>
          
          <div class="appointment-actions">
            <button @click="viewAppointment(appointment)" class="btn-view">Ver Detalhes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edição (fora do loop) -->
    <UpdateAppointmentModal 
      :isOpen="showUpdateModal" 
      :appointment="selectedAppointment"
      @close="showUpdateModal = false"
      @appointment-updated="handleAppointmentUpdated"
    />
</div>
</template>

<style scoped>
div {
  background-color: #0f0f0f;
  color: white;
}

/* GRADE PRINCIPAL */
.parent {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(23, 1fr);
  gap: 10px;
  height: 100vh;
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
}

.search-input {
  width: 90%;
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

.div4 {
  grid-column-start: 6;
  grid-row-start: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-new-appointment {
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  border: none;
  border-radius: 10px;
  width: 80%;
  height: 48px;
  color: white;
  font-weight: bolder;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-new-appointment:hover {
  transform: scale(1.05);
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
.loading-message,
.error-message,
.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #888;
}

.error-message {
  color: #ff6b6b;
}

/* GRID DE AGENDAMENTOS */
.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  background-color: transparent;
}

.appointment-card {
  background-color: #1a1d21;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.appointment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(205, 143, 53, 0.2);
  border-color: #cd8f35;
}


.appointment-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a2d31;
  background-color: transparent;
}

.appointment-photo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #cd8f35;
  background-color: #2a2d31;
}

.appointment-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.appointment-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 2px dashed #2a2d31;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
}

.appointment-info {
  flex: 1;
  min-width: 0;
  background-color: transparent;
}

.appointment-client {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-procedure {
  font-size: 14px;
  color: #cd8f35;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  background-color: transparent;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  background-color: transparent;
}

.detail-label {
  color: #888;
  font-weight: 600;
}

.detail-value {
  color: #ffffff;
  text-align: right;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.waiting {
  background-color: rgba(255, 167, 38, 0.2);
  color: #ffa726;
}

.status-badge.confirmed {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.completed {
  background-color: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.status-badge.cancelled {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.appointment-actions {
  display: flex;
  gap: 10px;
}

.btn-view {
  flex: 1;
  padding: 10px;
  background-color: #2a2d31;
  border: 1px solid #cd8f35;
  border-radius: 8px;
  color: #cd8f35;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background-color: #cd8f35;
  color: #000;
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

/* RESPONSIVIDADE */
@media (max-width: 1200px) {
  .appointments-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .div2 img {
    max-width: 50%;
  }
}

@media (max-width: 768px) {
  .parent {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
    min-height: 100vh;
  }

  .div1 {
    grid-row: 1;
    grid-column: 1;
    height: auto;
  }

  .div2 {
    grid-column: 1;
    grid-row: 2;
    padding: 20px 0;
  }

  .div2 img {
    max-width: 60%;
  }

  .div3 {
    grid-column: 1;
    grid-row: 3;
    left: 0;
    padding: 0 20px;
  }

  .search-input {
    width: 100%;
  }

  .div4 {
    grid-column: 1;
    grid-row: 4;
    padding: 0 20px;
  }

  .btn-new-appointment {
    width: 100%;
  }

  .div5 {
    grid-column: 1;
    grid-row: 5;
    padding: 10px;
  }

  .appointments-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import NewAppointmentModal from '@/components/NewAppointmentModal.vue';
 import UpdateAppointmentModal from '@/components/UpdateAppointmentModal.vue';
</script>

<script>
export default {
  data() {
    return {
      appointments: [],
      commands: [],
      searchQuery: '',
      loading: true,
      error: null,
      showModal: false,
      showUpdateModal: false,
      selectedAppointment: null
    }
  },

  computed: {
    filteredAppointments() {
      if (!this.searchQuery) {
        return this.appointments;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.appointments.filter(appointment => {
        const command = this.getCommandData(appointment.commandId);
        return (
          appointment.procedure.toLowerCase().includes(query) ||
          (command && command.clienteName.toLowerCase().includes(query)) ||
          this.formatStatus(appointment.appointment).toLowerCase().includes(query)
        );
      });
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

        // Buscar appointments e commands em paralelo
        const [appointmentsRes, commandsRes] = await Promise.all([
          fetch('http://localhost:3000/appointments', { headers }),
          fetch('http://localhost:3000/commands', { headers })
        ]);

        if (!appointmentsRes.ok || !commandsRes.ok) {
          throw new Error('Erro ao buscar dados');
        }

        this.appointments = await appointmentsRes.json();
        this.commands = await commandsRes.json();

        // Ordenar por data mais próxima
        this.appointments.sort((a, b) => {
          return new Date(a.appointmentDate) - new Date(b.appointmentDate);
        });

      } catch (err) {
        this.error = err.message;
        console.error('Erro:', err);
      } finally {
        this.loading = false;
      }
    },

    getCommandData(commandId) {
      return this.commands.find(cmd => cmd.id === commandId);
    },

    handleAppointmentCreated(appointment) {
      console.log('Agendamento criado:', appointment);
      this.fetchData();
    },

    handleAppointmentUpdated(appointment) {
      console.log('Agendamento atualizado:', appointment);
      this.fetchData();
    },

    viewAppointment(appointment) {
      this.selectedAppointment = {
        ...appointment,
        command: this.getCommandData(appointment.commandId)
      };
      this.showUpdateModal = true;
    },

    formatAppointmentDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatAppointmentTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatPaymentType(type) {
      const types = {
        'money': 'Dinheiro',
        'pix': 'PIX',
        'debit': 'Débito',
        'credit': 'Crédito à vista',
        'credit2x': 'Crédito 2x',
        'credit3x': 'Crédito 3x',
        'credit4x': 'Crédito 4x',
        'credit5x': 'Crédito 5x',
        'credit6x': 'Crédito 6x'
      };
      return types[type] || type;
    },

    formatStatus(status) {
      const statuses = {
        'waiting': 'Aguardando',
        'confirmed': 'Confirmado',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
      };
      return statuses[status] || status;
    },

    getStatusClass(status) {
      return status;
    }
  }
}
</script>