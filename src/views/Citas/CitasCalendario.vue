<template>
  <v-container>
    <!-- CABECERA -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="4">
        <h2 class="text-h4 font-weight-bold">Agenda de Citas</h2>
      </v-col>
      <v-col cols="6" md="3">
        <v-select
          v-model="mesSeleccionado"
          :items="meses"
          item-title="nombre"
          item-value="valor"
          label="Mes"
          variant="outlined"
          density="compact"
          hide-details
          @update:modelValue="cargarCitas"
        ></v-select>
      </v-col>
      <v-col cols="6" md="3">
        <v-select
          v-model="anioSeleccionado"
          :items="anios"
          label="Año"
          variant="outlined"
          density="compact"
          hide-details
          @update:modelValue="cargarCitas"
        ></v-select>
      </v-col>
    </v-row>

    <!-- CALENDARIO -->
    <v-card class="calendario-card" elevation="2">
      <div class="dias-semana">
        <div v-for="dia in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" :key="dia" class="dia-header">
          {{ dia }}
        </div>
      </div>

      <div class="grid-dias">
        <div v-for="n in diasVaciosInicio" :key="'empty-'+n" class="dia-celda vacio"></div>

        <div 
          v-for="dia in diasDelMes" 
          :key="dia" 
          class="dia-celda"
          @click="abrirModalCrear(dia)"
        >
          <div class="numero-dia" :class="{'hoy': esHoy(dia)}">{{ dia }}</div>
          
          <div class="lista-eventos">
            <v-chip
              v-for="cita in citasDelDia(dia)"
              :key="cita.id_cita"
              size="x-small"
              class="mb-1 w-100 justify-start"
              :color="cita.estado === 'cancelada' ? 'grey-lighten-1' : cita.color"
              :class="{'text-decoration-line-through': cita.estado === 'cancelada'}"
              variant="flat"
              label
              @click.stop="abrirModalEditar(cita)"
            >
              <span class="text-truncate text-white font-weight-bold">
                {{ formatHora(cita.fecha_hora) }} - {{ cita.titulo }}
              </span>
            </v-chip>
          </div>
        </div>
      </div>
    </v-card>

    <!-- MODAL -->
    <v-dialog v-model="dialogo" max-width="500px" persistent>
      <v-card>
        <v-toolbar :color="esEdicion ? 'blue-darken-3' : 'teal-darken-3'" title="Detalle de Cita"></v-toolbar>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="guardarCita">
            <v-text-field
              v-model="form.titulo"
              label="Título del Evento"
              prepend-inner-icon="mdi-format-title"
              variant="outlined"
              :readonly="modoLectura"
            ></v-text-field>

            <v-row>
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="form.fecha"
                  label="Fecha"
                  type="date"
                  variant="outlined"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="5">
                 <v-text-field
                  v-model="form.hora"
                  label="Hora"
                  type="time"
                  variant="outlined"
                  :readonly="modoLectura"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="form.comentario"
              label="Comentarios / Detalles"
              rows="3"
              variant="outlined"
              :readonly="modoLectura"
            ></v-textarea>

            <label class="text-caption text-grey">Color de etiqueta</label>
            <div class="d-flex ga-2 mb-4">
              <div 
                v-for="color in coloresDisponibles" 
                :key="color"
                class="color-circle"
                :style="{backgroundColor: color, border: form.color === color ? '3px solid black' : 'none'}"
                @click="!modoLectura && (form.color = color)"
              ></div>
            </div>

            <v-alert v-if="modoLectura" type="warning" variant="tonal" density="compact" class="mb-3">
              <v-icon start>mdi-lock</v-icon>
              Este evento ya pasó, no se puede editar.
            </v-alert>

          </v-form>
        </v-card-text>

        <v-card-actions class="bg-grey-lighten-4 pa-4">
            <template v-if="esEdicion">
                 <v-btn 
                    color="error" 
                    variant="text" 
                    @click="borrarCita"
                    :disabled="modoLectura"
                 >Borrar</v-btn>

                 <v-btn 
                    v-if="form.estado === 'activa'"
                    color="grey-darken-3" 
                    variant="text" 
                    @click="cambiarEstado('cancelada')"
                    :disabled="modoLectura"
                 >Cancelar Cita</v-btn>
                 
                 <v-btn 
                    v-else
                    color="success" 
                    variant="text" 
                    @click="cambiarEstado('activa')"
                    :disabled="modoLectura"
                 >Reactivar</v-btn>
            </template>

            <v-spacer></v-spacer>
            <v-btn color="grey" variant="plain" @click="dialogo = false">Cerrar</v-btn>
            <v-btn 
                color="blue-darken-3" 
                variant="elevated" 
                @click="guardarCita"
                :disabled="modoLectura"
            >
                {{ esEdicion ? 'Actualizar' : 'Guardar' }}
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
        <v-icon start v-if="snackbar.color === 'warning'">mdi-alert</v-icon>
        {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- CONFIGURACIÓN ---
const meses = [
  { nombre: 'Enero', valor: 1 }, { nombre: 'Febrero', valor: 2 }, { nombre: 'Marzo', valor: 3 },
  { nombre: 'Abril', valor: 4 }, { nombre: 'Mayo', valor: 5 }, { nombre: 'Junio', valor: 6 },
  { nombre: 'Julio', valor: 7 }, { nombre: 'Agosto', valor: 8 }, { nombre: 'Septiembre', valor: 9 },
  { nombre: 'Octubre', valor: 10 }, { nombre: 'Noviembre', valor: 11 }, { nombre: 'Diciembre', valor: 12 }
];

// Generamos años dinámicamente hasta el 2050
const anioInicio = 2024;
const anioFin = 2050;
const anios = Array.from({length: anioFin - anioInicio + 1}, (_, i) => anioInicio + i);

const coloresDisponibles = ['#1976D2', '#D32F2F', '#388E3C', '#FBC02D', '#7B1FA2', '#F57C00'];

// --- ESTADO ---
const hoy = new Date();
const mesSeleccionado = ref(hoy.getMonth() + 1);
const anioSeleccionado = ref(hoy.getFullYear());
const listaCitas = ref([]);
const dialogo = ref(false);
const esEdicion = ref(false);
const modoLectura = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });

