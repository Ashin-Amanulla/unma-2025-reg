import { create } from 'zustand';
import { adminApi } from '../api';
import { toast } from 'react-toastify';

/**
 * Admin UI Store
 * Manages UI state for the admin dashboard
 */
const useAdminStore = create((set) => ({
    // Sidebar state
    sidebarOpen: false,

    // Filter/search state for registrations
    registrationsFilters: {
        searchTerm: '',
        school: 'All',
        paymentStatus: 'All',
        page: 1,
        limit: 10
    },

    // Selected registration for editing/viewing
    selectedRegistration: null,

    // Modal states
    modalState: {
        deleteConfirm: false,
        editForm: false
    },

    // Actions
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

    updateRegistrationsFilters: (filters) => set((state) => ({
        registrationsFilters: {
            ...state.registrationsFilters,
            ...filters
        }
    })),

    resetRegistrationsFilters: () => set({
        registrationsFilters: {
            searchTerm: '',
            school: 'All',
            paymentStatus: 'All',
            page: 1,
            limit: 10
        }
    }),

    setSelectedRegistration: (registration) => set({ selectedRegistration: registration }),

    clearSelectedRegistration: () => set({ selectedRegistration: null }),

    toggleModal: (modalName, isOpen) => set((state) => ({
        modalState: {
            ...state.modalState,
            [modalName]: isOpen !== undefined ? isOpen : !state.modalState[modalName]
        }
    })),

    closeAllModals: () => set({
        modalState: {
            deleteConfirm: false,
            editForm: false
        }
    })
}));

export default useAdminStore; 