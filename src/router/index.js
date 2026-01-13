import { createRouter, createWebHistory } from 'vue-router'

// 1. IMPORTACIONES
import Login from '../views/Login.vue'
import Inicio from '../views/Inicio.vue'
import MainLayout from '../layouts/MainLayout.vue'
import NotFound from '../views/NotFound.vue' 

// Ventas
import IndexVentas from '../views/Ventas/IndexVentas.vue'
import VentasCreate from '@/views/Ventas/VentasCreate.vue'
// Agregamos /Cuadre/ a la ruta porque está dentro de esa carpeta
import CuadreDiario from '../views/Cuadre/CuadreDiario.vue'

// Productos y Material
import IndexProductos from '@/views/Productos/IndexProductos.vue'
import ProductosCreate from '@/views/Productos/ProductosCreate.vue'
import ProductosEdit from '@/views/Productos/ProductosEdit.vue'
import MaterialPesado from '@/views/Productos/MaterialPesado.vue'

// Empleados
import IndexEmpleados from '@/views/Empleados/IndexEmpleados.vue'
import EmpleadosCreate from '@/views/Empleados/EmpleadosCreate.vue'
import EmpleadosEdit from '@/views/Empleados/EmpleadosEdit.vue'
import AsistenciaView from '../views/Empleados/AsistenciaView.vue'

// Comisiones y Entregas
import IndexComisiones from '@/views/Comisiones/IndexComisiones.vue'
import ComisionesDetalle from '@/views/Comisiones/ComisionesDetalle.vue'
import CalculadoraEntregas from '@/views/entregas/CalculadoraEntregas.vue'

// Otros
import Reportes from '@/views/ReporteDeVentas/Reportes.vue'
import CitasCalendario from '../views/Citas/CitasCalendario.vue'

const routes = [
  // RUTA LOGIN (Pública)
  {
    path: '/login',
    name: 'login',
    component: Login
  },

  // RUTA COMODÍN (Cualquier ruta rara va a NotFound)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  },

  // RUTAS DEL SISTEMA
  {
    path: '/',
    component: MainLayout,
    redirect: '/inicio',
    children: [
      {
        path: '/inicio',
        name: 'inicio',
        component: Inicio,
        meta: { roles: ['administrador', 'contador'] } 
      },

      // --- VENTAS ---
      {
        path: '/ventas',
        name: 'ventas',
        component: IndexVentas,
        meta: { roles: ['administrador', 'contador'] } 
      },
      {
        path: '/ventas/create',
        name: 'Createventas',
        component: VentasCreate,
        meta: { roles: ['administrador'] } 
      },
      {
        path: '/reporte-ventas',
        name: 'ReporteDeVentas',
        component: Reportes,
        meta: { roles: ['administrador', 'contador'] } 
      },
      // 🚨 NUEVA RUTA: Aquí es donde fallaba antes
      {
        path: '/cuadre-diario',
        name: 'CuadreDiario',
        component: CuadreDiario,
        meta: { roles: ['administrador'] } // Solo Admin entra aquí
      },

      // --- PRODUCTOS (SOLO ADMIN) ---
      {
        path: 'productos',
        name: 'productos',
        component: IndexProductos,
        meta: { roles: ['administrador'] }
      },
      {
        path: '/productos/create',
        name: 'Createproductos',
        component: ProductosCreate,
        meta: { roles: ['administrador'] }
      },
      {
        path: '/material-pesado',
        name: 'MaterialPesado',
        component: MaterialPesado,
        meta: { roles: ['administrador'] }
      },
      {
        path: '/productos/edit/:id',
        name: 'Editproductos',
        component: ProductosEdit,
        meta: { roles: ['administrador'] }
      },

      // --- EMPLEADOS (SOLO ADMIN) ---
      {
        path: '/empleados',
        name: 'empleados',
        component: IndexEmpleados,
        meta: { roles: ['administrador'] }
      },
      {
        path: '/empleados/create',
        name: 'Createempleados',
        component: EmpleadosCreate,
        meta: { roles: ['administrador'] }
      },
      {
        path: '/empleados/edit/:id',
        name: 'Editempleados',
        component: EmpleadosEdit,
        meta: { roles: ['administrador'] }
      },
      {
        path: '/asistencia',
        name: 'asistencia',
        component: AsistenciaView,
        meta: { roles: ['administrador'] } 
      },

      // --- COMISIONES Y ENTREGAS (AMBOS) ---
      {
        path: '/comisiones',
        name: 'Comisiones',
        component: IndexComisiones,
        meta: { roles: ['administrador', 'contador'] }
      },
      {
        path: '/comisiones/detalle/:id',
        name: 'ComisionesDetalle',
        component: ComisionesDetalle,
        meta: { roles: ['administrador', 'contador'] }
      },
      {
        path: '/entregas',
        name: 'Entregas',
        component: CalculadoraEntregas,
        meta: { roles: ['administrador', 'contador'] }
      },

      // --- CITAS (SOLO ADMIN) ---
      {
        path: '/citas',
        name: 'Citas',
        component: CitasCalendario,
        meta: { roles: ['administrador'] } 
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// --- GUARDIÁN DE SEGURIDAD ---
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('auth_token');
  const userRole = localStorage.getItem('user_role'); 

  // 1. Si no estás logueado y la ruta es privada -> LOGIN
  if (authRequired && !loggedIn) {
    return next('/login');
  }

  // 2. Si ya estás logueado y quieres ir al login -> INICIO
  if (to.path === '/login' && loggedIn) {
    return next('/inicio');
  }

  // 3. VERIFICACIÓN DE ROLES
  if (to.meta.roles) {
    // Normalizamos el rol a minúsculas para evitar errores
    const rolActual = userRole ? userRole.toLowerCase() : '';

    if (!to.meta.roles.includes(rolActual)) {
      // Si el rol no coincide, lo mandamos al NotFound o Inicio
      return next({ name: 'NotFound' });
    }
  }

  // Si pasa todas las pruebas, adelante
  next();
});

export default router