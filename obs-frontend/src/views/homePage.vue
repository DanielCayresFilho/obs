<template>
  <div class="parent">
    <div class="div1">
      <Sidebar />
    </div>

    <div class="div2">
      <img src="../assets/images/logo-só-texto-amarelo.png" alt="">
    </div>

   
<div class="div3">
      <h1 class="titulos">Próximos Agendamentos</h1>
      
      <div class="appointments-container">
        <div v-if="loading" class="loading-message">
          Carregando...
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else-if="appointments.length === 0" class="empty-message">
          Nenhum agendamento encontrado
        </div>

        <div 
          v-else
          v-for="appointment in appointments" 
          :key="appointment.id"
          class="appointment-card"
        >
          <div class="appointment-info">
            <h3 class="client-name">{{ formatDate(appointment.appointmentDate) }} - {{ appointment.clienteName }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="div4">
      <h1 class="titulos">Sessões Concluídas</h1>

      <div class="done-container">
        <div v-if="loading" class="loading-message">
          Carregando...
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

          <h3 class="done">{{ dones }} Sessões</h3>
      </div>

      
    </div>

    <div class="div5">
      <h1 class="titulos">Valor Mensal Faturado</h1>

      <div class="paid-container">
        <div v-if="loading" class="loading-message">
          Carregando...
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <h3 class="valor-paid">R$ {{ formatCurrency(paidData) }}</h3>
      </div>
    </div>

    <div class="div6">
      <h1 class="titulo-baixo">Resumo Financeiro</h1>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <div class="div7">
      <h1 class="titulos">Valor A Receber</h1>
      
      <div class="valor-container">
        <div v-if="loading" class="loading-message">
          Carregando...
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <h3 class="valor-receber">R$ {{ formatCurrency(valorReceber) }}</h3>
      </div>
    </div>

    <div class="div8">
      <button  @click="showModal = true" class="cliente">+ NOVO CLIENTE</button>

      <NewClientModal 
      :isOpen="showModal" 
      @close="showModal = false"
      @client-created="handleClientCreated"
    />
    </div>

    <div class="div9">
      <button @click="showAppointmentModal = true" class="agendamento">+ NOVO AGENDAMENTO</button>
       
      <NewAppointmentModal 
  :isOpen="showAppointmentModal" 
  @close="showAppointmentModal = false"
  @appointment-created="handleAppointmentCreated"
/>
    </div>

    <div class="div10">
      <h1 class="titulos">Notificações</h1>

      <div class="notifications-container">
        <div v-if="loading" class="loading-message">
          Carregando...
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else-if="birthdays.length === 0" class="empty-message">
          Nenhum aniversariante hoje
        </div>

        <div 
          v-else
          v-for="(birthday, index) in birthdays" 
          :key="index"
          class="notification-item"
        >
          <p class="notification-text">🎉 Aniversariante: {{ birthday.name }}</p>
        </div>
      </div>

    </div>
  </div>
</template>


<style scoped>
div {
  background-color: #0f0f0f;
  color: white;
}

.titulos {
  color: #cd8f35;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 20px;
  top: 12px;
  margin: 12px;
  font-size: 22px;
}

.titulo-baixo {
  color: #cd8f35;
  position: absolute;
  bottom: 0;
  left: 20px;
  margin: 12px;
  font-size: 22px;
}

/* Contador de sessões */
.sessoes-count {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

/* Container dos appointments */
.appointments-container {
  margin-top: 60px;
  padding: 8px;
  max-height: calc(100% - 80px);
  overflow-y: auto;
  background-color: transparent;
}

.appointment-card {
  background-color: transparent;
  border-radius: 8px;
  padding: 6px 22px;
  margin-bottom: 10px;
  transition: transform 0.2s;
}

.appointment-card:hover {
  transform: scale(1.02)
}

.appointment-info{
  background-color: transparent;
}


.client-name {
  font-size: 15px;
  font-weight: lighter;
  color: #ffffff;
  margin: 0;
  background-color: transparent;
}

.done-container {
  margin-top: 60px;
  padding: 20px;
  max-height: calc(100% - 80px);
  background-color: #121517;
  position: relative;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

.done {
  font-size: 18px;
  font-weight: lighter;
  color: #ffffff;
  margin: 0;
  background-color: #121517;
  position: absolute;
  left: 20px;
  bottom: 2px;
  margin: 12px;
}

.valor-container {
  margin-top: 60px;
  padding: 20px;
  max-height: calc(100% - 80px);
  background-color: #121517;
  position: relative;
}

.valor-receber {
  font-size: 18px;
  font-weight: lighter;
  color: #ffffff;
  margin: 0;
  background-color: #121517;
  position: absolute;
  left: 20px;
  bottom: 2px;
  margin: 12px;
}


.notifications-container {
  margin-top: 60px;
  padding: 20px;
  max-height: calc(100% - 80px);
  background-color: #121517;
  position: relative;

  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

.notification-text {
  font-size: 18px;
  font-weight: lighter;
  color: #ffffff;
  margin: 0;
  background-color: #121517;
  position: absolute;
  left: 20px;
  bottom: 2px;
  margin: 12px;
}



/* Estilo padrão (para desktop) */
.paid-container {
  margin-top: 60px;
  padding: 12px;
  max-height: calc(100% - 80px);
  background-color: #121517;
  position: relative;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

.valor-paid {
  font-size: 18px;
  font-weight: lighter;
  color: #ffffff;
  margin: 0;
  background-color: #121517;
  position: absolute;
  left: 20px;
  bottom: -2px;
  margin: 12px;
}

/* Estilo para iPad (ou telas menores) */
@media (max-width: 1024px) {
  .paid-container {
    padding: 6px;
  }

  .valor-paid {
    margin: 10px; /* ou ajuste conforme necessário */
  }

  .titulos {
    font-size: 16px;
  }
}



/* Mensagens de estado */
.loading-message,
.error-message,
.empty-message {

  font-size: 18px;
  font-weight: lighter;
  color: #ffffff;
  margin: 0;
  background-color: #121517;
  position: absolute;
  left: 20px;
  bottom: -2px;
  margin: 12px;
}

.loading-message {
  color: #888;
}

.error-message {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
}

.empty-message {
  color: #888;
}

.appointments-container::-webkit-scrollbar {
  width: 6px;
}

.appointments-container::-webkit-scrollbar-track {
  background: #1a1d21;
  border-radius: 4px;
}

.appointments-container::-webkit-scrollbar-thumb {
  background: #cd8f35;
  border-radius: 4px;
}

.appointments-container::-webkit-scrollbar-thumb:hover {
  background: #b87d2e;
}
/* BOTÕES */
.cliente,
.agendamento {
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
  border: none;
  border-radius: 10px;
  width: 250px;
  height: 60px;
  color: white;
  font-weight: bolder;
  font-size: 20px;
  margin: 10px auto;
  cursor: pointer;
  transition: transform 0.2s;
}

.cliente:hover,
.agendamento:hover {
  transform: scale(1.05);
}

/* Centralização com Flexbox */
.div8,
.div9 {
  display: flex;
  justify-content: center;
  align-items: center;
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
  grid-column: span 3 / span 3;
  grid-row: span 5 / span 5;
  grid-column-start: 2;
  grid-row-start: 3;
  position: relative;
  background-color: #121517;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

.div4 {
  grid-column: span 2 / span 2;
  grid-row: span 2 / span 2;
  grid-column-start: 5;
  grid-row-start: 3;
  position: relative;
  background-color: #121517;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

.div5 {
  grid-column: span 2 / span 2;
  grid-row: span 2 / span 2;
  grid-column-start: 5;
  grid-row-start: 6;
  position: relative;
  background-color: #121517;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

.div6 {
  grid-column: span 5 / span 5;
  grid-row: span 8 / span 8;
  grid-column-start: 2;
  grid-row-start: 8;
  background-color: #121517;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
  position: relative;
}

.div7 {
  grid-column: span 3 / span 3;
  grid-row: span 2 / span 2;
  grid-column-start: 2;
  grid-row-start: 16;
  position: relative;
  background-color: #121517;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

.div8 {
  grid-column: span 2 / span 2;
  grid-column-start: 5;
  grid-row-start: 16;
  position: relative;
}

.div9 {
  grid-column: span 2 / span 2;
  grid-column-start: 5;
  grid-row-start: 17;
  position: relative;
}

.div10 {
  grid-column: span 5 / span 5;
  grid-row: span 2 / span 2;
  grid-column-start: 2;
  grid-row-start: 18;
  position: relative;
  background-color: #121517;
  border-radius: 12px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.24);
}

/* Container do gráfico */
.chart-container {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 50px;
  padding: 10px;
  background-color: #121517;
}
</style>

<script setup>
import Sidebar from '@/components/Sidebar.vue';

import NewClientModal from '@/components/NewClientModal.vue';

import NewAppointmentModal from '@/components/NewAppointmentModal.vue';

</script>

<script>



import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  data() {
    return {
      appointments: [],
      commands: [],
      dones: 0,
      valorReceber: 0,
      loading: true,
      error: null,
      chart: null,
      userId: null,
      showModal: false,
      showAppointmentModal: false
    }
  },
  
  mounted() {
    this.getUserId();
    this.fetchData();
  },
  
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  
  methods: {
    getUserId() {
      // Ajuste conforme onde você armazena o userId
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.userId = user.id || 3; // fallback para 3 se não encontrar
    },

    async fetchData() {
      try {
        this.loading = true
        this.error = null

        const token = localStorage.getItem('jwt_token')
        
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Buscar sessões concluídas
        const donesRes = await fetch('http://localhost:3000/commands/done', {
          headers
        }) 
        if (!donesRes.ok) throw new Error('Erro ao buscar sessões concluídas')
        const donesData = await donesRes.json()
        this.dones = donesData.total

        // Buscar valor a receber
        const valorReceberRes = await fetch(`http://localhost:3000/analytics/commands-this-value?userid=${this.userId}`, {
          headers
        })
        if (!valorReceberRes.ok) throw new Error('Erro ao buscar valor a receber')
        const valorReceberData = await valorReceberRes.json()
        this.valorReceber = parseFloat(valorReceberData.total || 0)

        // Buscar appointments
        const appointmentsRes = await fetch('http://localhost:3000/appointments', {
          headers
        })
        if (!appointmentsRes.ok) throw new Error('Erro ao buscar agendamentos')
        const appointmentsData = await appointmentsRes.json()

        // Buscar commands
        const commandsRes = await fetch('http://localhost:3000/commands/waiting', {
          headers
        })
        if (!commandsRes.ok) throw new Error('Erro ao buscar comandas')
        const commandsData = await commandsRes.json()

        const paidRes = await fetch(`http://localhost:3000/analytics/commands-this-value-paid?userid=${this.userId}`, {
          headers
        })
        if (!paidRes.ok) throw new Error('Erro ao buscar comandas')
        const paidData = await paidRes.json()
        this.paidData = parseFloat(paidData.total || 0)

         const birthdayRes = await fetch(`http://localhost:3000/clients/birthday`, {
          headers
        })
        if (!birthdayRes.ok) throw new Error('Erro ao buscar aniversariantes')
        const birthdayData = await birthdayRes.json()
        this.birthdays = birthdayData

        // Criar um mapa de comandas por ID para acesso rápido
         const commandsMap = {}
    commandsData.forEach(cmd => {
      commandsMap[cmd.id] = cmd
    })

    // Combinar os dados e filtrar apenas appointments com commands waiting
    this.appointments = appointmentsData
      .filter(apt => commandsMap[apt.commandId]) // Filtra apenas appointments que têm comanda waiting
      .map(apt => ({
        ...apt,
        clienteName: commandsMap[apt.commandId].clienteName
      }))
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)) // Ordena por data
        
      
      // Buscar dados do gráfico
        await this.fetchChartData(headers)

      } catch (err) {
        this.error = err.message
        console.error('Erro:', err)
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },

    formatCurrency(value) {
      return parseFloat(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    async fetchChartData(headers) {
      try {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        const response = await fetch(
          `http://localhost:3000/analytics/commands-value?userid=${this.userId}&startdate=${startDate}&enddate=${endDate}`,
          { headers }
        );

        if (!response.ok) throw new Error('Erro ao buscar dados do gráfico');
        const data = await response.json();

        this.createChart(data);
      } catch (err) {
        console.error('Erro ao buscar dados do gráfico:', err);
      }
    },

    createChart(data) {
      const monthsAbbr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      
      // Criar array com valores para cada mês
      const chartData = monthsAbbr.map((month, index) => {
        const monthKey = `${new Date().getFullYear()}-${String(index + 1).padStart(2, '0')}`;
        return parseFloat(data[monthKey] || 0);
      });

      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Destruir gráfico anterior se existir
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthsAbbr,
          datasets: [{
            label: 'Valor Mensal (R$)',
            data: chartData,
            backgroundColor: '#4a1c27',
            borderColor: '#4a1c27',
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return 'R$ ' + context.parsed.y.toFixed(2);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#ffffff',
                font: {
                  weight: 'bold'
                },
                callback: function(value) {
                  return 'R$ ' + value;
                }
              },
              grid: {
                color: '#2a2d31'
              }
            },
            x: {
              ticks: {
                color: '#ffffff',
                font: {
                  weight: 'bold'
                }
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    },
    handleClientCreated(client) {
      console.log('Cliente criado:', client);
      // Você pode adicionar lógica aqui para atualizar alguma lista se necessário
    },
    handleAppointmentCreated(command) {
  console.log('Agendamento criado:', command);
  this.fetchData(); // Recarrega os dados
}
  }
}
</script>