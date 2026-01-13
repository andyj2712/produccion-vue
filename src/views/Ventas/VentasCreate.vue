<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
        Registrar Nueva Venta
      </h1>
    </v-col>
  </v-row>

  <v-form @submit.prevent="handleSubmit">
    
    <v-row v-if="errors.form">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" closable @click:close="errors.form = ''">
          {{ errors.form }}
        </v-alert>
      </v-col>
    </v-row>

    <v-card class="mb-5" elevation="1" border>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.empleado_id"
              :items="empleados"
              item-title="nombre_empleado"
              item-value="id_empleado"
              label="Empleado que realiza la venta"
              variant="underlined"
              prepend-icon="mdi-account-tie"
              :error-messages="errors.empleado_id"
              color="blue-darken-4"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.nombre_cliente"
              label="Nombre del Cliente"
              variant="underlined"
              prepend-icon="mdi-account"
              :error-messages="errors.nombre_cliente"
              color="blue-darken-4"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mb-5" elevation="1" border>
      <v-card-title class="text-subtitle-1 font-weight-bold bg-grey-lighten-4 pa-3">
        Detalles de la Venta
      </v-card-title>
      
      <v-card-text class="pt-4">
        <v-row class="d-none d-md-flex text-caption text-grey font-weight-bold mb-2">
            <v-col cols="4">Producto</v-col>
            <v-col cols="2">Cantidad</v-col>
            <v-col cols="2">Precio Unit.</v-col>
            <v-col cols="2">Desc. Unitario ($)</v-col>
            <v-col cols="2">Subtotal Línea</v-col>
        </v-row>

        <div v-for="(item, index) in form.productos" :key="item.id">
          <v-row align="center" dense>
            
            <v-col cols="12" md="4">
              <v-select
                v-model="item.id_producto"
                :items="productos"
                item-title="nombre_producto"
                item-value="id_producto"
                label="Seleccionar Producto"
                variant="outlined"
                density="compact"
                hide-details="auto"
                @update:modelValue="handleProductoSeleccionado(item)"
                class="mb-2 mb-md-0"
              />
            </v-col>

            <v-col cols="6" md="2">
              <v-text-field
                v-model.number="item.cantidad"
                label="Cant."
                type="number"
                min="1"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="6" md="2">
              <v-text-field
                v-model.number="item.precio_unitario"
                label="Precio"
                variant="outlined"
                density="compact"
                readonly
                hide-details="auto"
                prefix="$"
                bg-color="grey-lighten-5"
              />
            </v-col>

            <v-col cols="6" md="2">
              <v-text-field
                v-model.number="item.descuento_unitario"
                label="Desc. c/u"
                type="number"
                min="0"
                :max="item.precio_unitario"
                variant="outlined"
                density="compact"
                hide-details="auto"
                prefix="-$"
                color="orange-darken-3"
              />
            </v-col>

            <v-col cols="6" md="2">
            <v-text-field
              :model-value="((item.cantidad * item.precio_unitario) - (item.descuento_unitario || 0)).toFixed(2)"
              label="Total"
              variant="outlined"
              density="compact"
              readonly
              hide-details="auto"
              prefix="$"
              class="font-weight-bold"
            />
          </v-col>

          </v-row>
          
          <v-row justify="end" class="mb-2" v-if="form.productos.length > 1">
             <v-col cols="auto">
                <v-btn
                    color="error"
                    variant="text"
                    size="small"
                    prepend-icon="mdi-trash-can"
                    @click="removerProducto(item.id)"
                >Eliminar renglón</v-btn>
             </v-col>
          </v-row>
          
          <v-divider class="my-3 border-dashed" v-if="index < form.productos.length - 1" />
        </div>

        <v-btn
          color="teal-darken-1"
          class="mt-4 text-none"
          prepend-icon="mdi-plus"
          variant="elevated"
          @click="agregarProducto"
        >
          Añadir otro producto
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card class="mb-5 bg-teal-lighten-5" elevation="0" border>
      <v-card-title class="text-h6">Resumen</v-card-title>
      <v-divider />
      
      <v-card-text>
        <v-row>
            <v-col cols="12" md="6">
                </v-col>
            <v-col cols="12" md="6">
                <v-row dense>
                    <v-col cols="6" class="text-grey-darken-2">SUBTOTAL (Bruto)</v-col>
                    <v-col cols="6" class="text-right font-weight-medium">{{ formatCurrency(subtotalBruto) }}</v-col>
                </v-row>
                
                <v-row dense>
                    <v-col cols="6" class="text-red-darken-2">DESCUENTO TOTAL</v-col>
                    <v-col cols="6" class="text-right text-red-darken-2 font-weight-medium">- {{ formatCurrency(totalDescuentos) }}</v-col>
                </v-row>

                <v-divider class="my-2"></v-divider>

                <v-row dense align="center">
                    <v-col cols="6" class="text-h6 font-weight-bold text-green-darken-4">TOTAL A PAGAR</v-col>
                    <v-col cols="6" class="text-right text-h5 font-weight-bold text-green-darken-3">{{ formatCurrency(totalFinal) }}</v-col>
                </v-row>
                
                <div class="mt-2 text-caption text-blue-grey text-right">
                    Comisión para empleado: {{ formatCurrency(comisionTotal) }}
                </div>
            </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" class="d-flex justify-end ga-3">
        <v-btn to="/ventas" color="grey" variant="text" size="large">Cancelar</v-btn>
        <v-btn type="submit" color="success" :loading="loading" prepend-icon="mdi-content-save" size="large">
          Guardar Venta
        </v-btn>
      </v-col>
    </v-row>

  </v-form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// CAMBIO: Importamos 'api'
