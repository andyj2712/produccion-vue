<template>
  <v-container fluid>
    <v-row class="mb-2" align="center">
      <v-col cols="12" md="8">
        <h2 class="text-h4 font-weight-bold text-blue-darken-4">
          <v-icon start>mdi-truck-delivery</v-icon>
          Registro de entrega a Corinca
        </h2>
        <p class="text-grey">Calcula y registra las entregas semanales a Corinca.</p>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="fecha"
          type="date"
          label="Fecha de Entrega"
          variant="outlined"
          density="compact"
          color="blue-darken-4"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="bg-blue-grey-lighten-5 text-subtitle-1 font-weight-bold">
            1. Seleccionar Transporte
          </v-card-title>
          <v-card-text class="pa-4">
            <v-label class="mb-2 font-weight-bold text-blue-darken-4">Flota Disponible:</v-label>
            <v-item-group mandatory v-model="camionSeleccionadoIndex">
              <v-row dense>
                <v-col cols="12" v-for="(camion, index) in flotaCamiones" :key="index">
                  <v-item v-slot="{ isSelected, toggle }">
                    <v-card
                      :color="isSelected ? 'blue-lighten-5' : 'white'"
                      :class="isSelected ? 'border-blue shadow-lg' : ''"
                      class="d-flex align-center pa-2 cursor-pointer transition-swing"
                      variant="outlined"
                      @click="toggle"
                    >
                      <v-avatar color="blue-darken-3" icon="mdi-truck" size="40" class="mr-3"></v-avatar>
                      <div>
                        <div class="font-weight-bold text-body-1 text-blue-darken-4">{{ camion.serie }}</div>
                        <div class="text-caption font-weight-bold text-blue-darken-2">Cap: {{ camion.capacidad }}</div>
                      </div>
                      <v-spacer></v-spacer>
                      <v-icon v-if="isSelected" color="blue-darken-4" icon="mdi-check-circle"></v-icon>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>

            <v-divider class="my-4"></v-divider>

            <v-checkbox
              v-model="usarCamionExterno"
              label="Usar transporte externo / rentado"
              color="orange-darken-3"
              density="compact"
              hide-details
            ></v-checkbox>

            <div v-if="usarCamionExterno" class="mt-2 bg-orange-lighten-5 pa-3 rounded">
              <v-text-field
                v-model="camionExterno.serie"
                label="Placa / Serie"
                variant="outlined"
                density="compact"
                bg-color="white"
                class="mb-2"
              ></v-text-field>
              <v-text-field
                v-model="camionExterno.capacidad"
                label="Capacidad (kg/lbs)"
                variant="outlined"
                density="compact"
                bg-color="white"
              ></v-text-field>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="bg-blue-darken-4 text-white d-flex justify-space-between align-center">
            <span>2. Calculadora de Carga</span>
            <span class="text-h6">{{ totalLibras.toLocaleString() }} Kl Total</span>
          </v-card-title>
          
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr class="bg-grey-lighten-4">
                  <th class="text-left font-weight-bold pl-4">Descripción Material</th>
                  <th class="text-right font-weight-bold" style="width: 120px;">Precio ($)</th>
                  <th class="text-center font-weight-bold" style="width: 150px;">Peso (Kl)</th>
                  <th class="text-right font-weight-bold" style="width: 140px;">Subtotal</th>
                  <th style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in listaMateriales" :key="index">
                  <td class="pa-2">
                    <v-text-field
                        v-model="item.nombre"
                        placeholder="Ej. Solido Especial Directo..."
                        variant="outlined"
                        density="compact"
                        hide-details
                        bg-color="white"
                    ></v-text-field>
                  </td>
                  <td class="pa-2" style="width: 140px;">
                    <v-text-field
                      v-model.number="item.precio"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                      prefix="$"
                      min="0"
                      step="0.01"
                    ></v-text-field>
                  </td>
                  <td class="pa-2">
                    <v-text-field
                      v-model.number="item.libras"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="centered-input"
                      min="0"
                    ></v-text-field>
                  </td>
                  <td class="text-right font-weight-bold text-blue-darken-3">
                    {{ formatCurrency((item.libras || 0) * (item.precio || 0)) }}
                  </td>
                  <td class="text-center">
                      <v-btn icon="mdi-delete" size="x-small" color="grey-lighten-1" variant="text" @click="eliminarFilaMaterial(index)"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            
            <div class="pa-2 bg-grey-lighten-5 text-center border-bottom">
                <v-btn prepend-icon="mdi-plus" variant="text" color="blue-darken-3" size="small" @click="agregarFilaMaterial">
                    Agregar Fila
                </v-btn>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="d-flex flex-column align-stretch pa-4 bg-grey-lighten-5">
            <v-row class="w-100 ma-0">
              <v-col cols="12" md="6" class="text-md-right text-center ml-auto">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-grey-darken-1">Subtotal:</span>
                  <span class="font-weight-bold">{{ formatCurrency(calculoSubtotal) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-grey-darken-1">IVA (13%):</span>
                  <span class="font-weight-bold">{{ formatCurrency(calculoIVA) }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-orange-darken-4 font-weight-bold">Retención (-):</span>
                    <v-text-field
                      v-model.number="retencion"
                      type="number"
                      prefix="$"
                      density="compact"
                      variant="underlined"
                      hide-details
                      style="max-width: 100px;"
                      class="text-right font-weight-bold"
                    ></v-text-field>
                </div>
                <v-divider class="mb-2"></v-divider>
                <div class="d-flex justify-space-between text-h5 font-weight-black text-green-darken-2">
                  <span>TOTAL A COBRAR:</span>
                  <span>{{ formatCurrency(calculoTotalFinal) }}</span>
                </div>
              </v-col>
            </v-row>
            
            <v-btn
              block
              color="blue-darken-4"
              size="x-large"
              class="mt-4"
              prepend-icon="mdi-content-save-check"
              :loading="cargando"
              @click="registrarEntrega"
            >
              Registrar Entrega 
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6 align-center">
      <v-col cols="12" sm="6">
        <h3 class="text-h5 font-weight-bold text-grey-darken-3">Historial de Entregas</h3>
      </v-col>
      <v-col cols="12" sm="6" class="text-right">
        <v-text-field
            v-model="filtroFecha"
            type="date"
            label="Buscar por Fecha"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            class="d-inline-block"
            style="max-width: 200px;"
        ></v-text-field>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
            <v-data-table
                :headers="headersHistorial"
                :items="historialFiltrado"
                :loading="cargandoHistorial"
                no-data-text="No se encontraron entregas."
                class="elevation-0"
            >
                <template v-slot:item.fecha="{ value }">
                    <v-icon start size="small" icon="mdi-calendar" color="blue-darken-4"></v-icon>
                    {{ formatDate(value) }}
                </template>

                <template v-slot:item.camion_info="{ value }">
                    <div class="py-1">
                        <v-chip size="small" color="blue-darken-4" variant="flat" class="mb-1">
                            {{ value.serie }}
                        </v-chip>
                        <div class="text-caption font-weight-bold text-blue-darken-2" v-if="value.capacidad">
                            {{ value.capacidad }} ({{ value.tipo }})
                        </div>
                    </div>
                </template>

                <template v-slot:item.detalle_materiales="{ value }">
                    <div class="d-flex flex-wrap gap-1 py-1">
                        <v-chip
                            v-for="(m, i) in value"
                            :key="i"
                            size="x-small"
                            variant="outlined"
                            color="blue-darken-2"
                            class="ma-1 font-weight-bold"
                        >
                            {{ m.material }}
                        </v-chip>
                    </div>
                </template>

                <template v-slot:item.retencion="{ value }">
                    <span class="text-orange-darken-4 font-weight-bold">{{ formatCurrency(value) }}</span>
                </template>

                <template v-slot:item.total_final="{ value }">
                    <span class="font-weight-bold text-green-darken-2">{{ formatCurrency(value) }}</span>
                </template>

                <template v-slot:item.acciones="{ item }">
                    <v-btn icon="mdi-delete" color="red-lighten-2" variant="text" size="small" @click="eliminarEntrega(item.id_entrega)"></v-btn>
                </template>
            </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// 1. IMPORTANTE: Importamos 'api' para la conexión a Railway
import api from '@/axios';

// --- ESTADO REACTIVO ---
const fecha = ref(new Date().toISOString().substr(0, 10)); 
const retencion = ref(0); 
const camionSeleccionadoIndex = ref(0);
const usarCamionExterno = ref(false);
const camionExterno = ref({ serie: '', capacidad: '' });
const filtroFecha = ref('');
const cargando = ref(false);
const cargandoHistorial = ref(false);
const historial = ref([]);
const snackbar = ref({ show: false, text: '', color: 'success' });

// --- DATOS FIJOS ---
const flotaCamiones = ref([
  { serie: 'C 87-825', capacidad: '6,180 kg' },
  { serie: 'C 88-292', capacidad: '6,550 kg' },
  { serie: 'C 92-923', capacidad: '6,620 kg' },
  { serie: 'C 99-450', capacidad: '6,430 kg' },
  { serie: 'P 982-978', capacidad: '4,030 kg' }
]);

const listaMateriales = ref([
  { nombre: '', precio: 0, libras: 0 },
  { nombre: '', precio: 0, libras: 0 }, 
]);

const headersHistorial = [
    { title: 'Fecha', key: 'fecha' },
    { title: 'Transporte', key: 'camion_info' },
    { title: 'Materiales', key: 'detalle_materiales', sortable: false },
    { title: 'Subtotal', key: 'subtotal', value: item => formatCurrency(item.subtotal) },
    { title: 'IVA', key: 'iva', value: item => formatCurrency(item.iva) },
    { title: 'Retención', key: 'retencion' },
    { title: 'Total Pagado', key: 'total_final' },
    { title: '', key: 'acciones', sortable: false, align: 'end' },
];

// --- CÁLCULOS ---
const calculoSubtotal = computed(() => {
    return listaMateriales.value.reduce((acc, item) => acc + ((item.libras || 0) * item.precio), 0);
});

const calculoIVA = computed(() => {
    return calculoSubtotal.value * 0.13;
});

const calculoTotalFinal = computed(() => {
    return (calculoSubtotal.value + calculoIVA.value) - (retencion.value || 0);
});

const camionFinal = computed(() => {
    if (usarCamionExterno.value) {
        return { serie: camionExterno.value.serie || 'Desconocido', capacidad: camionExterno.value.capacidad || 'N/A', tipo: 'Externo' };
    }
    return { ...flotaCamiones.value[camionSeleccionadoIndex.value], tipo: 'Interno' };
});

const totalLibras = computed(() => {
    return listaMateriales.value.reduce((acc, item) => acc + (item.libras || 0), 0);
});

const historialFiltrado = computed(() => {
    if (!filtroFecha.value) return historial.value;
    return historial.value.filter(item => {
        const fechaItem = item.fecha.includes('T') ? item.fecha.split('T')[0] : item.fecha;
        return fechaItem === filtroFecha.value;
    });
});

// --- FUNCIONES ---
onMounted(() => {
    cargarHistorial();
});

const agregarFilaMaterial = () => {
    listaMateriales.value.push({ nombre: '', precio: 0, libras: 0 });
};

const eliminarFilaMaterial = (index) => {
    if(listaMateriales.value.length === 1) {
        listaMateriales.value[0] = { nombre: '', precio: 0, libras: 0 }; 
        return;
    }
    listaMateriales.value.splice(index, 1);
};

// --- CARGAR HISTORIAL CON API ---
const cargarHistorial = async () => {
    cargandoHistorial.value = true;
    try {
        // 2. CAMBIO: api.get (ruta relativa, sin headers manuales)
        const res = await api.get('/entregas-semanales');
        const respuesta = res.data;
        historial.value = Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
    } catch (e) {
        console.error('Error cargando historial:', e);
        historial.value = [];
    } finally {
        cargandoHistorial.value = false;
    }
};

// --- REGISTRAR ENTREGA CON API ---
const registrarEntrega = async () => {
    const materialesValidos = listaMateriales.value.filter(m => m.nombre && m.libras > 0);
    if (materialesValidos.length === 0) return mostrarMensaje('Ingresa datos válidos.', 'warning');
    
    cargando.value = true;
    try {
        const payload = {
            fecha: fecha.value,
            camion_info: camionFinal.value,
            detalle_materiales: materialesValidos.map(m => ({
                material: m.nombre,
                precio_unitario: m.precio,
                libras: m.libras,
                subtotal: m.libras * m.precio
            })),
            subtotal: calculoSubtotal.value,
            iva: calculoIVA.value,
            retencion: retencion.value || 0, // 3. FIX: Enviamos 0 si es null para evitar error 422
            total_final: calculoTotalFinal.value
        };

        // 4. CAMBIO: api.post (ruta relativa)
        await api.post('/entregas-semanales', payload);

        mostrarMensaje('¡Entrega registrada!');
        cargarHistorial();
        limpiarFormulario();
    } catch (e) {
        console.error(e);
        if (e.response && e.response.status === 422) {
             // Muestra errores de validación de Laravel si faltó algo
             console.warn('Errores Laravel:', e.response.data.errors);
             mostrarMensaje('Error de validación (Revisa consola).', 'warning');
        } else {
             mostrarMensaje('Error al guardar.', 'error');
        }
    } finally {
        cargando.value = false;
    }
};

// --- ELIMINAR ENTREGA CON API ---
const eliminarEntrega = async (id) => {
    if(!confirm('¿Seguro?')) return;
    try {
        // 5. CAMBIO: api.delete (ruta relativa)
        await api.delete(`/entregas-semanales/${id}`);
        mostrarMensaje('Eliminado');
        cargarHistorial();
    } catch(e) { mostrarMensaje('Error', 'error'); }
};

const limpiarFormulario = () => {
    listaMateriales.value = [{ nombre: '', precio: 0, libras: 0 }, { nombre: '', precio: 0, libras: 0 }];
    retencion.value = 0;
    usarCamionExterno.value = false;
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    const fechaLimpia = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = fechaLimpia.split('-');
    return `${day}/${month}/${year}`;
}

const mostrarMensaje = (txt, col = 'success') => { snackbar.value = { show: true, text: txt, color: col }; };
</script>

