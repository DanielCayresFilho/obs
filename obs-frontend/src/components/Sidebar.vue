<script setup>
import { API_BASE_URL } from '@/config/api';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = [
  { label: 'HOME', icon: 'stash:home-light', path: '/home' },
  { label: 'CLIENTES', icon: 'fluent:people-add-32-light', path: '/clients' },
  { label: 'ORÇAMENTOS', icon: 'ph:calculator-thin', path: '/budgets' },
  { label: 'AGENDA', icon: 'ph:book-thin', path: '/appointments' },
  { label: 'GALERIA', icon: 'arcticons:lineage-gallery', path: '/gallery' },
  { label: 'PROCEDIMENTOS', icon: 'ph:gear-six-thin', path: '/procedures' },
  { label: 'ESTOQUE', icon: 'ph:bag-thin', path: '/stock' },
  { label: 'FINANCEIRO', icon: 'arcticons:moneywallet', path: '/financials' },
];

const handleLogout = async () => {
  if (confirm('Tem certeza que deseja sair?')) {
    try {
      const token = localStorage.getItem('jwt_token');
      
      if (token) {
        // Opcional: chamar endpoint de logout no backend
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => console.error('Erro ao fazer logout no backend:', err));
      }
    } finally {
      // Sempre limpa os dados locais e redireciona
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_id');
      router.push('/');
    }
  }
};
</script>

<template>
  <div class="sidebar">
    <div class="menu">
      <router-link
        v-for="item in menuItems"
        :key="item.label"
        :to="item.path"
        class="menu-link"
        active-class="active"
      >
        <div class="menu-item">
          <div class="icon-wrapper">
            <Icon :icon="item.icon" class="icon" />
          </div>
          <span class="label">{{ item.label }}</span>
        </div>
      </router-link>

      <!-- Botão de Logout -->
      <div class="menu-link logout-link" @click="handleLogout">
        <div class="menu-item">
          <div class="icon-wrapper">
            <Icon icon="ph:sign-out-thin" class="icon" />
          </div>
          <span class="label">SAIR</span>
        </div>
      </div>
    </div>

    <div class="logo-container">
      <img src="../assets/images/avatar-Photoroom.png" alt="Logo" class="logo" />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 100%;
  height: 100vh;
  background-color: #0f0f0f;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
  box-sizing: border-box;
  position: sticky;
  top: 0;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  width: 100%;
  overflow-y: auto;
  padding: 0 0.5rem;
}

.menu-link {
  text-decoration: none;
  color: #fff;
  width: 100%;
  display: block;
}

.menu-link.active .menu-item {
  color: #9b2c25;
}

.menu-link:hover .menu-item {
  color: #9b2c25;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
  padding: 8px;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.menu-link:hover .menu-item {
  background-color: rgba(155, 44, 37, 0.1);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.icon {
  width: 32px;
  height: 32px;
  transition: color 0.3s ease;
  color: #424242;
}

.menu-link.active .icon,
.menu-link:hover .icon {
  color: #9b2c25;
}

.label {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: #424242;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

.menu-link.active .label,
.menu-link:hover .label {
  color: #9b2c25;
}

/* Estilo específico para o botão de logout */
.logout-link {
  margin-top: 10px;
  border-top: 1px solid #1a1a1a;
  padding-top: 15px;
}

.logout-link:hover .icon,
.logout-link:hover .label {
  color: #ff6b6b;
}

.logo-container {
  width: 100%;
  text-align: center;
  padding: 1rem 0;
  margin-top: auto;
}

.logo {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 50%;
}

/* Scrollbar para menu */
.menu::-webkit-scrollbar {
  width: 4px;
}

.menu::-webkit-scrollbar-track {
  background: #0f0f0f;
}

.menu::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 2px;
}

/* RESPONSIVIDADE PARA TABLET (iPad) */
@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar {
    padding: 1.5rem 0;
  }

  .icon-wrapper {
    width: 55px;
    height: 55px;
  }

  .icon {
    width: 28px;
    height: 28px;
  }

  .label {
    font-size: 10px;
  }

  .logo {
    width: 80px;
    height: 80px;
  }
}

/* RESPONSIVIDADE PARA MOBILE */
@media (max-width: 768px) {
  .sidebar {
    flex-direction: row;
    padding: 0.5rem;
    width: 100%;
    height: auto;
    min-height: 75px;
    overflow: visible;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  }

  .menu {
    flex-direction: row;
    gap: 0;
    flex: 1;
    overflow: visible;
    padding: 0;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .menu-link {
    width: auto;
    flex: 1 1 calc(25% - 4px);
    min-width: 70px;
    max-width: 90px;
  }

  .menu-item {
    gap: 3px;
    padding: 4px 2px;
  }

  .icon-wrapper {
    width: 38px;
    height: 38px;
  }

  .icon {
    width: 22px;
    height: 22px;
  }

  .label {
    font-size: 8px;
    letter-spacing: 0.03em;
  }

  .logout-link {
    border-top: none;
    border-left: none;
    padding-top: 0;
    padding-left: 0;
    margin-left: 0;
    margin-top: 0;
    flex: 1 1 calc(25% - 4px);
  }

  .logo-container {
    display: none;
  }
}

/* RESPONSIVIDADE PARA MOBILE PEQUENO */
@media (max-width: 480px) {
  .sidebar {
    padding: 0.5rem 0.25rem;
    min-height: 65px;
  }

  .menu {
    gap: 6px;
  }

  .menu-link {
    min-width: 65px;
  }

  .menu-item {
    gap: 3px;
    padding: 3px;
  }

  .icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }

  .label {
    font-size: 8px;
  }
}
</style>