import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import registrationsApi from '../api/registrationsApi';
import adminApi from '../api/adminApi';
const ADMIN_KEYS = {
    DASHBOARD_STATS: 'dashboard-stats',
    REGISTRATIONS: 'registrations',
    SUB_ADMINS: 'sub-admins',
    ANALYTICS: 'analytics'
};

export const useAdmin = () => {
    const queryClient = useQueryClient();

    // Fetch dashboard stats
    const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
        queryKey: [ADMIN_KEYS.DASHBOARD_STATS],
        queryFn: async () => {
            const response = await adminApi.getDashboardStats();
            console.log("response", response);
            if (!response) throw new Error('Failed to fetch dashboard stats');
            return response;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Fetch registrations with filters
    const useRegistrations = (filters = {}) => {
        return useQuery({
            queryKey: [ADMIN_KEYS.REGISTRATIONS, filters],
            queryFn: async () => {
                const queryParams = new URLSearchParams(filters).toString();
                const response = await registrationsApi.getAllRegistrations(queryParams);
                console.log("response2", response);
                if (!response) throw new Error('Failed to fetch registrations');
                return response;
            },
            keepPreviousData: true,
        });
    };

    // Fetch analytics data
    const useAnalytics = () => {
        return useQuery({
            queryKey: [ADMIN_KEYS.ANALYTICS],
            queryFn: async () => {
                const response = await adminApi.getAnalytics();
                console.log("analytics", response);
                if (!response) throw new Error('Failed to fetch analytics data');
                return response
            },
            refetchInterval: 60000, // Refetch every minute
        });
    };

    // Fetch sub-admins list
    const useSubAdmins = () => {
        return useQuery({
            queryKey: [ADMIN_KEYS.SUB_ADMINS],
            queryFn: async () => {
                const response = await fetch('/api/admin/sub-admins');
                if (!response.ok) throw new Error('Failed to fetch sub-admins');
                return response.json();
            },
        });
    };

    // Create registration
    const createRegistrationMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('/api/admin/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create registration');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATIONS]);
            queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
            queryClient.invalidateQueries([ADMIN_KEYS.ANALYTICS]);
            toast.success('Registration created successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create registration');
        },
    });

    // Update registration
    const updateRegistrationMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(`/api/admin/registrations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update registration');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATIONS]);
            queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
            queryClient.invalidateQueries([ADMIN_KEYS.ANALYTICS]);
            toast.success('Registration updated successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update registration');
        },
    });

    // Delete registration
    const deleteRegistrationMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`/api/admin/registrations/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete registration');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATIONS]);
            queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
            queryClient.invalidateQueries([ADMIN_KEYS.ANALYTICS]);
            toast.success('Registration deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete registration');
        },
    });

    // Create sub-admin
    const createSubAdminMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('/api/admin/sub-admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create sub-admin');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries([ADMIN_KEYS.SUB_ADMINS]);
            queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
            toast.success('Sub-admin created successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create sub-admin');
        },
    });

    // Delete sub-admin
    const deleteSubAdminMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`/api/admin/sub-admins/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete sub-admin');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries([ADMIN_KEYS.SUB_ADMINS]);
            queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
            toast.success('Sub-admin deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete sub-admin');
        },
    });

    return {
        // Queries
        dashboardStats,
        isLoadingStats,
        useRegistrations,
        useAnalytics,
        useSubAdmins,

        // Mutations
        createRegistration: createRegistrationMutation.mutate,
        updateRegistration: updateRegistrationMutation.mutate,
        deleteRegistration: deleteRegistrationMutation.mutate,
        createSubAdmin: createSubAdminMutation.mutate,
        deleteSubAdmin: deleteSubAdminMutation.mutate,

        // Loading states
        isCreatingRegistration: createRegistrationMutation.isPending,
        isUpdatingRegistration: updateRegistrationMutation.isPending,
        isDeletingRegistration: deleteRegistrationMutation.isPending,
        isCreatingSubAdmin: createSubAdminMutation.isPending,
        isDeletingSubAdmin: deleteSubAdminMutation.isPending,
    };
}; 