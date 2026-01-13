<template>
  <v-container fluid class="h-100 bg-blue-grey-lighten-5 d-flex align-center justify-center pa-4">
    <v-row align="center" justify="center" class="w-100">
      
      <v-col cols="12" md="auto" class="text-center mb-6 mb-md-0 mx-md-6">
        <v-img
          src="../assets/logorf.png"
          alt="Logo recicladora Fernandez"
          width="150"
          class="mx-auto mb-4"
        />
        <h2 class="text-h4 font-weight-bold text-blue-darken-4">
          RECICLADORA <br> FERNANDEZ
        </h2>
      </v-col>

      <v-col cols="12" sm="8" md="5" lg="3">
        
        <v-card
          class="pa-6 pa-md-8"
          elevation="10"
          theme="light" 
        >
          <v-form @submit.prevent="handleLogin">
            <v-card-title class="text-h5 text-center mb-6 text-blue-darken-4 font-weight-bold">
              Iniciar Sesión
            </v-card-title>
            
            <v-card-text>
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                closable
                class="mb-4"
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-text-field
                v-model="form.usuario"
                label="Usuario"
                prepend-inner-icon="mdi-account"
                variant="outlined" 
                class="mb-2"
                required
              />

              <v-text-field
                v-model="form.password"
                label="Contraseña"
                
                :type="showPassword ? 'text' : 'password'"
                
                prepend-inner-icon="mdi-lock"
                variant="outlined" 
                required
                
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                
                @click:append-inner="showPassword = !showPassword"
              />
            </v-card-text>

            <v-card-actions>
              <v-btn
                type="submit"
                color="teal-darken-1"
                size="large"
                block
                elevation="2"
              >
                Entrar
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

// CORRECCIÓN: Usamos '@' que apunta directo a 'src/axios.js'
import api from '@/axios';
import { useRouter } from 'vue-router'; 

const router = useRouter();

const showPassword = ref(false); 

const form = ref({
  usuario: '',
  password: ''
});
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = ''; 

  try {
    // 2. CAMBIO: Usamos 'api.post' y quitamos toda la URL larga.
    // Solo dejamos '/login' porque la base ya está configurada.
    const response = await api.post('/login', {
      usuario: form.value.usuario,
      password: form.value.password
    });

    console.log('¡Login exitoso!', response.data);

    // Guardamos el Token
    localStorage.setItem('auth_token', response.data.access_token);
    
    // Guardamos el Rol
    if (response.data.user && response.data.user.role) {
        localStorage.setItem('user_role', response.data.user.role);
        localStorage.setItem('user_name', response.data.user.usuario); 
    }

    router.push('/inicio');

  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Ocurrió un error. Inténtalo de nuevo.';
    }
    console.error('Error en el login:', error);
  }
};
</script>

<style scoped>
/* Eliminamos custom-text-shadow ya que el fondo ahora es claro */
/* La sombra que ves en la imagen se maneja con elevación de Vuetify */
</style>