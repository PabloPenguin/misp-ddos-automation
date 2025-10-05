import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '../../components/upload/FileUpload';

describe('FileUpload Component', () => {
  it('should render the dropzone', () => {
    const mockUploadStart = vi.fn();
    const mockUploadComplete = vi.fn();

    render(
      <FileUpload
        onUploadStart={mockUploadStart}
        onUploadComplete={mockUploadComplete}
        acceptedTypes={['.csv', '.json']}
        maxFileSize={100 * 1024 * 1024}
      />
    );

    expect(screen.getByText(/Drag & drop a file here/i)).toBeInTheDocument();
  });

  it('should display file information when file is selected', async () => {
    const user = userEvent.setup();
    const mockUploadStart = vi.fn();
    const mockUploadComplete = vi.fn();

    render(
      <FileUpload
        onUploadStart={mockUploadStart}
        onUploadComplete={mockUploadComplete}
        acceptedTypes={['.csv', '.json']}
        maxFileSize={100 * 1024 * 1024}
      />
    );

    const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-dropzone').querySelector('input') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });

  it('should accept valid CSV file', async () => {
    const user = userEvent.setup();
    const mockUploadStart = vi.fn();
    const mockUploadComplete = vi.fn();

    render(
      <FileUpload
        onUploadStart={mockUploadStart}
        onUploadComplete={mockUploadComplete}
        acceptedTypes={['.csv', '.json']}
        maxFileSize={100 * 1024 * 1024}
      />
    );

    const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-dropzone').querySelector('input') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      // File should be accepted and shown
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });
});
