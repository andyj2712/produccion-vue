<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
          Control de Asistencia
        </h1>
      </v-col>

      <v-col cols="12">
        <v-card elevation="2" class="mb-4 py-2">
          <div class="d-flex align-center justify-center">
            <v-btn icon="mdi-chevron-left" variant="text" @click="cambiarFecha(-1)"></v-btn>

            <v-menu
              v-model="menuCalendario"
              :close-on-content-click="false"
              location="bottom center"
            >
              <template v-slot:activator="{ props }">
                <div 
                  v-bind="props" 
                  class="text-h5 font-weight-bold mx-4 text-center cursor-pointer d-flex align-center justify-center" 
                  style="min-width: 250px; cursor: pointer; user-select: none;"
                >
                  <v-icon icon="mdi-calendar-month" class="mr-2" color="blue-darken-2"></v-icon>
                  <div>
                    {{ fechaFormateada }}
                    <div class="text-caption text-grey">
                      {{ esHoy ? '(Hoy - Editable)' : '(Histórico - Solo lectura)' }}
                    </div>
                  </div>
                </div>
              </template>

              <v-card min-width="300">
                <v-date-picker
                  v-model="fechaSeleccionadaPicker"
                  color="primary"
                  hide-header
                  @update:modelValue="seleccionarFechaCalendario"
                ></v-date-picker>
              </v-card>
            </v-menu>

            <v-btn icon="mdi-chevron-right" variant="text" @click="cambiarFecha(1)" :disabled="esHoy"></v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card :loading="loading">
          <div v-if="listaEmpleados.length === 0 && !loading" class="text-center pa-5 text-grey">
            <v-icon size="large" class="mb-2">mdi-account-off</v-icon>
            <h3>No existían empleados registrados en esta fecha.</h3>
          </div>

          <v-table v-else>
            <thead>
              <tr>
                <th class="text-left">Empleado</th>
                <th class="text-left">Cargo</th>
                <th class="text-left" style="width: 250px;">Estado Asistencia</th>
                <th class="text-left">Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="empleado in listaEmpleados" :key="empleado.id_empleado">
                <td class="font-weight-medium">{{ empleado.nombre_empleado }}</td>
                <td class="text-grey-darken-1">{{ empleado.cargo_empleado }}</td>
                
                <td>
                  <v-select
                    v-if="esHoy && !asistenciaYaRegistrada"
                    v-model="empleado.estado_asistencia"
                    :items="opcionesAsistencia"
                    item-title="texto"
                    item-value="valor"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mt-2 mb-2"
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip :color="item.raw.color" class="text-white" size="small">
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>

                  <div v-else-if="empleado.estado_asistencia" class="d-flex align-center py-2">
                    <v-icon 
                      :color="getColorEstado(empleado.estado_asistencia)" 
                      size="small" 
                      class="mr-2"
                    >
                      mdi-circle
                    </v-icon>
                    <span class="font-weight-medium text-body-1 text-high-emphasis">
                      {{ getTextoEstado(empleado.estado_asistencia) }}
                    </span>
                  </div>

                  <div v-else class="d-flex align-center py-2">
                     <v-chip size="small" variant="flat" color="grey-lighten-4" class="text-grey-darken-1 font-weight-bold border">
                        <v-icon start icon="mdi-account-clock-outline" size="small"></v-icon>
                        Recién Ingresado
                     </v-chip>
                  </div>
                </td>

                <td>
                  <v-text-field
                    v-if="esHoy && !asistenciaYaRegistrada"
                    v-model="empleado.observacion"
                    placeholder="..."
                    variant="underlined"
                    density="compact"
                    hide-details
                  ></v-text-field>

                  <span v-else class="text-body-2 text-high-emphasis">
                    {{ empleado.observacion || '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-divider></v-divider>

          <v-card-actions class="pa-4" v-if="esHoy">
            <v-spacer></v-spacer>
            
            <v-btn
              v-if="asistenciaYaRegistrada"
              color="grey-darken-1"
              variant="tonal"
              size="large"
              prepend-icon="mdi-check-all"
              disabled
              style="opacity: 0.8;" 
            >
              Ya se realizó la asistencia del día
            </v-btn>

            <v-btn 
              v-else
              color="success" 
              variant="elevated" 
              size="large" 
              prepend-icon="mdi-content-save"
              @click="mostrarConfirmacion = true"
              :loading="guardando"
            >
              Guardar Asistencia del Día
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="mostrarConfirmacion" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-warning text-white">
          ¿Estás seguro?
        </v-card-title>
        <v-card-text class="pt-4">
          Estás a punto de guardar la asistencia de hoy. 
          <br><br>
          <strong>Nota:</strong> Una vez guardada, no podrás editarla desde esta pantalla por seguridad.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="mostrarConfirmacion = false">
            Cancelar
          </v-btn>
          <v-btn color="warning" variant="elevated" @click="guardarAsistencia">
            Sí, Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO ---
const fechaActual = ref(new Date().toISOString().substr(0, 10));
const fechaServidorHoy = ref('');
const listaEmpleados = ref([]);
const loading = ref(false);
const guardando = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });

