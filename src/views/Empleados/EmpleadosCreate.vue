<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
        Añadir Nuevo Empleado
      </h1>
    </v-col>
  </v-row>

  <v-card class="pa-4 pa-md-6" elevation="2">
    <v-form @submit.prevent="handleSubmit">
      <v-row>

        <v-col cols="12" md="4" class="text-center">
          <label class="v-label text-subtitle-1 font-weight-medium mb-2">Foto del Empleado</label>
          <div class="d-flex justify-center">
            
            <v-avatar color="grey-lighten-2" size="180" class="mb-2 elevation-2">
              <v-img :src="imagePreviewUrl" alt="Vista previa de la foto" cover />
            </v-avatar>
          </div>

          <v-file-input
            label="Subir Foto"
            @change="onFileChange"
            accept="image/*"
            variant="outlined"
            density="compact"
            prepend-icon="mdi-camera"
            hide-details="auto"
            :error-messages="errors.foto_empleado"
          />
        </v-col>

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
            prepend-icon="mdi-content-save"
            size="large"
          >
            Guardar Empleado
          </v-btn>
        </v-col>

      </v-row>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO REACTIVO ---
const router = useRouter();
const loading = ref(false);
const errors = ref({}); 

// Datos del formulario
const form = ref({
  nombre_empleado: '',
  edad_empleado: null,
  telefono_empleado: '',
  salario_base: null,
  cargo_empleado: ''
});

// Estado para el archivo de imagen
const selectedFile = ref(null); 
const imagePreviewUrl = ref('/img/default-user.jpg'); 

// --- MÉTODOS ---

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) {
    selectedFile.value = null;
    imagePreviewUrl.value = '/img/default-user.jpg';
    return;
  }
  selectedFile.value = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreviewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = async () => {
  loading.value = true;
  errors.value = {};

  // 1. Construir el FormData
  const formData = new FormData();
  formData.append('nombre_empleado', form.value.nombre_empleado);
  formData.append('edad_empleado', form.value.edad_empleado);
  formData.append('telefono_empleado', form.value.telefono_empleado);
  formData.append('salario_base', form.value.salario_base);
  formData.append('cargo_empleado', form.value.cargo_empleado);
  
  if (selectedFile.value) {
    formData.append('foto_empleado', selectedFile.value);
  }

  // 2. Enviar a la API
  try {
    // CAMBIO: api.post ruta relativa. 
    // Axios detecta FormData y ajusta el Content-Type solo.
    await api.post('/empleados', formData);

    router.push({ path: '/empleados', query: { success: 'true' } });

  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.error('Error al guardar el empleado:', error);
      errors.value.general = 'Ocurrió un error inesperado. Inténtelo de nuevo.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
</style>