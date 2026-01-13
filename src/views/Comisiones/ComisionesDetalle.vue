<template>
  <v-row>
    <v-col cols="12">
      <v-card class="pa-2 mb-4" flat>
        <v-card-title class="text-h5 font-weight-bold text-blue-darken-4">
          Detalle de Comisiones
        </v-card-title>
        <v-card-subtitle v-if="ventas.length > 0">
          Mostrando ventas para <strong>{{ empleadoNombre }}</strong>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card class="mb-4 pa-4" flat>
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="auto">
            <v-btn
              :to="backRoute"
              color="grey-darken-1"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              size="large"
            >
              Volver al Resumen
            </v-btn>
          </v-col>
          <v-col cols="12" md="auto" class="text-md-right mt-4 mt-md-0">
            <v-chip color="green-darken-2" label size="x-large">
              <v-icon start icon="mdi-dollar-circle"></v-icon>
              COMISIÓN TOTAL:
              <strong class="ms-2">{{ formatCurrency(totalComision) }}</strong>
            </v-chip>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card>
        <v-card-title class="pa-4">Ventas Individuales</v-card-title>
        <v-data-table
          :headers="headers"
          :items="ventas"
          :loading="isLoading"
          items-per-page-text="Ventas por página"
          no-data-text="No se encontraron ventas para este empleado en el rango."
          loading-text="Cargando detalle de ventas..."
          class="elevation-1"
        >
          <template v-slot:item.id_venta="{ value }">
            <v-chip color="teal-darken-1" size="small">
              #{{ value }}
            </v-chip>
          </template>

          <template v-slot:item.created_at="{ value }">
            <div>{{ formatDateTime(value).fecha }}</div>
            <div class="text-grey-darken-1">{{ formatDateTime(value).hora }}</div>
          </template>
          
          <template v-slot:item.productos="{ value }">
            <v-list density="compact" bg-color="transparent">
              <v-list-item
                v-for="prod in value"
                :key="prod.id_producto"
                class="pa-0"
              >
                <span class="font-weight-medium">{{ prod.cantidad }}</span>
                <span class="text-grey-darken-1 mx-1">x</span>
                <span>{{ prod.nombre_producto }}</span>
              </v-list-item>
            </v-list>
          </template>
          
          <template v-slot:item.monto_total="{ value }">
            <span class="font-weight-medium">
              {{ formatCurrency(value) }}
            </span>
          </template>
          
          <template v-slot:item.comision_total="{ value }">
            <span class="text-green-darken-2 font-weight-bold">
              {{ formatCurrency(value) }}
            </span>
          </template>
          
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO REACTIVO ---
const route = useRoute();
const ventas = ref([]); 
const isLoading = ref(false);

const headers = [
  { title: 'ID Venta', key: 'id_venta', width: '10%' },
  { title: 'Cliente', key: 'nombre_cliente', width: '15%' },
  { title: 'Fecha y Hora', key: 'created_at', width: '15%' },
  { title: 'Productos Vendidos', key: 'productos', sortable: false, width: '30%' },
  { title: 'Monto Venta', key: 'monto_total', align: 'end', width: '15%' },
  { title: 'Comisión', key: 'comision_total', align: 'end', width: '15%' },
];

// --- CICLO DE VIDA ---
onMounted(() => {
  fetchDetalle();
});

// --- API ---
const fetchDetalle = async () => {
  isLoading.value = true;
  
  const id_empleado = route.params.id;
  const params = {
    start_date: route.query.start_date,
    end_date: route.query.end_date,
  };

  try {
    // CAMBIO: api.get ruta relativa
    const response = await api.get(`/comisiones/detalle/${id_empleado}`, {
      params: params 
    });
    
    ventas.value = response.data.data; 

  } catch (error) {
    console.error('Error al cargar el detalle de comisiones:', error);
    ventas.value = [];
  } finally {
    isLoading.value = false;
  }
};

// --- COMPUTED ---
const totalComision = computed(() => {
  return ventas.value.reduce((total, venta) => {
    const comision = parseFloat(venta.comision_total) || 0; 
    return total + comision;
  }, 0); 
});

const empleadoNombre = computed(() => {
  if (ventas.value.length === 0 || !ventas.value[0].empleado) {
    return 'Cargando...';
  }
  return ventas.value[0].empleado.nombre_empleado;
});

const backRoute = computed(() => {
  return {
    name: 'Comisiones', 
    query: {
      start_date: route.query.start_date,
      end_date: route.query.end_date
    }
  };
});

// --- HELPERS ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  // CAMBIO: Formato SV/USD
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDateTime = (dateString) => {
  if (!dateString) return { fecha: 'N/A', hora: 'N/A' };
  const date = new Date(dateString);
  return {
    fecha: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
};
</script>

<style scoped>
/* Vuetify maneja la mayoría de los estilos */
.v-list-item {
  min-height: 24px;
}
</style>