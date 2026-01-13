<template>
  <!-- Título y Botón de Volver -->
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold text-blue-darken-4">Editar Producto</h1>
      <p class="text-subtitle-1 text-grey-darken-1 mb-2">
        Modifique la información del producto existente en el inventario.
      </p>
      <v-btn to="/productos" variant="text" prepend-icon="mdi-arrow-left" color="blue-darken-4" class="mb-4">
        Volver a Productos
      </v-btn>
    </v-col>
  </v-row>

  <!-- Formulario Principal -->
  <v-form @submit.prevent="handleUpdate" :disabled="initialLoading">
    <v-row>

      <!-- Todas tus tarjetas de formulario (Sin cambios) -->
      <!-- ... (Tarjeta 1: Información) ... -->
      <v-col cols="12">
        <v-card class="mb-5" elevation="2" :loading="initialLoading">
          <v-card-title class="bg-blue-grey-lighten-5 text-blue-darken-4 d-flex align-center">
            <v-icon icon="mdi-information-outline" start />
            Información del Producto
          </v-card-title>
          <v-divider />
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.nombre_producto"
                  label="Nombre del Producto"
                  placeholder="Ej: Botellas PET"
                  prepend-inner-icon="mdi-tag-outline"
                  variant="outlined"
                  :error-messages="errors.nombre_producto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.stock_disponible"
                  label="Stock Disponible"
                  type="number"
                  min="0"
                  prepend-inner-icon="mdi-package-variant"
                  variant="outlined"
                  :error-messages="errors.stock_disponible"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.fecha_ingreso"
                  label="Fecha de Ingreso"
                  type="date"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  :error-messages="errors.fecha_ingreso"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-select
                  v-model="form.categoria_producto"
                  label="Categoría del Producto"
                  :items="['ISSS','M-SELECTO']"
                  variant="outlined"
                  :error-messages="errors.categoria_producto"
                  placeholder="Seleccione una categoría"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ... (Tarjeta 2: Precios) ... -->
      <v-col cols="12">
        <v-card class="mb-5" elevation="2" :loading="initialLoading">
          <v-card-title class="bg-blue-grey-lighten-5 text-blue-darken-4 d-flex align-center">
            <v-icon icon="mdi-cash-multiple" start />
            Definición de Precios
          </v-card-title>
          <v-divider />

          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.precio_compra"
                  label="Precio de Compra"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  prefix="$"
                  variant="outlined"
                  :error-messages="errors.precio_compra"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.precio_venta"
                  label="Precio de Venta"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  prefix="$"
                  variant="outlined"
                  :error-messages="errors.precio_venta"
                />
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label text-caption font-weight-medium mb-1">Margen de Ganancia por unidad</label>
                <v-sheet
                  :color="ganancia.clase === 'profit' ? 'green' : (ganancia.clase === 'loss' ? 'red' : 'grey-lighten-2')"
                  class="pa-3 rounded d-flex align-center"
                  variant="tonal"
                  height="56px"
                >
                  <span class="text-h6 font-weight-bold" :class="ganancia.clase === 'grey-lighten-2' ? 'text-grey-darken-2' : ''">{{ ganancia.monto }}</span>
                  <span class="text-body-2 ml-2" :class="ganancia.clase === 'grey-lighten-2' ? 'text-grey-darken-1' : ''">({{ ganancia.porcentaje }})</span>
                </v-sheet>
              </v-col>
              <v-col cols="12" md="4">
                 <v-text-field
                  v-model.number="form.valor_comision"
                  label="Comisión Fija por Unidad ($)"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.0000"
                  prefix="$"
                  variant="outlined"
                  :error-messages="errors.valor_comision"
                  hint="Monto que el empleado gana por libra vendida."
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- ... (Tarjeta 3: Descripción) ... -->
      <v-col cols="12">
        <v-card class="mb-5" elevation="2" :loading="initialLoading">
          <v-card-title class="bg-blue-grey-lighten-5 text-blue-darken-4 d-flex align-center">
            <v-icon icon="mdi-file-document-outline" start />
            Descripción
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="form.descripcion_producto"
                  label="Descripción del Producto"
                  rows="3"
                  variant="outlined"
                  :error-messages="errors.descripcion_producto"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Botón de Guardar/Actualizar (Sin cambios) -->
      <v-col cols="12" class="d-flex justify-end">
        <v-btn
          type="submit"
          color="success"
          :loading="loading"
          prepend-icon="mdi-content-save-edit"
          size="large"
        >
          Actualizar Cambios
        </v-btn>
      </v-col>

    </v-row>
  </v-form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO ---
const router = useRouter();
const route = useRoute();
const productId = ref(route.params.id); 
const loading = ref(false);
const initialLoading = ref(true);
const errors = ref({}); 
const form = ref({
  nombre_producto: '',
  stock_disponible: 0,
  fecha_ingreso: '',
  categoria_producto: '',
  valor_comision: 0.0000,
  precio_compra: 0,
  precio_venta: 0,
  descripcion_producto: ''
});

// --- CICLO DE VIDA ---
onMounted(() => {
  loadProductData();
});

// --- CÁLCULO DE GANANCIA ---
const ganancia = computed(() => {
  const venta = parseFloat(form.value.precio_venta) || 0;
  const compra = parseFloat(form.value.precio_compra) || 0;
  const montoNum = venta - compra;
  let porcentajeNum = 0;
  if (compra > 0) {
    porcentajeNum = ((montoNum / compra) * 100);
  } else if (compra === 0 && montoNum > 0) {
    porcentajeNum = 100;
  }
  let claseCss = '';
  if (montoNum < 0) {
    claseCss = 'loss';
  } else if (montoNum > 0) {
    claseCss = 'profit';
  }
  return {
    monto: formatCurrency(montoNum),
    porcentaje: (porcentajeNum > 0 ? (porcentajeNum === 100 ? '100+' : porcentajeNum.toFixed(1)) : '0') + '%',
    clase: claseCss
  };
});

// --- ACCIONES ---

// Cargar Datos
const loadProductData = async () => {
  initialLoading.value = true;
  errors.value = {};
  
  try {
    // CAMBIO: api.get ruta relativa
    const response = await api.get(`/productos/${productId.value}`);
    
    const apiData = response.data.data;

    form.value = {
      nombre_producto: apiData.nombre,
      descripcion_producto: apiData.descripcion,
      precio_venta: apiData.precioVenta,
      precio_compra: apiData.precioCompra,
      stock_disponible: apiData.stock,
      categoria_producto: apiData.categoria,
      valor_comision: apiData.comision,
      fecha_ingreso: apiData.fechaIngreso.split('T')[0]
    };

  } catch (error) {
    console.error("Error cargando el producto:", error);
    errors.value.general = 'No se pudo cargar la información del producto. (Error: ' + (error.response?.status || 'desconocido') + ')';
  } finally {
    initialLoading.value = false;
  }
};

// Función para ACTUALIZAR
const handleUpdate = async () => {
  loading.value = true;
  errors.value = {}; 

  try {
    // CAMBIO: api.post ruta relativa
    await api.post(`/productos/${productId.value}`, {
      ...form.value,  
      _method: 'PUT'   
    });

    router.push({ path: '/productos', query: { updated: 'true' } });

  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      errors.value.general = 'Ocurrió un error. Por favor, inténtelo de nuevo.';
      console.error(error);
    }
  } finally {
    loading.value = false;
  }
};

// --- HELPERS ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
};
</script>

<style scoped>
/* Estilos opcionales */
</style>