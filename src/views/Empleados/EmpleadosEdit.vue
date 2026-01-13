<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
        Editar Empleado
      </h1>
      <v-btn to="/empleados" variant="text" prepend-icon="mdi-arrow-left" color="blue-darken-4" class="mb-4">
        Volver a Empleados
      </v-btn>
    </v-col>
  </v-row>

  <v-card class="pa-4 pa-md-6" elevation="2" :loading="initialLoading">
    <!-- El formulario se deshabilita mientras cargan los datos iniciales -->
    <v-form @submit.prevent="handleUpdate" :disabled="initialLoading">
      <v-row>

        <!-- Columna de la Foto (Carga la foto existente) -->
        <v-col cols="12" md="4" class="text-center">
          <label class="v-label text-subtitle-1 font-weight-medium mb-2">Foto del Empleado</label>
          <div class="d-flex justify-center">
            
            <v-avatar color="grey-lighten-2" size="180" class="mb-2 elevation-2">
              <v-img :src="imagePreviewUrl" alt="Vista previa de la foto" cover />
            </v-avatar>
          </div>

          <v-file-input
            label="Cambiar Foto (Opcional)"
            @change="onFileChange"
            accept="image/*"
            variant="outlined"
            density="compact"
            prepend-icon="mdi-camera"
            hide-details="auto"
            :error-messages="errors.foto_empleado"
          />
          <v-label class="text-caption text-grey-darken-1 mt-1">
            Sube una foto nueva solo si deseas reemplazar la actual.
          </v-label>
        </v-col>

        <!-- Columna de Datos (Se rellenan con la data de la API) -->
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.nombre_empleado"
                label="Nombre Completo"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :error-messages="errors.nombre_empleado"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.edad_empleado"
                label="Edad"
                type="number"
                min="18"
                max="100"
                variant="outlined"
                prepend-inner-icon="mdi-cake-variant"
                :error-messages="errors.edad_empleado"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.telefono_empleado"
                label="Teléfono"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                :error-messages="errors.telefono_empleado"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.salario_base"
                label="Salario Base"
                type="number"
                step="0.01"
                min="0"
                prefix="$"
                variant="outlined"
                :error-messages="errors.salario_base"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="form.cargo_empleado"
                label="Cargo"
                :items="['vendedor', 'mantenimiento', 'vigilancia', 'cargamento', 'varios']"
                variant="outlined"
                prepend-inner-icon="mdi-account-tie"
                :error-messages="errors.cargo_empleado"
                placeholder="Selecciona un cargo"
              />
            </v-col>
          </v-row>
        </v-col>

        <!-- Botones de Acción -->
        <v-col cols="12" class="d-flex justify-end ga-3">
          <v-btn
            to="/empleados"
            color="grey-darken-1"
            variant="text"
            prepend-icon="mdi-cancel"
            size="large"
          >
            Cancelar
          </v-btn>
          <v-btn
            type="submit"
            color="success"
            :loading="loading"
            prepend-icon="mdi-content-save-edit"
            size="large"
          >
            Actualizar Empleado
          </v-btn>
        </v-col>

      </v-row>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO REACTIVO ---
const router = useRouter();
const route = useRoute();
const employeeId = ref(route.params.id); 

const loading = ref(false);         
const initialLoading = ref(true); 
const errors = ref({});

const form = ref({
  nombre_empleado: '',
  edad_empleado: null,
  telefono_empleado: '',
  salario_base: null,
  cargo_empleado: ''
});

const selectedFile = ref(null); 
const imagePreviewUrl = ref('/img/default-user.jpg'); 

// --- CICLO DE VIDA ---
onMounted(() => {
  loadEmployeeData();
});

// --- MÉTODOS ---

const loadEmployeeData = async () => {
  initialLoading.value = true;
  try {
    // CAMBIO: api.get ruta relativa
    const response = await api.get(`/empleados/${employeeId.value}`);
    
    const apiData = response.data.data; 

    form.value.nombre_empleado = apiData.nombre;
    form.value.edad_empleado = apiData.edad;
    form.value.telefono_empleado = apiData.telefono;
    form.value.salario_base = apiData.salario;
    form.value.cargo_empleado = apiData.cargo;
    
    imagePreviewUrl.value = apiData.fotoUrl || '/img/default-user.jpg';

  } catch (error) {
    console.error("Error cargando el empleado:", error);
    errors.value.general = 'No se pudo cargar la información del empleado.';
  } finally {
    initialLoading.value = false;
  }
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  selectedFile.value = file; 
  
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreviewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleUpdate = async () => {
  loading.value = true;
  errors.value = {};

  const formData = new FormData();
  formData.append('nombre_empleado', form.value.nombre_empleado);
  formData.append('edad_empleado', form.value.edad_empleado);
  formData.append('telefono_empleado', form.value.telefono_empleado);
  formData.append('salario_base', form.value.salario_base);
  formData.append('cargo_empleado', form.value.cargo_empleado);
  
  if (selectedFile.value) {
    formData.append('foto_empleado', selectedFile.value);
  }

  // Truco para Laravel PUT con archivos
  formData.append('_method', 'PUT');

  try {
    // CAMBIO: api.post ruta relativa
    await api.post(`/empleados/${employeeId.value}`, formData);

    router.push({ path: '/empleados', query: { updated: 'true' } });

  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.error('Error al actualizar el empleado:', error);
      errors.value.general = 'Ocurrió un error inesperado. Inténtelo de nuevo.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Puedes añadir estilos aquí si es necesario */
</style>