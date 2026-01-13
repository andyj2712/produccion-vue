<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
        Gestión de Empleados
      </h1>
    </v-col>

    <v-col cols="12">
      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        closable
        icon="mdi-check-circle"
        class="mb-4"
        @click:close="successMessage = ''"
      >
        {{ successMessage }}
      </v-alert>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ stats.totalEmpleados }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Total Empleados
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ formatCurrency(stats.nominaBase) }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Nómina Base Mensual
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ stats.cargosOcupados }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Cargos Ocupados
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ stats.nuevosEn3Meses }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Nuevos en 3 meses
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
  <v-card class="pa-4" flat>
    <v-row align="center" justify="space-between">
      
      <v-col cols="12" md="auto">
        <v-btn
          to="/empleados/create"
          color="teal-darken-1"
          prepend-icon="mdi-account-plus"
          size="large"
          block
        >
          Añadir Nuevo Empleado
        </v-btn>

        <br>

        <v-btn
          to="/asistencia"
          color="indigo-darken-3"
          prepend-icon="mdi-calendar-check"
          size="large"
          block   
        >
          Control Asistencia
        </v-btn>
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchTerm"
          label="Buscar empleados..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-col>

    </v-row>
  </v-card>
</v-col>


    <v-col cols="12">
      <v-data-table
        :headers="[
          { title: 'ID', key: 'id_empleado', align: 'start' },
          { title: 'Nombre', key: 'nombre_empleado' },
          { title: 'Cargo', key: 'cargo_empleado' },
          { title: 'Salario', key: 'salario_base' },
          { title: 'Edad', key: 'edad_empleado' },
          { title: 'Teléfono', key: 'telefono_empleado' },
          { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
        ]"
        :items="filteredEmpleados"
        class="elevation-2"
        items-per-page-text="Filas por página"
        no-data-text="No se encontraron empleados que coincidan con la búsqueda."
      >
        <template v-slot:item.id_empleado="{ value }">
          <v-chip size="small">#{{ value }}</v-chip>
        </template>
        
        <template v-slot:item.nombre_empleado="{ value }">
          <span class="font-weight-bold text-blue-darken-4">{{ value }}</span>
        </template>

        <template v-slot:item.salario_base="{ value }">
          <span class="text-green-darken-2">{{ formatCurrency(value) }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              :to="'/empleados/edit/' + item.id_empleado"
              icon="mdi-pencil"
              color="warning"
              variant="tonal"
              size="small"
              title="Editar"
            />
            <v-btn
              @click="confirmDelete(item)"
              icon="mdi-trash-can"
              color="error"
              variant="tonal"
              size="small"
              title="Eliminar"
            />
          </div>
        </template>
      </v-data-table>
    </v-col>

  </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO REACTIVO ---
const empleados = ref([]); 
const stats = ref({ 
  totalEmpleados: 0,
  nominaBase: 0,
  cargosOcupados: 0,
  nuevosEn3Meses: 0
});
const searchTerm = ref(''); 
const successMessage = ref(''); 
const route = useRoute();
const router = useRouter();

// --- CICLO DE VIDA ---
onMounted(() => {
  fetchEmpleados();

  if (route.query.success) {
    successMessage.value = '¡Empleado guardado exitosamente!';
    router.replace({ query: {} }); 
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  }
});

// --- API ---
const fetchEmpleados = async () => {
  try {
    // CAMBIO: api.get ruta relativa
    const response = await api.get('/empleados');
    
    empleados.value = response.data.data;
    stats.value = response.data.stats;

  } catch (error) {
    console.error('Error al cargar empleados:', error);
  }
};

// --- COMPUTED ---
const filteredEmpleados = computed(() => {
  if (!searchTerm.value) {
    return empleados.value; 
  }
  const lowerSearch = searchTerm.value.toLowerCase();
  return empleados.value.filter(empleado =>
    empleado.nombre_empleado.toLowerCase().includes(lowerSearch)
  );
});

// --- MÉTODOS ---
const confirmDelete = async (empleado) => {
  if (confirm(`¿Estás seguro de que quieres eliminar a "${empleado.nombre_empleado}"?`)) {
    try {
      // CAMBIO: api.delete ruta relativa
      await api.delete(`/empleados/${empleado.id_empleado}`);
      
      successMessage.value = 'Empleado eliminado exitosamente.';
      fetchEmpleados(); 
      
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      alert('No se pudo eliminar al empleado.');
    }
  }
};

// --- HELPERS ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  // CAMBIO: Formato SV/USD
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
};
</script>

<style scoped>
/* ¡Toda la sección de <style> se ha ido! */
/* Vuetify se encarga de todo el CSS, incluyendo el responsive */
</style>