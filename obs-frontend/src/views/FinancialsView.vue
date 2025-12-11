<template>
<div class="parent">
    
    <div class="div1">
      <Sidebar />
    </div>
    
    <div class="div2">
        <img src="../assets/images/logo-só-texto-amarelo.png" alt="">
    </div>
    
    <div class="div3">
      <div class="date-filters">
        <div class="date-group">
          <label>Data Inicial:</label>
          <input 
            type="date" 
            v-model="startDate"
            @change="fetchAnalytics"
            class="date-input"
          >
        </div>
        <div class="date-group">
          <label>Data Final:</label>
          <input 
            type="date" 
            v-model="endDate"
            @change="fetchAnalytics"
            class="date-input"
          >
        </div>
      </div>
    </div>
    
    <div class="div4">
      <button @click="showNewSaleModal = true" class="btn-new-sale">💰 Nova Venda</button>
      <button @click="showNewFinancialModal = true" class="btn-new-financial">+ Nova Conta</button>
    </div>
    
    <div class="div5">
      <div v-if="loading" class="loading-message">
        <div class="spinner"></div>
        <p>Carregando dados financeiros...</p>
      </div>

      <div v-else class="financial-content">
        <!-- Cards de Resumo -->
        <div class="summary-cards">
          <div class="summary-card revenue">
            <div class="card-icon">💵</div>
            <div class="card-info">
              <h3>Receita Total</h3>
              <p class="card-value">R$ {{ formatPrice(totalRevenue) }}</p>
              <span class="card-label">Valore Recebido</span>
            </div>
          </div>

          <div class="summary-card expenses">
            <div class="card-icon">💸</div>
            <div class="card-info">
              <h3>Custos Operacionais</h3>
              <p class="card-value">R$ {{ formatPrice(operationalCosts) }}</p>
              <span class="card-label">Estoque e materiais</span>
            </div>
          </div>

          <div class="summary-card bills">
            <div class="card-icon">🧾</div>
            <div class="card-info">
              <h3>Contas do Estúdio</h3>
              <p class="card-value">R$ {{ formatPrice(studioCosts) }}</p>
              <span class="card-label">Aluguel, luz, água</span>
            </div>
          </div>

          <div class="summary-card profit" :class="profitClass">
            <div class="card-icon">{{ profitIcon }}</div>
            <div class="card-info">
              <h3>Lucro Líquido</h3>
              <p class="card-value">R$ {{ formatPrice(netProfit) }}</p>
              <span class="card-label">Receita - Despesas</span>
            </div>
          </div>
        </div>

        <!-- Gráfico de Receitas e Despesas -->
        <div class="chart-section">
          <h2 class="section-title">Visão Geral Financeira</h2>
          <div class="chart-container">
            <canvas ref="financeChart"></canvas>
          </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="tabs-section">
          <div class="tabs-header">
            <button 
              :class="['tab-button', { active: activeTab === 'financials' }]"
              @click="activeTab = 'financials'"
            >
              🧾 Contas a Pagar
            </button>
            <button 
              :class="['tab-button', { active: activeTab === 'sales' }]"
              @click="activeTab = 'sales'"
            >
              💰 Vendas
            </button>
            <button 
              :class="['tab-button', { active: activeTab === 'movements' }]"
              @click="activeTab = 'movements'"
            >
              📦 Movimentações
            </button>
          </div>

          <!-- Conteúdo das Abas -->
          <div class="tab-content">
            <!-- ABA: Contas a Pagar -->
            <div v-if="activeTab === 'financials'" class="bills-section">
              <div v-if="financials.length === 0" class="empty-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                <p>Nenhuma conta cadastrada</p>
              </div>

              <div v-else class="bills-table">
                <table>
                  <thead>
                    <tr>
                      <th>Conta</th>
                      <th>Valor</th>
                      <th>Vencimento</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="bill in sortedFinancials" :key="bill.id" :class="getBillClass(bill)">
                      <td class="bill-name">{{ bill.accountName }}</td>
                      <td class="bill-price">R$ {{ formatPrice(bill.price) }}</td>
                      <td class="bill-date">{{ formatDate(bill.vencimentDay) }}</td>
                      <td>
                        <span class="status-badge" :class="bill.paymentStatus">
                          {{ formatStatus(bill.paymentStatus) }}
                        </span>
                      </td>
                      <td class="bill-actions">
                        <button @click="editFinancial(bill)" class="btn-icon" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                          </svg>
                        </button>
                        <button @click="deleteFinancial(bill)" class="btn-icon delete" title="Excluir">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ABA: Vendas -->
            <div v-if="activeTab === 'sales'" class="sales-section">
              <div v-if="sales.length === 0" class="empty-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Nenhuma venda registrada</p>
              </div>

              <div v-else class="bills-table">
                <table>
                  <thead>
                    <tr>
                      <th>#ID</th>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Preço Unit.</th>
                      <th>Total</th>
                      <th>Cliente</th>
                      <th>Pagamento</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sale in sortedSales" :key="sale.id">
                      <td class="sale-id">#{{ sale.id }}</td>
                      <td class="bill-name">{{ sale.nameStock }}</td>
                      <td>{{ sale.quantity }} un</td>
                      <td>R$ {{ formatPrice(sale.unitPrice) }}</td>
                      <td class="bill-price">R$ {{ formatPrice(sale.totalPrice) }}</td>
                      <td>{{ sale.clientName || '-' }}</td>
                      <td>{{ formatPaymentType(sale.paymentType) }}</td>
                      <td>
                        <span class="status-badge" :class="sale.paymentStatus">
                          {{ formatPaymentStatus(sale.paymentStatus) }}
                        </span>
                      </td>
                      <td class="bill-date">{{ formatDate(sale.createdAt) }}</td>
                      <td class="bill-actions">
                        <button @click="deleteSale(sale)" class="btn-icon delete" title="Excluir">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ABA: Movimentações de Estoque -->
            <div v-if="activeTab === 'movements'" class="movements-section">
              <div v-if="movements.length === 0" class="empty-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 16v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="12" height="12" rx="2"></rect>
                </svg>
                <p>Nenhuma movimentação registrada</p>
              </div>

              <div v-else class="bills-table">
                <table>
                  <thead>
                    <tr>
                      <th>#ID</th>
                      <th>Item</th>
                      <th>Tipo</th>
                      <th>Quantidade</th>
                      <th>Custo</th>
                      <th>Usado</th>
                      <th>Operacional</th>
                      <th>Comando</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="mov in sortedMovements" :key="mov.id">
                      <td class="sale-id">#{{ mov.id }}</td>
                      <td class="bill-name">{{ mov.nameStock }}</td>
                      <td>
                        <span class="type-badge" :class="mov.movementType">
                          {{ formatMovementType(mov.movementType) }}
                        </span>
                      </td>
                      <td>{{ mov.quantity || '-' }}</td>
                      <td>R$ {{ formatPrice(mov.cost) }}</td>
                      <td>{{ formatPrice(mov.used) }}</td>
                      <td>
                        <span class="operational-badge" :class="{ active: mov.operational }">
                          {{ mov.operational ? 'Sim' : 'Não' }}
                        </span>
                      </td>
                      <td>{{ mov.commandId ? `#${mov.commandId}` : '-' }}</td>
                      <td class="bill-date">{{ formatDate(mov.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <NewFinancialModal
      :isOpen="showNewFinancialModal"
      @close="showNewFinancialModal = false"
      @financial-created="handleFinancialCreated"
    />

    <EditFinancialModal
      :isOpen="showEditFinancialModal"
      :financial="selectedFinancial"
      @close="showEditFinancialModal = false"
      @financial-updated="handleFinancialUpdated"
    />

    <ModalSale
      :isOpen="showNewSaleModal"
      @close="showNewSaleModal = false"
      @sale-created="handleSaleCreated"
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
}

.date-filters {
  display: flex;
  gap: 15px;
  width: 90%;
}

.date-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-group label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
}

.date-input {
  padding: 12px;
  background-color: #121517;
  border: 2px solid #2a2d31;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  transition: border-color 0.3s;
}

.date-input:focus {
  outline: none;
  border-color: #cd8f35;
}

.div4 {
  grid-column-start: 6;
  grid-row-start: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-new-sale,
.btn-new-financial {
  border: none;
  border-radius: 10px;
  width: 80%;
  height: 40px;
  color: white;
  font-weight: bolder;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-new-sale {
  background: linear-gradient(187deg, rgba(76, 175, 80, 1) 0%, rgba(27, 94, 32, 1) 100%);
}

.btn-new-financial {
  background: linear-gradient(187deg, rgba(219, 32, 76, 1) 0%, rgba(87, 22, 37, 1) 100%);
}

.btn-new-sale:hover,
.btn-new-financial:hover {
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

/* LOADING */
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

/* CONTEÚDO FINANCEIRO */
.financial-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* CARDS DE RESUMO */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.summary-card {
  background: linear-gradient(135deg, #1a1d21 0%, #2a2d31 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.card-icon {
  font-size: 48px;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: rgba(205, 143, 53, 0.1);
}

.card-info {
  flex: 1;
}

.card-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.card-value {
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
}

.card-label {
  font-size: 12px;
  color: #666;
}

/* GRÁFICO */
.chart-section {
  background-color: #1a1d21;
  border-radius: 12px;
  padding: 25px;
  border: 2px solid #2a2d31;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: bold;
  color: #cd8f35;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* ABAS */
.tabs-section {
  background-color: #1a1d21;
  border-radius: 12px;
  border: 2px solid #2a2d31;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background-color: #121517;
  border-bottom: 2px solid #2a2d31;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  background: transparent;
  border: none;
  color: #888;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background-color: rgba(205, 143, 53, 0.05);
  color: #cd8f35;
}

.tab-button.active {
  color: #cd8f35;
  border-bottom-color: #cd8f35;
  background-color: rgba(205, 143, 53, 0.1);
}

.tab-content {
  padding: 25px;
}

/* TABELAS */
.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 15px;
  color: #666;
}

.empty-message svg {
  opacity: 0.5;
}

.bills-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  border-bottom: 2px solid #2a2d31;
}

th {
  text-align: left;
  padding: 12px;
  font-size: 12px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

tbody tr {
  border-bottom: 1px solid #2a2d31;
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: rgba(205, 143, 53, 0.05);
}

tbody tr.overdue {
  background-color: rgba(244, 67, 54, 0.05);
}

td {
  padding: 15px 12px;
  font-size: 14px;
}

.sale-id {
  color: #cd8f35;
  font-weight: bold;
}

.bill-name {
  font-weight: 600;
  color: #ffffff;
}

.bill-price {
  font-weight: bold;
  color: #cd8f35;
}

.bill-date {
  color: #888;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  display: inline-block;
}

.status-badge.paid {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.unpaid {
  background-color: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.status-badge.overdue {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  display: inline-block;
}

.type-badge.input {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.type-badge.output {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.operational-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.operational-badge.active {
  background-color: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.bill-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background-color: #2a2d31;
  border: 1px solid #cd8f35;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #cd8f35;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: #cd8f35;
  color: #000;
}

.btn-icon.delete {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-icon.delete:hover {
  background-color: #ff6b6b;
  color: #fff;
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

@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .date-filters {
    flex-direction: column;
  }

  .tabs-header {
    flex-direction: column;
  }
}
</style>

<script setup>
import { API_BASE_URL } from '@/config/api';
import Sidebar from '@/components/Sidebar.vue';
import NewFinancialModal from '@/components/NewFinancialModal.vue';
import EditFinancialModal from '@/components/EditFinancialModal.vue';
import ModalSale from '@/components/ModalSale.vue';
import Chart from 'chart.js/auto';
</script>

<script>
export default {
  data() {
    return {
      startDate: this.getFirstDayOfMonth(),
      endDate: this.getTodayDate(),
      operationalCosts: 0,
      totalRevenue: 0,
      studioCosts: 0,
      financials: [],
      sales: [],
      movements: [],
      loading: true,
      showNewSaleModal: false,
      showNewFinancialModal: false,
      showEditFinancialModal: false,
      selectedFinancial: null,
      chart: null,
      activeTab: 'financials'
    }
  },

  computed: {
    netProfit() {
      return this.totalRevenue - this.operationalCosts - this.studioCosts;
    },

    profitClass() {
      return this.netProfit < 0 ? 'negative' : '';
    },

    profitIcon() {
      return this.netProfit >= 0 ? '📈' : '📉';
    },

    sortedFinancials() {
      return [...this.financials].sort((a, b) => {
        return new Date(a.vencimentDay) - new Date(b.vencimentDay);
      });
    },

    sortedSales() {
      return [...this.sales].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },

    sortedMovements() {
      return [...this.movements].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
  },

  mounted() {
    this.fetchAllData();
  },

  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },

  methods: {
    getFirstDayOfMonth() {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    },

    getTodayDate() {
      return new Date().toISOString().split('T')[0];
    },

    async fetchAllData() {
      this.loading = true;
      await Promise.all([
        this.fetchAnalytics(),
        this.fetchFinancials(),
        this.fetchSales(),
        this.fetchMovements()
      ]);
      this.loading = false;
      this.$nextTick(() => {
        this.createChart();
      });
    },

    async fetchAnalytics() {
      try {
        const token = localStorage.getItem('jwt_token');
        const userId = localStorage.getItem('user_id') || '3';

        const [stockRes, commandsRes, financialsRes] = await Promise.all([
          fetch(`http://localhost:3000/analytics/stock-movement-value?operational=true&type=intern&startdate=${this.startDate}&enddate=${this.endDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:3000/analytics/commands-value?userid=${userId}&startdate=${this.startDate}&enddate=${this.endDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/analytics/financials-value`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const stockData = await stockRes.text();
        const commandsData = await commandsRes.json();
        const financialsData = await financialsRes.text();

        this.operationalCosts = parseFloat(stockData) || 0;
        this.studioCosts = parseFloat(financialsData) || 0;

        // Somar todas as receitas do objeto
        this.totalRevenue = Object.values(commandsData).reduce((sum, val) => sum + parseFloat(val), 0);

      } catch (err) {
        console.error('Erro ao buscar analytics:', err);
      }
    },

    async fetchFinancials() {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/financials`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          this.financials = await response.json();
        }
      } catch (err) {
        console.error('Erro ao buscar financials:', err);
      }
    },

    async fetchSales() {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/sales`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          this.sales = await response.json();
        }
      } catch (err) {
        console.error('Erro ao buscar vendas:', err);
      }
    },

    async fetchMovements() {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/stock-movement`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          this.movements = await response.json();
        }
      } catch (err) {
        console.error('Erro ao buscar movimentações:', err);
      }
    },

    createChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.$refs.financeChart?.getContext('2d');
      if (!ctx) return;

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Receitas', 'Custos Operacionais', 'Contas do Estúdio', 'Lucro Líquido'],
          datasets: [{
            label: 'Valores (R$)',
            data: [this.totalRevenue, this.operationalCosts, this.studioCosts, this.netProfit],
            backgroundColor: [
              'rgba(76, 175, 80, 0.6)',
              'rgba(255, 152, 0, 0.6)',
              'rgba(33, 150, 243, 0.6)',
              this.netProfit >= 0 ? 'rgba(205, 143, 53, 0.6)' : 'rgba(244, 67, 54, 0.6)'
            ],
            borderColor: [
              'rgba(76, 175, 80, 1)',
              'rgba(255, 152, 0, 1)',
              'rgba(33, 150, 243, 1)',
              this.netProfit >= 0 ? 'rgba(205, 143, 53, 1)' : 'rgba(244, 67, 54, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#888',
                callback: (value) => 'R$ ' + value.toFixed(2)
              },
              grid: {
                color: '#2a2d31'
              }
            },
            x: {
              ticks: {
                color: '#888'
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    },

    handleFinancialCreated() {
      this.fetchAllData();
    },

    handleFinancialUpdated() {
      this.fetchAllData();
    },

    handleSaleCreated() {
      this.fetchAllData();
      this.activeTab = 'sales';
    },

    editFinancial(financial) {
      this.selectedFinancial = financial;
      this.showEditFinancialModal = true;
    },

    async deleteFinancial(financial) {
      if (!confirm(`Tem certeza que deseja excluir "${financial.accountName}"?`)) {
        return;
      }

      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`http://localhost:3000/financials/${financial.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          this.fetchAllData();
        }
      } catch (err) {
        alert('Erro ao excluir conta: ' + err.message);
      }
    },

    async deleteSale(sale) {
      if (!confirm(`Tem certeza que deseja excluir a venda de "${sale.nameStock}"?\n\nIsso irá reverter o estoque automaticamente.`)) {
        return;
      }

      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`http://localhost:3000/sales/${sale.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          this.fetchAllData();
        } else {
          const errorData = await response.json();
          alert('Erro ao excluir venda: ' + (errorData.message || 'Erro desconhecido'));
        }
      } catch (err) {
        alert('Erro ao excluir venda: ' + err.message);
      }
    },

    getBillClass(bill) {
      if (bill.paymentStatus === 'unpaid') {
        const today = new Date();
        const dueDate = new Date(bill.vencimentDay);
        if (dueDate < today) {
          return 'overdue';
        }
      }
      return '';
    },

    formatPrice(value) {
      return parseFloat(value).toFixed(2).replace('.', ',');
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },

    formatStatus(status) {
      const statuses = {
        'paid': 'Pago',
        'unpaid': 'Pendente',
        'overdue': 'Atrasado'
      };
      return statuses[status] || status;
    },

    formatPaymentStatus(status) {
      const statuses = {
        'paid': 'Pago',
        'unpaid': 'Pendente'
      };
      return statuses[status] || status;
    },

    formatPaymentType(type) {
      const types = {
        'money': 'Dinheiro',
        'pix': 'PIX',
        'debit': 'Débito',
        'credit': 'Crédito',
        'credit2x': 'Crédito 2x',
        'credit3x': 'Crédito 3x',
        'credit4x': 'Crédito 4x',
        'credit5x': 'Crédito 5x',
        'credit6x': 'Crédito 6x'
      };
      return types[type] || type;
    },

    formatMovementType(type) {
      const types = {
        'input': 'Entrada',
        'output': 'Saída'
      };
      return types[type] || type;
    }
  }
}
</script>