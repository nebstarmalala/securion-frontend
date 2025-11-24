import { useState, useCallback } from 'react';
import axios, { AxiosProgressEvent } from 'axios';

interface UploadState {
  progress: number;
  isUploading: boolean;
  error: string | null;
  uploadedFile: any | null;
}

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    isUploading: false,
    error: null,
    uploadedFile: null,
  });

  const upload = useCallback(
    async (
      url: string,
      file: File,
      additionalData?: Record<string, any>,
      token?: string
    ) => {
      setUploadState({
        progress: 0,
        isUploading: true,
        error: null,
        uploadedFile: null,
      });

      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      try {
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percentCompleted = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadState((prev) => ({ ...prev, progress: percentCompleted }));
          },
        });

        setUploadState({
          progress: 100,
          isUploading: false,
          error: null,
          uploadedFile: response.data,
        });

        return response.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Upload failed';
        setUploadState({
          progress: 0,
          isUploading: false,
          error: errorMessage,
          uploadedFile: null,
        });
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setUploadState({
      progress: 0,
      isUploading: false,
      error: null,
      uploadedFile: null,
    });
  }, []);

  return {
    ...uploadState,
    upload,
    reset,
  };
}