// Estados para el calendario y confirmaciones
const mostrarConfirmacion = ref(false); 
const asistenciaYaRegistrada = ref(false);
const menuCalendario = ref(false);
const fechaSeleccionadaPicker = ref(new Date());

const opcionesAsistencia = [
  { texto: 'Asistió', valor: 'asistio', color: 'green-darken-1' },
  { texto: 'Medio Día', valor: 'medio_dia', color: 'orange-darken-1' },
  { texto: 'No Asistió', valor: 'falta', color: 'red-darken-1' }
];

// --- COMPUTED ---
const esHoy = computed(() => {
  return fechaActual.value === fechaServidorHoy.value;
});

const fechaFormateada = computed(() => {
  const [year, month, day] = fechaActual.value.split('-');
  return `${day}/${month}/${year}`;
});

// --- CICLO DE VIDA ---
onMounted(async () => {
  fechaServidorHoy.value = new Date().toISOString().substr(0, 10);
  await cargarDatos(fechaActual.value);
});

// --- MÉTODOS ---

const cambiarFecha = (dias) => {
  const fecha = new Date(fechaActual.value + 'T00:00:00'); 
  fecha.setDate(fecha.getDate() + dias);
  
  fechaActual.value = fecha.toISOString().substr(0, 10);
  fechaSeleccionadaPicker.value = fecha; 
  
  cargarDatos(fechaActual.value);
};

const seleccionarFechaCalendario = (date) => {
  if (!date) return;

  const offset = date.getTimezoneOffset();
  const fechaAjustada = new Date(date.getTime() - (offset * 60 * 1000));
  const fechaString = fechaAjustada.toISOString().split('T')[0];

  fechaActual.value = fechaString;
  menuCalendario.value = false; 
  cargarDatos(fechaActual.value);
};

const cargarDatos = async (fecha) => {
  loading.value = true;
  asistenciaYaRegistrada.value = false; 

  try {
    // CAMBIO: api.get ruta relativa + params
    const response = await api.get('/asistencias', {
      params: { fecha: fecha }
    });

    const rawData = response.data.data;

    // 1. Detectar si YA hubo un pase de lista
    const hayRegistrosPrevios = rawData.some(emp => emp.asistencias && emp.asistencias.length > 0);

    // 2. Procesar empleados
    listaEmpleados.value = rawData.map(emp => {
      const asistencia = emp.asistencias && emp.asistencias.length > 0 ? emp.asistencias[0] : null;
      
      let estadoFinal = 'asistio'; 

      if (hayRegistrosPrevios) {
          if (asistencia) {
              estadoFinal = asistencia.estado;
          } else {
              estadoFinal = null; 
          }
      } else {
          estadoFinal = 'asistio';
      }

      return {
        id_empleado: emp.id_empleado,
        nombre_empleado: emp.nombre_empleado,
        cargo_empleado: emp.cargo_empleado,
        estado_asistencia: estadoFinal,
        observacion: asistencia ? asistencia.observacion : ''
      };
    });
    
    if (esHoy.value && hayRegistrosPrevios) {
      asistenciaYaRegistrada.value = true;
    }

  } catch (error) {
    console.error(error);
    mostrarMensaje('Error al cargar datos', 'error');
  } finally {
    loading.value = false;
  }
};

const guardarAsistencia = async () => {
  mostrarConfirmacion.value = false; 
  guardando.value = true;

  try {
    const empleadosAProcesar = listaEmpleados.value.filter(emp => emp.estado_asistencia !== null);

    const payload = {
      asistencias: empleadosAProcesar.map(emp => ({
        empleado_id: emp.id_empleado,
        estado: emp.estado_asistencia,
        observacion: emp.observacion
      }))
    };

    // CAMBIO: api.post ruta relativa
    await api.post('/asistencias', payload);

    mostrarMensaje('Asistencia registrada correctamente', 'success');
    await cargarDatos(fechaActual.value);

  } catch (error) {
    console.error(error);
    mostrarMensaje('Error al guardar. Intenta nuevamente.', 'error');
  } finally {
    guardando.value = false;
  }
};

const mostrarMensaje = (texto, color) => {
  snackbar.value = { show: true, text: texto, color: color };
};

// --- HELPERS ---
const getColorEstado = (valor) => {
  const opcion = opcionesAsistencia.find(o => o.valor === valor);
  return opcion ? opcion.color : 'grey';
};

const getTextoEstado = (valor) => {
  const opcion = opcionesAsistencia.find(o => o.valor === valor);
  return opcion ? opcion.texto : valor;
};
</script>