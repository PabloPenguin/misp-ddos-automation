import { describe, it, expect } from 'vitest';
import { validateFile, isValidIP, isValidPort, sanitizeInput } from '../../services/validation';

describe('Validation Service', () => {
  describe('validateFile', () => {
    it('should validate CSV file', () => {
      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should validate JSON file', () => {
      const file = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject file that is too large', () => {
      // Create a mock file with large size without actually allocating memory
      const file = new File([], 'large.csv', { type: 'text/csv' });
      Object.defineProperty(file, 'size', { value: 101 * 1024 * 1024 });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });

  describe('isValidIP', () => {
    it('should validate correct IP addresses', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('10.0.0.1')).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
      expect(isValidIP('0.0.0.0')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(isValidIP('256.1.1.1')).toBe(false);
      expect(isValidIP('192.168.1')).toBe(false);
      expect(isValidIP('192.168.1.1.1')).toBe(false);
      expect(isValidIP('abc.def.ghi.jkl')).toBe(false);
    });
  });

  describe('isValidPort', () => {
    it('should validate correct port numbers', () => {
      expect(isValidPort(80)).toBe(true);
      expect(isValidPort(443)).toBe(true);
      expect(isValidPort(0)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
    });

    it('should reject invalid port numbers', () => {
      expect(isValidPort(-1)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(1.5)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
      expect(sanitizeInput('\ntest\n')).toBe('test');
    });

    it('should handle normal text', () => {
      expect(sanitizeInput('normal text')).toBe('normal text');
    });
  });
});
