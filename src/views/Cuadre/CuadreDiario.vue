<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
      <v-icon left>mdi-scale-balance</v-icon> Cierre Diario de Caja
    </h1>

    <v-card class="mb-4 pa-4">
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="fecha"
            label="Fecha del Cierre"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            @change="cargarDatosSistema"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="8">
          <v-btn color="primary" class="mr-2" @click="cargarDatosSistema" :loading="loading">
            <v-icon left>mdi-refresh</v-icon> Recalcular Sistema
          </v-btn>
          
          <v-btn color="success" @click="descargarExcel" :loading="downloading">
            <v-icon left>mdi-file-excel</v-icon> Descargar Reporte
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="fill-height" color="blue-lighten-5">
          <v-card-title class="text-blue-darken-4 font-weight-bold">
            <v-icon left>mdi-monitor</v-icon> Según Sistema (Ventas)
          </v-card-title>
          <v-card-text>
            <div class="py-2">
              <div class="text-caption text-grey-darken-1">Venta Total ISSS</div>
              <div class="text-h5 font-weight-bold">{{ formatCurrency(sistema.isss) }}</div>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="py-2">
              <div class="text-caption text-grey-darken-1">Venta Total M-SELECTO</div>
              <div class="text-h5 font-weight-bold">{{ formatCurrency(sistema.mSelecto) }}</div>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="py-3 bg-blue-darken-1 text-white rounded mt-2 px-3">
              <div class="text-caption">TOTAL VENTAS SISTEMA</div>
              <div class="text-h4 font-weight-bold">{{ formatCurrency(sistema.totalDia) }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="fill-height">
          <v-card-title class="text-green-darken-4 font-weight-bold">
            <v-icon left>mdi-cash-register</v-icon> Arqueo Físico (En Bolsa)
          </v-card-title>
          <v-card-text>
            <v-alert type="info" density="compact" variant="tonal" class="mb-4 text-caption">
              Ingresa el dinero que tienes físicamente en cada bolsa.
            </v-alert>

            <v-text-field
              v-model.number="real.isss"
              label="Efectivo en Bolsa ISSS"
              prefix="$"
              type="number"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model.number="real.mSelecto"
              label="Efectivo en Bolsa M-SELECTO"
              prefix="$"
              type="number"
              variant="outlined"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <v-card class="pa-4">
          <h3 class="text-h6 mb-4">Ajustes de Caja</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="ajustes.cajaChica"
                label="Caja Chica (Base Inicial)"
                prefix="$"
                type="number"
                variant="outlined"
                color="indigo"
                hint="Dinero con el que iniciaste (Lunes, etc)"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="ajustes.salidas"
                label="Salidas / Gastos del Día"
                prefix="$"
                type="number"
                variant="outlined"
                color="red"
                hint="Dinero que sacaste de la caja para pagos"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-4 pa-4 bg-grey-lighten-4 border">
      <v-row align="center">
        <v-col cols="12" md="4" class="text-center">
          <div class="text-subtitle-1">Total Físico en Bolsas</div>
          <div class="text-h5 font-weight-bold text-green-darken-3">
            {{ formatCurrency(totalFisicoEnBolsas) }}
          </div>
        </v-col>
        
        <v-col cols="12" md="4" class="text-center border-s border-e">
          <div class="text-subtitle-1">Debería Haber (Ventas + Caja - Salidas)</div>
          <div class="text-h5 font-weight-bold text-blue-darken-3">
            {{ formatCurrency(totalDeberiaHaber) }}
          </div>
        </v-col>

        <v-col cols="12" md="4" class="text-center">
          <div class="text-subtitle-1">Diferencia (Cuadre)</div>
          <div 
            class="text-h4 font-weight-black"
            :class="diferencia >= 0 ? 'text-green' : 'text-red'"
          >
            {{ formatCurrency(diferencia) }}
          </div>
          <div class="text-caption font-weight-bold" :class="diferencia >= 0 ? 'text-green' : 'text-red'">
            {{ diferenciaText }}
          </div>
        </v-col>
      </v-row>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO ---
const fecha = ref(new Date().toISOString().substr(0, 10));
const loading = ref(false);
const downloading = ref(false); 

// Datos que vienen del API (Sistema)
const sistema = ref({
  isss: 0,
  mSelecto: 0,
  totalDia: 0
});

// Datos que ingresa el usuario (Realidad)
const real = ref({
  isss: 0,
  mSelecto: 0
});

// Datos de ajustes
const ajustes = ref({
  cajaChica: 0,
  salidas: 0
});

// --- COMPUTADAS (LA MATEMÁTICA) ---

const totalFisicoEnBolsas = computed(() => {
  return (real.value.isss || 0) + (real.value.mSelecto || 0);
});

const totalDeberiaHaber = computed(() => {
  const ventasSistema = sistema.value.totalDia || 0;
  const base = ajustes.value.cajaChica || 0;
  const gastos = ajustes.value.salidas || 0;
  return ventasSistema + base - gastos;
});

const diferencia = computed(() => {
  // Para evitar errores de decimales en JS, redondeamos a 2 decimales
  const dif = totalFisicoEnBolsas.value - totalDeberiaHaber.value;
  return Math.round(dif * 100) / 100;
});

const diferenciaText = computed(() => {
  if (diferencia.value === 0) return '¡CUADRE PERFECTO!';
  if (diferencia.value > 0) return 'SOBRANTE (Revisa si cobraste de más)';
  return 'FALTANTE (Falta dinero en caja)';
});

// --- MÉTODOS ---

const cargarDatosSistema = async () => {
  loading.value = true;
  try {
    // CAMBIO: api.get ruta relativa + params
    const response = await api.get('/cuadre/consultar', {
      params: { fecha: fecha.value }
    });

    sistema.value.isss = response.data.sistema.total_isss;
    sistema.value.mSelecto = response.data.sistema.total_m_selecto;
    sistema.value.totalDia = response.data.sistema.total_ventas_dia;

  } catch (error) {
    console.error('Error al cargar datos del sistema:', error);
    // Si falla la conexión, ponemos ceros para no romper la UI
    sistema.value = { isss: 0, mSelecto: 0, totalDia: 0 };
  } finally {
    loading.value = false;
  }
};

const descargarExcel = async () => {
  downloading.value = true;
  try {
    const payload = {
        fecha: fecha.value,
        caja_chica: ajustes.value.cajaChica || 0,
        gastos: ajustes.value.salidas || 0,
        real_isss: real.value.isss || 0,
        real_m_selecto: real.value.mSelecto || 0
    };

    // CAMBIO: api.post ruta relativa + responseType blob
    const response = await api.post('/cuadre/exportar', payload, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cierre_Diario_${fecha.value}.xls`);
    document.body.appendChild(link);
    link.click();
    link.remove(); 

  } catch (error) {
    console.error(error);
    alert('Error al descargar el Excel');
  } finally {
    downloading.value = false;
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// --- INICIO ---
onMounted(() => {
  cargarDatosSistema();
});
</script>