import api from '@/axios';

const router = useRouter();
const empleados = ref([]);
const productos = ref([]);
const loading = ref(false);
const errors = ref({});
let itemCounter = 1;

const form = ref({
  nombre_cliente: '',
  empleado_id: '',
  productos: [
    { id: 1, id_producto: '', cantidad: 1, precio_unitario: 0, valor_comision: 0, descuento_unitario: 0 }
  ]
});

// --- CÁLCULOS ---

const subtotalBruto = computed(() => {
  return form.value.productos.reduce((total, item) => {
    return total + (item.cantidad * item.precio_unitario);
  }, 0);
});

const totalDescuentos = computed(() => {
  return form.value.productos.reduce((total, item) => {
    const desc = item.descuento_unitario || 0;
    return total + desc; 
  }, 0);
});

const totalFinal = computed(() => {
  const total = subtotalBruto.value - totalDescuentos.value;
  return total > 0 ? total : 0;
});

const comisionTotal = computed(() => {
  return form.value.productos.reduce((total, item) => {
    return total + (item.cantidad * item.valor_comision);
  }, 0);
});

// --- MÉTODOS ---

onMounted(async () => {
  await fetchCreateResources();
});

const fetchCreateResources = async () => {
  try {
    // CAMBIO: api.get ruta relativa
    const response = await api.get('/ventas/create-resources');
    empleados.value = response.data.empleados;
    productos.value = response.data.productos;
  } catch (error) {
    errors.value.form = "Error cargando datos.";
  }
};

const agregarProducto = () => {
  itemCounter++;
  form.value.productos.push({
    id: itemCounter,
    id_producto: '',
    cantidad: 1,
    precio_unitario: 0,
    valor_comision: 0,
    descuento_unitario: 0 
  });
};

const removerProducto = (id) => {
  form.value.productos = form.value.productos.filter(item => item.id !== id);
};

const handleProductoSeleccionado = (item) => {
  const productoElegido = productos.value.find(p => p.id_producto === item.id_producto);
  if (productoElegido) {
    item.precio_unitario = productoElegido.precio_venta;
    item.valor_comision = productoElegido.valor_comision;
  } else {
    item.precio_unitario = 0;
    item.valor_comision = 0;
  }
  item.descuento_unitario = 0;
};

const handleSubmit = async () => {
  loading.value = true;
  errors.value = {};

  try {
    // MANTENEMOS TU FIX DEL ERROR 422 (monto_total y descuento)
    const payload = {
        nombre_cliente: form.value.nombre_cliente,
        empleado_id: form.value.empleado_id,
        monto_total: totalFinal.value, 
        descuento: totalDescuentos.value, 
        productos: form.value.productos.map(p => ({
            id_producto: p.id_producto,
            cantidad: p.cantidad,
            precio_unitario: p.precio_unitario,
            descuento: p.descuento_unitario
        }))
    };

    // CAMBIO: api.post ruta relativa
    await api.post('/ventas', payload);

    router.push({ path: '/ventas', query: { success: 'true' } });

  } catch (error) {
    if (error.response && error.response.data) {
        errors.value = error.response.data.errors || {};
        if(error.response.data.message) errors.value.form = error.response.data.message;
    } else {
        errors.value.form = "Error de conexión.";
    }
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
};
</script>