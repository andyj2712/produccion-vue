<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
        Gestión de Inventario
      </h1>
    </v-col>

    <!-- 
      ESTE BLOQUE 'v-alert' AHORA MUESTRA EL MENSAJE DE ÉXITO 
    -->
    <v-col cols="12">
      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        closable
        icon="mdi-check-circle"
        class="mb-4"
        @click:close="successMessage = ''"
      >
        {{ successMessage }}
      </v-alert>
    </v-col>

    <!-- El resto de tu template (Stats, Tabla, etc.) no cambia -->
    <!-- ... (tu template existente) ... -->
    <v-col cols="12" sm="4">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ stats.totalProductos }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Total Productos
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="4">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-green-darken-1 mb-2">
            {{ stats.totalStock }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Cantidad en Inventario
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="4">
      <v-card elevation="2" class="text-center">
        <v-card-text>
          <div class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
            {{ stats.nuevosMes }}
          </div>
          <div class="text-uppercase text-grey-darken-1 text-subtitle-2">
            Nuevos este mes
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card class="pa-4" flat>
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="auto">
            <v-btn
              to="/productos/create"
              color="teal-darken-1"
              prepend-icon="mdi-plus"
              size="large"
              block
            >
              Añadir Nuevo Producto
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchTerm"
              label="Buscar productos..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-data-table
        :headers="[
          { title: 'ID', key: 'id_producto', align: 'start' },
          { title: 'Nombre', key: 'nombre_producto' },
          { title: 'Stock', key: 'stock_disponible', align: 'center' },
          { title: 'Precio Venta', key: 'precio_venta' },
          { title: 'Categoria', key: 'categoria_producto' },
          { title: 'Ingreso', key: 'fecha_ingreso' },
          { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
        ]"
        :items="filteredProductos"
        class="elevation-2"
        items-per-page-text="Filas por página"
        no-data-text="No se encontraron productos"
      >
        <template v-slot:item.id_producto="{ value }">
          <v-chip size="small">#{{ value }}</v-chip>
        </template>
        
        <template v-slot:item.nombre_producto="{ value }">
          <span class="font-weight-bold text-blue-darken-4">{{ value }}</span>
        </template>

        <template v-slot:item.stock_disponible="{ value }">
          <span class="font-weight-bold text-green-darken-1">{{ value }}</span>
        </template>

        <template v-slot:item.precio_venta="{ value }">
          <span class="text-green-darken-2">{{ formatCurrency(value) }}</span>
        </template>

        <template v-slot:item.categoria_producto="{ value }">
          <v-chip
            :color="value === 'ISSS' ? 'blue-darken-4' : 'orange-darken-4'"
            text-color="white"
            size="small"
          >
            {{ value }}
          </v-chip>
        </template>

        <template v-slot:item.fecha_ingreso="{ value }">
          {{ formatDate(value) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              :to="'/productos/edit/' + item.id_producto"
              icon="mdi-pencil"
              color="warning"
              variant="tonal"
              size="small"
              title="Editar"
            />
            <v-btn
              @click="confirmDelete(item)"
              icon="mdi-trash-can"
              color="error"
              variant="tonal"
              size="small"
              title="Eliminar"
            />
            <v-btn
              @click="openStockModal(item)"
              icon="mdi-package-variant"
              color="info"
              variant="tonal"
              size="small"
              title="Actualizar Stock"
            />
          </div>
        </template>
      </v-data-table>
    </v-col>
  </v-row>

  <!-- El modal no cambia -->
  <v-dialog v-model="isModalOpen" max-width="500">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span class="headline">Actualizar Stock</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="closeStockModal" />
      </v-card-title>
      
      <v-divider />

      <v-form @submit.prevent="handleStockUpdate">
        <v-card-text>
          <p>Producto: <strong>{{ selectedProduct?.nombre_producto }}</strong></p>
          <p>Stock actual: <strong>{{ selectedProduct?.stock_disponible }}</strong></p>
          
          <v-text-field
            v-model.number="stockToAdd"
            label="Cantidad a agregar"
            type="number"
            min="1"
            required
            variant="outlined"
            class="mt-4"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            type="submit"
            :loading="loadingModal"
            color="teal-darken-1"
            size="large"
            block
          >
            {{ loadingModal ? 'Actualizando...' : 'Actualizar' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// CAMBIO: Usamos 'api'
import api from '@/axios';

// --- ESTADO REACTIVO ---
const productos = ref([]);
const stats = ref({
  totalProductos: 0,
  totalStock: 0,
  nuevosMes: 0
});
const searchTerm = ref('');
const successMessage = ref('');
const route = useRoute();
const router = useRouter(); 
const isModalOpen = ref(false);
const selectedProduct = ref(null);
const stockToAdd = ref(1);
const loadingModal = ref(false);

// --- CICLO DE VIDA ---
onMounted(() => {
  fetchProductos();

  if (route.query.success) {
    successMessage.value = '¡Producto guardado exitosamente!';
  } else if (route.query.updated) {
    successMessage.value = '¡Producto actualizado exitosamente!';
  }
  
  if (successMessage.value) {
    router.replace({ query: {} }); 
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  }
});

// --- DATOS (API) ---
const fetchProductos = async () => {
  try {
    // CAMBIO: api.get ruta relativa
    const response = await api.get('/productos');
    
    productos.value = response.data.data; 
    stats.value = response.data.stats;

  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
};

// --- COMPUTADAS ---
const filteredProductos = computed(() => {
  if (!searchTerm.value) {
    return productos.value;
  }
  const lowerSearch = searchTerm.value.toLowerCase();
  return productos.value.filter(p => 
    p.nombre_producto.toLowerCase().includes(lowerSearch)
    || p.categoria_producto.toLowerCase().includes(lowerSearch)
  );
});

// --- MÉTODOS ---

// Eliminar Producto
const confirmDelete = async (producto) => {
  if (window.confirm(`¿Estás seguro de que quieres eliminar "${producto.nombre_producto}"?`)) {
    try {
      // CAMBIO: api.delete ruta relativa
      await api.delete(`/productos/${producto.id_producto}`);
      
      successMessage.value = 'Producto eliminado exitosamente.';
      fetchProductos(); 
      
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      window.alert('No se pudo eliminar el producto.');
    }
  }
};

// Lógica del Modal de Stock
const openStockModal = (producto) => {
  selectedProduct.value = producto;
  stockToAdd.value = 1;
  isModalOpen.value = true;
};

const closeStockModal = () => {
  isModalOpen.value = false;
  selectedProduct.value = null;
};

const handleStockUpdate = async () => {
  loadingModal.value = true;
  try {
    // CAMBIO: api.post ruta relativa
    const url = `/productos/${selectedProduct.value.id_producto}/actualizar-stock`;
    
    await api.post(url, { cantidad_nueva: stockToAdd.value });

    successMessage.value = 'Stock actualizado exitosamente.';
    closeStockModal();
    fetchProductos();

  } catch (error) {
    console.error('Error al actualizar stock:', error);
    window.alert('No se pudo actualizar el stock.');
  } finally {
    loadingModal.value = false;
  }
};

// --- HELPERS ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
</script>

<style scoped>
/* Tu CSS se mantiene intacto */
</style>