<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4">Cálculo semanal de material pesado</h1>
      </v-col>
    </v-row>

    <div id="material-pesado-report">
      <v-card class="mb-6">
        <v-card-title>
          <v-row align="center">
            <v-col cols="6">Para Ronald</v-col>
            <v-col cols="6" class="text-right">Día: {{ currentDate }}</v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-table density="compact" class="mb-4">
            <thead>
              <tr>
                <th></th>
                <th>Bronce</th>
                <th>RAC</th>
                <th>Acero</th>
                <th>Aluminio</th>
                <th>Cobre</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$</td>
                <td>{{ currency(materialPrices.bronce) }}</td>
                <td>{{ currency(materialPrices.rac) }}</td>
                <td>{{ currency(materialPrices.acero) }}</td>
                <td>{{ currency(materialPrices.aluminio) }}</td>
                <td>{{ currency(materialPrices.cobre) }}</td>
              </tr>
              <tr>
                <td>lb</td>
                <td>{{ materialInputs.bronce || 0 }}</td>
                <td>{{ materialInputs.rac || 0 }}</td>
                <td>{{ materialInputs.acero || 0 }}</td>
                <td>{{ materialInputs.aluminio || 0 }}</td>
                <td>{{ materialInputs.cobre || 0 }}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td>$</td>
                <td>{{ currency(totalBronce) }}</td>
                <td>{{ currency(totalRAC) }}</td>
                <td>{{ currency(totalAcero) }}</td>
                <td>{{ currency(totalAluminio) }}</td>
                <td>{{ currency(totalCobre) }}</td>
              </tr>
            </tbody>
          </v-table>
          
          <v-row class="mt-4" justify="end">
            <v-col cols="auto" class="text-right">
              <span class="text-h6">TOTAL:</span>
              <span class="text-h6 ml-4" style="font-weight: bold;">{{ currency(grandTotal) }}</span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <v-card class="mb-6">
      <v-card-title>Ingresar Libras por Material</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4" md="2" v-for="(value, key) in materialInputs" :key="key">
            <v-text-field
              :label="key.charAt(0).toUpperCase() + key.slice(1)"
              v-model.number="materialInputs[key]"
              type="number"
              min="0"
              outlined
              dense
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="2" class="d-flex align-center">
            <v-btn color="grey" @click="resetInputs" variant="outlined">Limpiar</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row justify="end">
      <v-col cols="auto">
        
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import html2canvas from 'html2canvas'; 
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO ---
const isSaving = ref(false); 

const materialPrices = ref({
  bronce: 1.65,
  rac: 1.30,
  acero: 0.40,
  aluminio: 0.60,
  cobre: 3.10,
});

const materialInputs = ref({
  bronce: 0,
  rac: 0,
  acero: 0,
  aluminio: 0,
  cobre: 0,
});

const currentDate = ref('');

// --- PROPIEDADES COMPUTADAS ---
const totalBronce = computed(() => (materialInputs.value.bronce || 0) * materialPrices.value.bronce);
const totalRAC = computed(() => (materialInputs.value.rac || 0) * materialPrices.value.rac);
const totalAcero = computed(() => (materialInputs.value.acero || 0) * materialPrices.value.acero);
const totalAluminio = computed(() => (materialInputs.value.aluminio || 0) * materialPrices.value.aluminio);
const totalCobre = computed(() => (materialInputs.value.cobre || 0) * materialPrices.value.cobre);

const grandTotal = computed(() => {
  return totalBronce.value + totalRAC.value + totalAcero.value + totalAluminio.value + totalCobre.value;
});

// --- MÉTODOS ---
const currency = (value) => {
  if (typeof value !== 'number') return '$0.00';
  return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const resetInputs = () => {
  for (const key in materialInputs.value) {
    materialInputs.value[key] = 0;
  }
};

const generateImage = async () => {
  const reportElement = document.getElementById('material-pesado-report');
  if (!reportElement) {
    alert('Error: No se encontró el elemento del reporte.');
    return;
  }

  try {
    const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
    const imageDataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = `reporte-material-pesado-${currentDate.value.replace(/\//g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al generar la imagen:', error);
    alert('Ocurrió un error al generar la imagen.');
  }
};

const saveToDatabase = async () => {
  try {
    const payload = {
      materialInputs: materialInputs.value,
      materialPrices: materialPrices.value,
      totals: {
        bronce: totalBronce.value,
        rac: totalRAC.value,
        acero: totalAcero.value,
        aluminio: totalAluminio.value,
        cobre: totalCobre.value,
      },
      grandTotal: grandTotal.value
    };

    // CAMBIO: api.post ruta relativa
    const response = await api.post('/material-pesado-report', payload);
    
    console.log('Reporte guardado en BD:', response.data);
    return true; 

  } catch (error) {
    console.error('Error al guardar en la base de datos:', error);
    alert('Error: No se pudo guardar el reporte en la base de datos. Revisa la consola.');
    return false; 
  }
};

const handleSaveReport = async () => {
  if (isSaving.value) return; 
  isSaving.value = true;

  const success = await saveToDatabase();

  if (success) {
    await generateImage();
    alert('¡Éxito! Reporte guardado y descargado.');
    resetInputs(); 
  }
  
  isSaving.value = false;
};

// --- HOOK DE CICLO DE VIDA ---
onMounted(() => {
  const today = new Date();
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  currentDate.value = today.toLocaleDateString('es-ES', options); 
});
</script>

<style scoped>
/* Estilos para que la imagen generada se vea bien */
#material-pesado-report {
  background-color: white;
  padding: 24px;
  border-radius: 4px;
}

/* Ajusta el espaciado si es necesario */
.v-table th {
  text-align: left !important;
}
</style>