const form = ref({
    id_cita: null,
    titulo: '',
    fecha: '',
    hora: '09:00',
    comentario: '',
    color: '#1976D2',
    estado: 'activa'
});

// --- CÁLCULOS ---
const diasDelMes = computed(() => {
    return new Date(anioSeleccionado.value, mesSeleccionado.value, 0).getDate();
});

const diasVaciosInicio = computed(() => {
    let diaSemana = new Date(anioSeleccionado.value, mesSeleccionado.value - 1, 1).getDay();
    return diaSemana === 0 ? 6 : diaSemana - 1;
});

// --- API ---
const cargarCitas = async () => {
    try {
        // CAMBIO: api.get ruta relativa + params
        const res = await api.get('/citas', {
            params: { mes: mesSeleccionado.value, anio: anioSeleccionado.value }
        });
        listaCitas.value = res.data;
    } catch (e) {
        console.error(e);
    }
};

onMounted(() => {
    cargarCitas();
});

// --- LÓGICA ---
const citasDelDia = (dia) => {
    const fechaStr = `${anioSeleccionado.value}-${String(mesSeleccionado.value).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return listaCitas.value.filter(c => c.fecha_hora.startsWith(fechaStr));
};

const formatHora = (fechaHora) => {
    return fechaHora.substring(11, 16);
};

const esHoy = (dia) => {
    return dia === hoy.getDate() && 
           mesSeleccionado.value === (hoy.getMonth() + 1) && 
           anioSeleccionado.value === hoy.getFullYear();
};

const abrirModalCrear = (dia) => {
    esEdicion.value = false;
    modoLectura.value = false;
    
    const fechaStr = `${anioSeleccionado.value}-${String(mesSeleccionado.value).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    let horaDefault = '09:00';
    if(esHoy(dia)) {
        const ahora = new Date();
        horaDefault = `${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;
    }

    form.value = {
        id_cita: null,
        titulo: '',
        fecha: fechaStr,
        hora: horaDefault,
        comentario: '',
        color: '#1976D2',
        estado: 'activa'
    };
    dialogo.value = true;
};

const abrirModalEditar = (cita) => {
    esEdicion.value = true;
    const fechaCita = new Date(cita.fecha_hora);
    modoLectura.value = fechaCita < new Date(); 

    form.value = {
        id_cita: cita.id_cita,
        titulo: cita.titulo,
        fecha: cita.fecha_hora.substring(0, 10),
        hora: cita.fecha_hora.substring(11, 16),
        comentario: cita.comentario,
        color: cita.color,
        estado: cita.estado
    };
    dialogo.value = true;
};

// --- VALIDACIÓN Y GUARDADO ---
const guardarCita = async () => {
    try {
        // 1. CONSTRUIR FECHA COMPLETA PARA VALIDAR
        const fechaISO = `${form.value.fecha}T${form.value.hora}`;
        const fechaCita = new Date(fechaISO);
        const ahora = new Date();

        // 2. VALIDACIÓN: NO PERMITIR PASADO
        if (fechaCita < new Date(ahora.getTime() - 60000)) {
            mostrarMensaje('⚠️ No puedes agendar una cita en una hora que ya pasó.', 'warning');
            return; 
        }

        const fechaCompletaBD = `${form.value.fecha} ${form.value.hora}:00`;
        
        const payload = {
            titulo: form.value.titulo,
            fecha_hora: fechaCompletaBD,
            comentario: form.value.comentario,
            color: form.value.color,
            estado: form.value.estado
        };

        // CAMBIO: api.put / api.post rutas relativas
        if (esEdicion.value) {
            await api.put(`/citas/${form.value.id_cita}`, payload);
            mostrarMensaje('Cita actualizada');
        } else {
            await api.post('/citas', payload);
            mostrarMensaje('Cita agendada exitosamente');
        }
        
        dialogo.value = false;
        cargarCitas();
        
    } catch (e) {
        if (e.response && e.response.status === 422) {
             mostrarMensaje(e.response.data.message || 'Datos inválidos', 'error');
        } else {
             mostrarMensaje('Error al guardar', 'error');
        }
    }
};

const cambiarEstado = async (nuevoEstado) => {
    form.value.estado = nuevoEstado;
    await guardarCita(); 
};

const borrarCita = async () => {
    if(!confirm('¿Seguro de borrar esta cita permanentemente?')) return;
    try {
        // CAMBIO: api.delete ruta relativa
        await api.delete(`/citas/${form.value.id_cita}`);
        mostrarMensaje('Cita eliminada');
        dialogo.value = false;
        cargarCitas();
    } catch(e) { mostrarMensaje('Error al borrar', 'error'); }
};

const mostrarMensaje = (txt, col = 'success') => {
    snackbar.value = { show: true, text: txt, color: col };
};
</script>

<style scoped>
.calendario-card { border: 1px solid #ddd; }
.dias-semana { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #212121; color: white; text-align: center; font-weight: bold; padding: 10px 0; }
.grid-dias { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #eee; gap: 1px; border-bottom: 1px solid #ddd; }
.dia-celda { background-color: white; min-height: 120px; padding: 5px; cursor: pointer; transition: background 0.2s; display: flex; flex-direction: column; }
.dia-celda:hover { background-color: #f9f9f9; }
.dia-celda.vacio { background-color: #f5f5f5; cursor: default; }
.numero-dia { font-weight: bold; margin-bottom: 5px; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.numero-dia.hoy { background-color: #1976D2; color: white; }
.color-circle { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; }
</style>