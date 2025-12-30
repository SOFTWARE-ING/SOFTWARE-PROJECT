import React, { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * File uploader component with drag & drop
 * @param {Object} props
 * @param {function} props.onFileSelect - Callback when file is selected
 * @param {boolean} [props.loading=false] - Whether upload is in progress
 */
export const FileUploader = ({ onFileSelect, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <Card className="text-center">
      <CardContent className="py-12">
        <div
          className={`border-2 border-dashed rounded-2xl p-8 transition-colors ${
            dragActive
              ? 'border-accent-primary bg-accent-primary/10'
              : 'border-primary hover:border-accent-primary'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center">
                <FileText size={32} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-primary">{selectedFile.name}</p>
                <p className="text-muted">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input').click()}
                disabled={loading}
              >
                Choose Different File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-tertiary rounded-full flex items-center justify-center">
                <Upload size={32} className="text-muted" />
              </div>
              <div>
                <p className="text-lg font-medium text-primary">
                  Drop your PDF here, or{' '}
                  <button
                    className="text-accent-primary hover:text-accent-hover font-medium"
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-muted mt-1">Supports PDF files up to 10MB</p>
              </div>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {loading && (
          <div className="mt-6">
            <div className="w-full bg-tertiary rounded-full h-2">
              <div className="bg-accent-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-muted mt-2">Processing your PDF...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};