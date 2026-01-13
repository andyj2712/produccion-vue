<template>
  <v-row>
    <v-col cols="12">
      <v-card class="pa-2 mb-4" flat>
        <v-card-title class="text-h5 font-weight-bold text-blue-darken-4">
          Cálculo de Comisiones
        </v-card-title>
        <v-card-subtitle>
          Consulte las comisiones generadas por los empleados dentro de un rango de fechas.
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card class="mb-4 pa-4" flat>
        <v-row dense>
          <v-col cols="12" md="5">
            <v-menu v-model="menuStart" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-text-field
                  :model-value="formatDateForField(startDate)"
                  label="Fecha Inicial"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  readonly
                  v-bind="props"
                  density="compact"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="startDate"
                @update:modelValue="menuStart = false"
                color="primary"
                hide-header
              ></v-date-picker>
            </v-menu>
          </v-col>
          
          <v-col cols="12" md="5">
            <v-menu v-model="menuEnd" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-text-field
                  :model-value="formatDateForField(endDate)"
                  label="Fecha Final"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  readonly
                  v-bind="props"
                  density="compact"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="endDate"
                @update:modelValue="menuEnd = false"
                color="primary"
                hide-header
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              color="teal-darken-1"
              @click="fetchComisiones"
              :loading="isLoading"
              prepend-icon="mdi-magnify"
              size="x-large"
              block
            >
              Consultar
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card>
        <v-toolbar flat color="grey-lighten-3">
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-grey-darken-3">
            Resultados del {{ displayStartDate }} al {{ displayEndDate }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip color="green-darken-2" label size="large">
            <v-icon start icon="mdi-dollar-circle"></v-icon>
            TOTAL: <strong class="ms-2">{{ formatCurrency(totalGeneral) }}</strong>
          </v-chip>
        </v-toolbar>

        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="comisiones"
            :loading="isLoading"
            items-per-page-text="Registros por página"
            no-data-text="No se encontraron comisiones para este rango."
            loading-text="Cargando comisiones..."
          >
            <template v-slot:item.nombre="{ value }">
              <v-icon icon="mdi-account-tag" start size="small" />
              <span class="font-weight-medium">{{ value }}</span>
            </template>
            
            <template v-slot:item.monto_comision="{ value }">
              <span :class="value > 0 ? 'text-green-darken-2' : 'text-grey-darken-1'" class="font-weight-bold">
                {{ formatCurrency(value) }}
              </span>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                :to="getDetalleRoute(item.id)"
                color="blue-darken-1"
                variant="tonal"
                size="small"
                prepend-icon="mdi-eye"
              >
                Detalle
              </v-btn>
            </template>
            
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO REACTIVO ---
const comisiones = ref([]);
const totalGeneral = ref(0);
const isLoading = ref(false);

const startDate = ref(null);
const endDate = ref(null);
const menuStart = ref(false);
const menuEnd = ref(false);

const displayStartDate = ref('');
const displayEndDate = ref('');

const headers = [
  { title: 'Empleado', key: 'nombre', width: '60%' },
  { title: 'Comisión Generada', key: 'monto_comision', align: 'end' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
];

// --- CICLO DE VIDA ---
onMounted(() => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  startDate.value = startOfMonth;
  endDate.value = today;
  
  fetchComisiones();
});

// --- API ---
const fetchComisiones = async () => {
  isLoading.value = true;
  
  const params = {
    start_date: formatDateForAPI(startDate.value),
    end_date: formatDateForAPI(endDate.value),
  };

  try {
    // CAMBIO: api.get ruta relativa
    const response = await api.get('/comisiones', {
      params: params 
    });
    
    comisiones.value = response.data.comisiones;
    totalGeneral.value = response.data.totalGeneral;
    
    displayStartDate.value = formatDateForField(startDate.value);
    displayEndDate.value = formatDateForField(endDate.value);

  } catch (error) {
    console.error('Error al cargar comisiones:', error);
    comisiones.value = [];
    totalGeneral.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// --- HELPERS ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  // CAMBIO: Formato SV/USD
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDateForField = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateForAPI = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDetalleRoute = (id_empleado) => {
  return {
    name: 'ComisionesDetalle', 
    params: { id: id_empleado },
    query: {
      start_date: formatDateForAPI(startDate.value),
      end_date: formatDateForAPI(endDate.value)
    }
  };
};
</script>

<style scoped>
/* Vuetify maneja la mayoría de los estilos */
</style>