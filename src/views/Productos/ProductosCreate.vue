<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold text-blue-darken-4">
        {{ isEditMode ? 'Editar Producto Existente' : 'Añadir Nuevo Producto' }} </h1>
      <p class="text-subtitle-1 text-grey-darken-1 mb-2">
        {{ isEditMode ? 'Modifique la información del producto.' : 'Complete la información del producto para agregarlo al inventario.' }}
      </p>
      <v-btn to="/productos" variant="text" prepend-icon="mdi-arrow-left" color="blue-darken-4" class="mb-4">
        Volver a Productos
      </v-btn>
    </v-col>
  </v-row>

  <v-form @submit.prevent="handleSave">
    <v-row>
      <v-col cols="12" v-if="errors.general">
        <v-alert type="error" variant="tonal" closable @click:close="errors.general = ''">
          {{ errors.general }}
        </v-alert>
      </v-col>

      <v-col cols="12">
        <v-card class="mb-5" elevation="2">
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
                  label="Stock Inicial"
                  type="number"
                  min="0"
                  prepend-inner-icon="mdi-package-variant"
                  variant="outlined"
                  :error-messages="errors.stock_disponible"
                  :readonly="isEditMode" :hint="isEditMode ? 'Actualice el stock desde el listado.' : ''"
                  persistent-hint
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
                  :items="['ISSS', 'M-SELECTO']"
                  variant="outlined"
                  :error-messages="errors.categoria_producto"
                  placeholder="Seleccione una categoría"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="mb-5" elevation="2">
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

      <v-col cols="12">
        <v-card class="mb-5" elevation="2">
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

      <v-col cols="12" class="d-flex justify-end">
        <v-btn
          type="submit"
          color="success"
          :loading="loading"
          prepend-icon="mdi-content-save"
          size="large"
        >
          {{ isEditMode ? 'Actualizar Producto' : 'Guardar Producto' }} </v-btn>
      </v-col>

    </v-row>
  </v-form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'; 
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO Y DETECCIÓN DE MODO ---
const router = useRouter();
const route = useRoute(); 
const productoId = route.params.id; 
const isEditMode = computed(() => !!productoId); 

const loading = ref(false);
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

// --- CARGA DE DATOS PARA EDICIÓN ---
const fetchProductoData = async () => {
    loading.value = true;
    try {
        // CAMBIO: api.get ruta relativa
        const response = await api.get(`/productos/${productoId}`);

        const producto = response.data.data; 

        form.value.nombre_producto = producto.nombre_producto;
        form.value.descripcion_producto = producto.descripcion_producto;
        form.value.precio_venta = producto.precio_venta;
        form.value.precio_compra = producto.precio_compra;
        form.value.fecha_ingreso = producto.fecha_ingreso; 
        form.value.stock_disponible = producto.stock_disponible;
        form.value.categoria_producto = producto.categoria_producto;
        form.value.valor_comision = producto.valor_comision;
        
    } catch (error) {
        console.error("Error al cargar producto:", error.response || error);
        errors.value.general = "No se pudo cargar la información para editar. Verifique la ID.";
        if (error.response && error.response.status === 404) {
             router.push('/productos'); 
        }
    } finally {
        loading.value = false;
    }
};


// --- LÓGICA DE FECHA Y ONMOUNTED ---
onMounted(() => {
    if (isEditMode.value) {
        fetchProductoData();
    } else {
        form.value.fecha_ingreso = new Date().toISOString().split('T')[0];
    }
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
        clase: claseCss === '' && (venta > 0 || compra > 0) ? 'grey-lighten-2' : claseCss
    };
});

// --- ACCIONES ---
const handleSave = async () => {
    loading.value = true;
    errors.value = {}; 

    try {
        // CAMBIO: Rutas relativas
        let apiEndpoint = '/productos';
        let method = 'post';
        let successQuery = 'created';

        if (isEditMode.value) {
            apiEndpoint = `/productos/${productoId}`;
            method = 'put'; 
            successQuery = 'updated'; 
        }
        
        // CAMBIO: Usamos 'api' con la configuración
        await api({
            method: method,
            url: apiEndpoint,
            data: form.value
        });

        router.push({ path: '/productos', query: { success: successQuery } });

    } catch (error) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
        } else {
            errors.value.general = 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo.';
            console.error(error);
        }
    } finally {
        loading.value = false;
    }
};

// --- HELPERS ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) value = 0;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};
</script>

<style scoped>
/* No hay estilos scoped */
</style>