import * as yup from 'yup';

// File validation constants
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ACCEPTED_FILE_TYPES = {
  csv: ['text/csv', 'application/csv'],
  json: ['application/json', 'text/json'],
};

// File validation schema
export const fileValidationSchema = yup.object({
  file: yup
    .mixed()
    .required('File is required')
    .test('fileSize', 'File is too large (max 100MB)', (value) => {
      if (!value || !(value instanceof File)) return false;
      return value.size <= MAX_FILE_SIZE;
    })
    .test('fileType', 'Invalid file type', (value) => {
      if (!value || !(value instanceof File)) return false;
      const acceptedTypes = [...ACCEPTED_FILE_TYPES.csv, ...ACCEPTED_FILE_TYPES.json];
      return acceptedTypes.includes(value.type);
    }),
});

// Login validation schema
export const loginSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Event validation schema
export const eventSchema = yup.object({
  timestamp: yup
    .string()
    .required('Timestamp is required')
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid timestamp format'),
  sourceIp: yup
    .string()
    .required('Source IP is required')
    .matches(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Invalid IP address'
    ),
  sourcePort: yup
    .number()
    .required('Source port is required')
    .min(0, 'Port must be between 0 and 65535')
    .max(65535, 'Port must be between 0 and 65535')
    .integer('Port must be an integer'),
  destinationIp: yup
    .string()
    .required('Destination IP is required')
    .matches(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Invalid IP address'
    ),
  destinationPort: yup
    .number()
    .required('Destination port is required')
    .min(0, 'Port must be between 0 and 65535')
    .max(65535, 'Port must be between 0 and 65535')
    .integer('Port must be an integer'),
  protocol: yup
    .string()
    .required('Protocol is required')
    .oneOf(['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'], 'Invalid protocol'),
  attackType: yup
    .string()
    .required('Attack type is required')
    .oneOf(
      ['SYN Flood', 'UDP Flood', 'ICMP Flood', 'HTTP Flood', 'DNS Amplification', 'NTP Amplification'],
      'Invalid attack type'
    ),
  duration: yup.number().min(0, 'Duration must be positive').optional(),
  bandwidth: yup.number().min(0, 'Bandwidth must be positive').optional(),
  packetsPerSecond: yup.number().min(0, 'Packets per second must be positive').optional(),
  description: yup.string().max(500, 'Description must not exceed 500 characters').optional(),
});

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  const acceptedTypes = [...ACCEPTED_FILE_TYPES.csv, ...ACCEPTED_FILE_TYPES.json];
  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only CSV and JSON files are accepted',
    };
  }

  return { valid: true };
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

// Validate IP address
export function isValidIP(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

// Validate port number
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 0 && port <= 65535;
}
