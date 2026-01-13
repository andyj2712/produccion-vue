<template>
  <v-row>
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

    <v-col cols="12">
      <v-card class="pa-2 mb-4" flat>
        <v-card-title class="text-h5 font-weight-bold text-blue-darken-4">
          Gestión de Ventas
        </v-card-title>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ stats.totalVentas }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Ventas Registradas
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ formatCurrency(stats.ingresosTotales) }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Ingresos Totales
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ formatCurrency(stats.totalDescuentos) }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Total en Descuentos
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ stats.ventasMes }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Ventas este mes
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-row align="center" justify="space-between" class="mt-4 px-3">
          <v-col cols="12" md="auto" class="d-flex flex-wrap ga-2">
            
            <v-btn
              v-if="esAdmin"
              color="teal-darken-1"
              prepend-icon="mdi-plus"
              to="/ventas/create"
              size="large"
            >
              Registrar Nueva Venta
            </v-btn>

            <v-btn
              v-if="esAdmin"
              color="blue-grey-darken-3"
              prepend-icon="mdi-cash-register"
              to="/cuadre-diario"
              size="large"
              variant="elevated"
            >
              Cierre Diario de Caja
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="6" class="d-flex ga-2">
          <v-text-field
              v-model="searchDate"
              type="date"
              label="Filtrar por Fecha"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-calendar"
              hide-details
              clearable
              @click:clear="searchDate = ''"
              @update:model-value="fetchVentas" 
          ></v-text-field>

          <v-text-field
              v-model="searchTerm"
              label="Buscar cliente..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="fetchVentas"
          ></v-text-field>
    </v-col>
          
        </v-row>

    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="ventas"
            :search="searchTerm"
            :loading="isLoading"
            class="elevation-1"
            items-per-page-text="Ventas por página"
            no-data-text="No se encontraron ventas"
            loading-text="Cargando ventas..."
          >
            <template v-slot:item.id_venta="{ value }">
              <v-chip color="teal-darken-1" size="small">
                #{{ value }}
              </v-chip>
            </template>
            
            <template v-slot:item.nombre_cliente="{ value }">
              <v-icon icon="mdi-account" start size="small" />{{ value }}
            </template>
            
            <template v-slot:item.empleado.nombre_empleado="{ value }">
              <v-icon icon="mdi-account-tie" start size="small" />{{ value || 'N/A' }}
            </template>

            <template v-slot:item.fecha="{ item }">
              <v-icon icon="mdi-calendar" start size="small" />{{ formatFecha(item.created_at) }}
            </template>

            <template v-slot:item.hora="{ item }">
              <v-icon icon="mdi-clock-outline" start size="small" />{{ formatHora(item.created_at) }}
            </template>
            
            <template v-slot:item.monto_total="{ value }">
              <span class="text-green-darken-2 font-weight-bold">
                {{ formatCurrency(value) }}
              </span>
            </template>
            
            <template v-slot:item.descuento="{ value }">
              <span class="text-red-darken-2">
                -{{ formatCurrency(value) }}
              </span>
            </template>
            
            <template v-slot:item.monto_final="{ item }">
              <span class="text-blue-darken-4 font-weight-bold">
                {{ formatCurrency(item.monto_total - item.descuento) }}
              </span>
            </template>

            <template v-slot:item.acciones="{ item }">
              <v-btn
                icon="mdi-file-pdf-box"
                variant="text"
                color="red-darken-1"
                density="compact"
                @click="descargarFactura(item)"
                :loading="downloadingId === item.id_venta"
                title="Descargar Factura PDF"
              ></v-btn>
              </template>
            
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>

  </v-row>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router'; 
// Usamos 'api'
import api from '@/axios';

// --- ESTADO REACTIVO ---
const ventas = ref([]);
const stats = ref({
  totalVentas: 0,
  ingresosTotales: 0,
  totalDescuentos: 0,
  ventasMes: 0
});
const searchTerm = ref('');
const searchDate = ref(''); 
const successMessage = ref('');
const isLoading = ref(false);
const downloadingId = ref(null);
const route = useRoute();

// 🔒 OBTENER ROL (Validación robusta)
const esAdmin = computed(() => {
    const rol = localStorage.getItem('user_role');
    // Convertimos a minúsculas para evitar errores si viene como 'Administrador'
    return rol && rol.toLowerCase() === 'administrador'; 
});

const headers = [
  { title: 'ID Venta', key: 'id_venta', align: 'start' },
  { title: 'Cliente', key: 'nombre_cliente' },
  { title: 'Vendedor', key: 'empleado.nombre_empleado' }, 
  { title: 'Fecha', key: 'fecha', sortable: false }, 
  { title: 'Hora', key: 'hora', sortable: false }, 
  { title: 'Monto Total', key: 'monto_total' },
  { title: 'Descuento', key: 'descuento' },
  { title: 'Monto Final', key: 'monto_final', sortable: false },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' },
];

onMounted(async () => {
  if (route.query.success) {
    successMessage.value = '¡Venta registrada exitosamente!';
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  }
  await fetchVentas();
});

// FUNCIÓN DE CARGA
const fetchVentas = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/ventas', {
      params: {
        search: searchTerm.value,
        fecha: searchDate.value
      }
    });
    
    const data = response.data;
    ventas.value = data.data;  
    stats.value = data.stats;  
    
  } catch (error) {
    console.error('Error al cargar las ventas:', error);
  } finally {
    isLoading.value = false;
  }
};

watch([searchTerm, searchDate], () => {
    fetchVentas();
});

// DESCARGAR FACTURA
const descargarFactura = async (item) => {
  downloadingId.value = item.id_venta;

  try {
    const response = await api.get(`/ventas/${item.id_venta}/pdf`, {
      responseType: 'blob' 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `factura_venta_${item.id_venta}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error al descargar PDF:', error);
    alert('No se pudo generar la factura. Verifique la conexión.');
  } finally {
    downloadingId.value = null;
  }
};

// --- HELPERS ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
};

const formatFecha = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatHora = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};
</script>