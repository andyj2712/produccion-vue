<template>
  <main class="main-content">
    <div class="header">
      <h1><i class="fas fa-chart-bar"></i> Reportes de Ventas</h1>
    </div>

    <div class="form-container">
      
      <div class="filtros-section">
        <h2>Filtrar Reporte</h2>
        <div class="filtros-grid">
          <div class="form-group">
            <label for="anio">Año</label>
            <select id="anio" v-model="filtroAnio" class="form-control" required>
              <option value="">Seleccione el año</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="mes">Mes (Opcional)</label>
            <select id="mes" v-model="filtroMes" class="form-control">
              <option value="">Todos los meses</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
        </div>
        <div class="filtros-actions">
          <button 
            type="button" 
            @click="buscarReporte" 
            class="btn-submit" 
            :disabled="!filtroAnio"
          >
            <i class="fas fa-search"></i> Buscar
          </button>
          <button 
            type="button" 
            @click="exportarReporte('mes')" 
            class="btn-export" 
            :disabled="!filtroMes || ventas.length === 0"
          >
            <i class="fas fa-file-excel"></i> Exportar Mes
          </button>
          <button 
            type="button" 
            @click="exportarReporte('anio')" 
            class="btn-export" 
            :disabled="!filtroAnio || ventas.length === 0"
          >
            <i class="fas fa-file-excel"></i> Exportar Año
          </button>
        </div>
      </div>

      <div class="resultados-section" v-if="hasSearched">
        <h2>Resultados</h2>
        
        <div id="loading" v-if="isLoading">
          <p><i class="fas fa-spinner fa-spin"></i> Cargando datos...</p>
        </div>

        <div id="sin-resultados" v-if="!isLoading && ventas.length === 0">
          <p>No se encontraron ventas para los criterios seleccionados.</p>
        </div>

        <div class="table-container" v-if="!isLoading && ventas.length > 0">
          <table class="ventas-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Empleado</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="venta in ventas" :key="venta.id_venta">
                <td>{{ venta.fecha_venta }}</td>
                <td>{{ venta.nombre_cliente }}</td>
                <td>{{ venta.nombre_empleado || 'N/A' }}</td>
                <td>{{ formatCurrency(venta.monto_total) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL:</td>
                <td style="font-weight: bold;">{{ formatCurrency(totalVentas) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
// 1. CAMBIO: Importamos 'api' para conectar a Railway automáticamente
import api from '@/axios';

const filtroAnio = ref('');
const filtroMes = ref('');
const ventas = ref([]);
const isLoading = ref(false);
const hasSearched = ref(false); 

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 2020; i--) {
    years.push(i);
  }
  return years;
});

const totalVentas = computed(() => {
  return ventas.value.reduce((sum, venta) => sum + parseFloat(venta.monto_total), 0);
});

const buscarReporte = async () => {
  if (!filtroAnio.value) {
    alert('Por favor seleccione un año');
    return;
  }

  isLoading.value = true;
  hasSearched.value = true;
  ventas.value = []; 

  try {
    // 2. CAMBIO: api.post con ruta relativa. El token va automático.
    const response = await api.post('/reportes/generar', {
      anio: filtroAnio.value,
      mes: filtroMes.value || null, 
    });
    
    if (response.data.ventas) {
      ventas.value = response.data.ventas;
    }

  } catch (error) {
    console.error('Error al generar el reporte:', error);
    alert('Error al cargar los datos. Revisa la consola.');
  } finally {
    isLoading.value = false;
  }
};

const exportarReporte = async (tipo) => {
  if (tipo === 'mes' && !filtroMes.value) {
    alert('Para exportar por mes, debe seleccionar un mes específico');
    return;
  }
  
  try {
    // 3. CAMBIO: api.post con responseType blob para descargar archivos
    const response = await api.post('/reportes/exportar', 
      {
        anio: filtroAnio.value,
        mes: filtroMes.value || null,
        tipo_reporte: tipo, 
      }, 
      {
        responseType: 'blob' 
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Intentamos sacar el nombre del archivo del header
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `reporte_ventas_${filtroAnio.value}.csv`; 
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error al exportar el reporte:', error);
    alert('Error al exportar los datos. Revisa la consola.');
  }
};

const formatCurrency = (value) => {
  // Ajustado a ES-SV y USD como en el resto de tu app
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
</script>

<style scoped>
/* Agregué 'scoped' para que estos estilos no afecten otras páginas */
.filtros-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filtros-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.filtros-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-export {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
  min-width: 120px;
}

.btn-export:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.ventas-table tfoot {
  background: #f8f9fa;
  font-weight: bold;
}

.ventas-table tfoot td {
  border-top: 2px solid #007bff;
}


.main-content {
  padding: 20px;
}
.header {
  margin-bottom: 20px;
}
.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-submit {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-submit:disabled {
    background: #6c757d;
    cursor: not-allowed;
}
.table-container {
  overflow-x: auto;
}
.ventas-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.ventas-table th,
.ventas-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.ventas-table th {
  background-color: #f2f2f2;
}
</style>