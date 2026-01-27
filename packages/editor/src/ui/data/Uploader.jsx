/**
 * Uploader Component
 */
import React, { useRef, useState } from 'react';
import './Uploader.css';

export function Uploader({
  action,
  accept,
  multiple = false,
  disabled = false,
  draggable = false,
  autoUpload = true,
  listType = 'text',
  fileList = [],
  className = '',
  children,
  onChange,
  onUpload,
  onRemove,
  onError,
  onSuccess,
  style,
  ...props
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = async e => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFileList = files.map((file, index) => ({
      fileKey: `${Date.now()}-${index}`,
      name: file.name,
      blobFile: file,
      status: 'inited',
    }));

    onChange?.([...fileList, ...newFileList]);

    if (autoUpload && action) {
      for (const fileItem of newFileList) {
        try {
          fileItem.status = 'uploading';
          onChange?.([...fileList, ...newFileList]);

          const formData = new FormData();
          formData.append('file', fileItem.blobFile);

          const response = await fetch(action, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            fileItem.status = 'finished';
            onSuccess?.(await response.json(), fileItem);
          } else {
            fileItem.status = 'error';
            onError?.(new Error('Upload failed'), fileItem);
          }
        } catch (error) {
          fileItem.status = 'error';
          onError?.(error, fileItem);
        }
        onChange?.([...fileList, ...newFileList]);
      }
    }

    // Clear input
    e.target.value = '';
  };

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && draggable) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const event = { target: { files } };
    handleChange(event);
  };

  const handleRemove = fileItem => {
    const newList = fileList.filter(f => f.fileKey !== fileItem.fileKey);
    onChange?.(newList);
    onRemove?.(fileItem);
  };

  const classes = [
    'px-uploader',
    draggable && 'px-uploader-draggable',
    isDragging && 'px-uploader-dragging',
    disabled && 'px-uploader-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} {...props}>
      <div
        className="px-uploader-trigger"
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children || (
          <div className="px-uploader-default">
            <span className="px-uploader-icon">📁</span>
            <span className="px-uploader-text">
              {draggable ? 'Drop files here or click to upload' : 'Click to upload'}
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="px-uploader-input"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
      />

      {listType !== 'picture-text' && fileList.length > 0 && (
        <ul className="px-uploader-list">
          {fileList.map(file => (
            <li key={file.fileKey} className={`px-uploader-item px-uploader-item-${file.status}`}>
              <span className="px-uploader-item-name">{file.name}</span>
              {file.status === 'uploading' && <span className="px-uploader-item-progress" />}
              <button
                type="button"
                className="px-uploader-item-remove"
                onClick={() => handleRemove(file)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
