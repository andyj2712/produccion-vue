<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    color="blue-darken-4"
    theme="dark"
  >
    <div class="pa-4 d-flex flex-column align-center">
      <v-img
        src="../assets/logorf.png"
        alt="Logo recicladora Fernandez"
        width="120"
        class="mb-2"
      />
      <h1 class="text-h6 text-center font-weight-bold" style="line-height: 1.2;">
        RECICLADORA<br>FERNANDEZ
      </h1>
    </div>

    <v-divider />

    <v-list density="compact" nav>

      <v-list-item prepend-icon="mdi-home" title="Inicio" to="/inicio" />
      <v-list-item prepend-icon="mdi-cash-register" title="Registro de ventas" to="/ventas" />

      <template v-if="['administrador', 'contador'].includes(user.role)">
        
        <v-list-item 
          prepend-icon="mdi-cash-multiple" 
          title="Comisiones" 
          to="/comisiones" 
        />
        
        <v-list-item 
          prepend-icon="mdi-truck-delivery" 
          title="Salida / Entregas" 
          to="/entregas" 
        />

        <v-list-item 
          prepend-icon="mdi-chart-bar" 
          title="Reporte de Ventas" 
          to="/reporte-ventas" 
        />
      </template>

      <template v-if="user.role === 'administrador'">
        
        <v-divider class="my-2 border-opacity-50"></v-divider>
        <div class="text-caption px-4 text-grey-lighten-1 mb-1">GESTIÓN</div>

        <v-list-item
          prepend-icon="mdi-package-variant"
          title="Productos"
          to="/productos"
        />
        
        <v-list-item
          prepend-icon="mdi-weight-kilogram"
          title="Material pesado"
          to="/material-pesado"
        />
          
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Empleados"
          to="/empleados"
        />

        <v-list-item 
        prepend-icon="mdi-calendar-clock" 
        title="Citas / Agenda" 
        to="/citas" 
        />
      </template>

    </v-list>

    <template v-slot:append>
      <v-divider />
      
      <div class="pa-2">
        <v-list-item
          prepend-icon="mdi-account-circle"
          :title="user.usuario"
          :subtitle="user.role"
          class="text-white"
        />
      </div>
      <v-divider />

      <div class="pa-2">
        <v-list-item
          prepend-icon="mdi-logout"
          title="Cerrar Sesión"
          @click="handleLogout"
          class="text-red-lighten-2"
        />
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar app color="white" elevation="1" class="d-lg-none">
    <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
    <v-app-bar-title>Recicladora Fernandez</v-app-bar-title>
  </v-app-bar>

  <v-main style="background-color: #f4f7f6;">
    <v-container fluid class="pa-4 pa-md-6">
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'; 
import { useRouter } from 'vue-router';
// Importamos la conexión correcta a Railway
import api from '@/axios'; 

const router = useRouter();
const drawer = ref(true);

const user = ref({
  usuario: 'Cargando...',
  role: '' // Importante: Esto define qué se muestra en el menú
});

const fetchUser = async () => {
  try {
    // Obtenemos los datos del usuario logueado desde la API
    const response = await api.get('/user');
    user.value = response.data; 

    // OJO: Actualizamos el localStorage por si acaso el rol cambió en la BD
    if (response.data.role) {
      localStorage.setItem('user_role', response.data.role);
    }

  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    if (error.response && [401, 403].includes(error.response.status)) {
      handleLogout(true);
    }
  }
};

onMounted(() => {
  fetchUser();
});

const handleLogout = async (isError = false) => {
  try {
    if (!isError) { 
      await api.post('/logout');
    }
  } catch (error) {
    console.error('Error logout:', error);
  } finally {
    // Borramos todo para que el Guardián del Router haga su trabajo
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
  }
};
</script>

<style scoped>
:global(body) {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f7f6;
}
</style>