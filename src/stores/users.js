import { defineStore } from 'pinia'
import apiClient from '@/stores/laravelapi' 

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
  }),
  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await apiClient.get('/users') // Hacemos la petición a '/api/users'
        this.users = response.data
      } catch (error) {
        console.error('Error al obtener los usuarios:', error)
      } finally {
        this.loading = false
      }
    },
  },
})