<template>
  <v-container class="fill-height align-center justify-center text-center" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-icon size="100" color="red-darken-2">mdi-alert-circle-outline</v-icon>
        <h1 class="text-h2 font-weight-bold text-red-darken-2 mt-4">404</h1>
        <h2 class="text-h5 font-weight-medium text-grey-darken-3 mt-2">
          Página No Encontrada / Acceso Restringido
        </h2>
        <p class="text-subtitle-1 text-grey-darken-1 mt-4">
          La URL que ingresaste no existe, o no tienes los permisos necesarios para ver esta sección.
        </p>
        <v-btn 
          color="blue-darken-4" 
          class="mt-6" 
          to="/" 
          prepend-icon="mdi-home"
        >
          Ir al Inicio
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// No necesita lógica adicional
</script>