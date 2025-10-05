export interface DDoSEvent {
  id: string;
  eventId?: string;
  timestamp: string;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: string;
  attackType: string;
  duration?: number;
  bandwidth?: number;
  packetsPerSecond?: number;
  description?: string;
  tags?: string[];
  attributes?: EventAttribute[];
}

export interface EventAttribute {
  type: string;
  value: string;
  category: string;
  comment?: string;
}

export interface EventListProps {
  events: DDoSEvent[];
  onEventSelect: (event: DDoSEvent) => void;
  isLoading?: boolean;
}

export interface EventDetailProps {
  event: DDoSEvent;
  onClose: () => void;
}

export interface EventFormProps {
  onSubmit: (event: DDoSEvent) => void;
  initialValues?: Partial<DDoSEvent>;
  isLoading?: boolean;
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  sourceIp?: string;
  destinationIp?: string;
  attackType?: string;
  protocol?: string;
}

export interface PaginatedEvents {
  events: DDoSEvent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
