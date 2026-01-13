<template>
  <v-container class="fill-height align-start justify-center pt-10" fluid>
    <v-row justify="center" align="center">
      
      <!-- 1. Sección de Bienvenida / Hero -->
      <v-col cols="12" md="8" lg="6" class="text-center mb-6">
        <v-avatar size="100" class="mb-4 elevation-3 bg-white pa-2">
          <v-img src="../assets/logorf.png" alt="Recicladora Fernandez"></v-img>
        </v-avatar>
        
        <h1 class="text-h4 font-weight-bold text-blue-grey-darken-3 mb-1">
          Recicladora Fernández
        </h1>
        <p class="text-subtitle-1 text-grey text-lighten-1">
          Sistema de Gestión y Control
        </p>
      </v-col>

      <!-- 2. Menú Visual (Tarjetas de Acción) -->
      <v-col cols="12" class="mb-8">
        <v-row justify="center" class="ga-4">
          
          <!-- Ventas -->
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 8 : 2"
                class="rounded-xl cursor-pointer h-100 text-center pt-6 pb-4 border-thin"
                color="white"
                to="/ventas"
                style="transition: all 0.3s ease;"
              >
                <v-card-item>
                  <div class="mb-3 bg-green-lighten-5 d-inline-flex pa-3 rounded-circle">
                    <v-icon color="green-darken-2" size="40">mdi-cash-register</v-icon>
                  </div>
                  <div class="text-h6 font-weight-bold text-blue-grey-darken-3">
                    Nueva Venta
                  </div>
                </v-card-item>
              </v-card>
            </v-hover>
          </v-col>

          <!-- Materiales -->
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 8 : 2"
                class="rounded-xl cursor-pointer h-100 text-center pt-6 pb-4 border-thin"
                to="/material-pesado"
                style="transition: all 0.3s ease;"
              >
                <v-card-item>
                  <div class="mb-3 bg-blue-lighten-5 d-inline-flex pa-3 rounded-circle">
                    <v-icon color="blue-darken-3" size="40">mdi-scale</v-icon>
                  </div>
                  <div class="text-h6 font-weight-bold text-blue-grey-darken-3">
                    Materiales
                  </div>
                </v-card-item>
              </v-card>
            </v-hover>
          </v-col>

          <!-- Reportes -->
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 8 : 2"
                class="rounded-xl cursor-pointer h-100 text-center pt-6 pb-4 border-thin"
                to="/reporte-ventas"
                style="transition: all 0.3s ease;"
              >
                <v-card-item>
                  <div class="mb-3 bg-orange-lighten-5 d-inline-flex pa-3 rounded-circle">
                    <v-icon color="orange-darken-3" size="40">mdi-chart-box-outline</v-icon>
                  </div>
                  <div class="text-h6 font-weight-bold text-blue-grey-darken-3">
                    Reportes
                  </div>
                </v-card-item>
              </v-card>
            </v-hover>
          </v-col>

        </v-row>
      </v-col>

      <!-- SEPARADOR -->
      <v-col cols="12" md="10" class="mb-4">
        <div class="d-flex align-center">
          <v-divider class="flex-grow-1" color="blue-grey-lighten-4"></v-divider>
          <p class="text-subtitle-1 text-grey text-lighten-1">
          Sistema de Gestión y Control
          </p>
          <v-divider class="flex-grow-1" color="blue-grey-lighten-4"></v-divider>
        </div>
      </v-col>

      <!-- 3. SECCIÓN DE EQUIPOS (Modificada) -->
      <v-col cols="12" md="11" lg="10">
        <h2 class="text-h5 font-weight-medium text-blue-grey-darken-3 text-center mb-6">
          Equipos de carga Recicladora Fernández
        </h2>
        
        <v-row justify="center" class="ga-3">
          <!-- Aumenté el tamaño de cols/lg de 2 a 4 para que sean más grandes -->
          <v-col 
            cols="12" 
            sm="6" 
            md="5" 
            lg="4" 
            v-for="(camion, index) in flota" 
            :key="index"
          >
            <v-card 
              elevation="3" 
              class="rounded-lg overflow-hidden h-100 d-flex flex-column"
            >
              <!-- Imagen del Camión con fondo degradado -->
              <!-- Aumenté height a 240px y cambié el fondo -->
              <div class="camion-bg pa-4 d-flex align-center justify-center" style="height: 240px; position: relative;">
                <v-img 
                  :src="camion.img" 
                  max-height="100%"
                  contain
                  class="rounded truck-hover"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="white"></v-progress-circular>
                    </div>
                  </template>
                </v-img>
              </div>
              
              <v-divider></v-divider>

              <!-- Información: Placa y Peso -->
              <v-card-text class="text-center pa-4 flex-grow-1 bg-white">
                <div class="text-h6 font-weight-bold text-blue-grey-darken-4 mb-1">
                  {{ camion.placa }}
                </div>
                
                <v-chip 
                  size="default" 
                  color="blue-darken-3" 
                  variant="tonal" 
                  class="font-weight-bold mt-1"
                >
                   <v-icon start>mdi-weight-kilogram</v-icon>
                   {{ camion.peso || '--- kg' }} 
                </v-chip>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- Pie de página -->
      <v-col cols="12" class="text-center mt-8 text-caption text-grey">
        © {{ new Date().getFullYear() }} Recicladora Fernández
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

// --- DATA DE LA FLOTA ---
// Nota: Esta sintaxis de 'new URL(..., import.meta.url).href' 
// es EXCLUSIVA y CORRECTA para VITE. ¡No la cambies!
const flota = ref([
  { 
    img: new URL('../assets/C87_825.png', import.meta.url).href, 
    placa: 'C 87-825', 
    peso: '6,180 kg' 
  },
  { 
    img: new URL('../assets/C88_292.png', import.meta.url).href, 
    placa: 'C 88-292', 
    peso: '6,550 kg' 
  },
  { 
    img: new URL('../assets/C92-923.png', import.meta.url).href, 
    placa: 'C 92-923', 
    peso: '6,620 kg' 
  },
  { 
    img: new URL('../assets/C99_450.png', import.meta.url).href, 
    placa: 'C 99-450', 
    peso: '6,430 kg' 
  },
  { 
    img: new URL('../assets/P982_978.png', import.meta.url).href, 
    placa: 'P 982-978', 
    peso: '4,030 kg' 
  },
]);

</script>

<style scoped>
.v-container {
  animation: fadeIn 0.8s ease-out;
}

/* Fondo degradado profesional para los camiones */
.camion-bg {
    /* Degradado radial suave desde blanco hacia gris azulado */
    background: radial-gradient(circle, #eceff1 0%, #cfd8dc 100%);
    border-bottom: 1px solid #b0bec5;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.v-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.12) !important;
}

/* Efecto sutil de zoom en la imagen al pasar el mouse */
.truck-hover {
    transition: transform 0.3s ease;
}
.v-card:hover .truck-hover {
    transform: scale(1.05);
}
</style>