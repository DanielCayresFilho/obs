<template>
  <div class="login-container">
    <div class="login-sidebar">
      <img src="../assets/images/avatar.jpg" alt="Avatar" class="avatar" />
    </div>

    <div class="login-content">
      <img src="../assets/images/logo-só-texto-amarelo.png" alt="Logo" class="logo" />

      <div class="form">
        <input 
          type="text" 
          placeholder="LOGIN" 
          v-model="username" 
          class="login-input"
          id="username"
          name="username"
          autocomplete="username"
        />
        <input 
          type="password" 
          placeholder="SENHA" 
          v-model="password" 
          class="login-input"
          id="password"
          name="password"
          autocomplete="current-password"
        />

        <button @click="handleLogin" :disabled="isLoading" type="button">
          {{ isLoading ? 'ENTRANDO...' : 'ENTRAR' }}
        </button>

        <p v-if="message.text" :class="['alert', message.type]">
          {{ message.text }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref(''); 
const password = ref('');
const message = ref({ text: '', type: '' });
const isLoading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    message.value = { text: 'Preencha o login e senha', type: 'error' };
    return;
  }

  isLoading.value = true;
  message.value = { text: '', type: '' };

  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      username: username.value,
      password: password.value,
    });

    const token = response.data.access_token;

    if (token) {
      localStorage.setItem('jwt_token', token);
      
      message.value = { text: 'Login bem-sucedido! Redirecionando...', type: 'success' };
      setTimeout(() => router.push('/home'), 1500);
    } else {
      throw new Error('Token não recebido do servidor.');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);

    if (error.response && (error.response.status === 401 || error.response.status === 400)) {
      message.value = { text: 'Login ou senha inválidos', type: 'error' };
    } else if (error.request) {
      message.value = { text: 'Não foi possível conectar ao servidor.', type: 'error' };
    } else {
      message.value = { text: 'Ocorreu um erro inesperado.', type: 'error' };
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #000000;
  font-family: serif;
}

.login-sidebar {
  width: 20%;
  max-width: 150px;
  min-width: 90px;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
}

.login-content {
  width: 100%;
  height: 100vh;
  background-color: #121517;
  border-top-left-radius: 60px;
  border-bottom-left-radius: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 420px;
  height: 130px;
  object-fit: contain;
  margin-bottom: 3rem;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 400px;
}

/* Seletor mais específico com classe */
.login-input {
  width: 100%;
  background: none !important;
  background-color: transparent !important;
  border: none !important;
  border-bottom: 2px solid #cd9034 !important;
  color: white !important;
  font-size: 24px !important;
  padding: 1rem 0 0.5rem 0.5rem !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}

.login-input::placeholder {
  color: #888 !important;
  opacity: 1 !important;
}

.login-input:focus {
  outline: none !important;
  border-bottom: 2px solid #cd9034 !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  background: none !important;
  background-color: transparent !important;
}

/* Remove o fundo branco do autofill do Chrome/Safari */
.login-input:-webkit-autofill,
.login-input:-webkit-autofill:hover,
.login-input:-webkit-autofill:focus,
.login-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #121517 inset !important;
  -webkit-text-fill-color: white !important;
  caret-color: white !important;
}

button {
  width: 100%;
  height: 60px;
  border-radius: 15px;
  background: linear-gradient(1deg, #411620, #be2a4a);
  border: none;
  color: white;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: linear-gradient(1deg, #5a1e2b, #d7385a);
}

button:disabled {
  background: #555;
  cursor: not-allowed;
}

.alert {
  font-size: 18px;
  margin-top: 1rem;
  height: 27px;
  transition: color 0.3s ease;
}

.alert.error {
  color: rgba(255, 60, 60, 0.8);
}

.alert.success {
  color: rgba(60, 255, 130, 0.8);
}
</style>