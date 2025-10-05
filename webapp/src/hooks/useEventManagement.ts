import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { DDoSEvent, EventFilters } from '../types/events';

export const useEvents = (filters?: EventFilters, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['events', filters, page, pageSize],
    queryFn: () => apiClient.getEvents(filters, page, pageSize),
  });
};

export const useEvent = (eventId: string | null) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => {
      if (!eventId) throw new Error('Event ID is required');
      return apiClient.getEvent(eventId);
    },
    enabled: !!eventId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: Omit<DDoSEvent, 'id'>) => apiClient.createEvent(event),
    onSuccess: () => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => apiClient.deleteEvent(eventId),
    onSuccess: () => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useMispStatus = () => {
  return useQuery({
    queryKey: ['mispStatus'],
    queryFn: () => apiClient.getMispStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
