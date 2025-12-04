import React, { useState, useRef, useEffect } from "react";

interface EditableFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isTextarea?: boolean;
  fontSize?: string;
  fontWeight?: string | number;
}

export const EditableField: React.FC<EditableFieldProps> = ({ value, onChange, placeholder, isTextarea, fontSize = '14px', fontWeight = 'normal' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => setIsEditing(false);

  if (isEditing) {
    return isTextarea ? (
      <textarea
        ref={inputRef as any}
        className="modal-textarea-edit"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{ fontSize, fontWeight }}
      />
    ) : (
      <input
        ref={inputRef as any}
        className="modal-input-edit"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{ fontSize, fontWeight }}
      />
    );
  }

  return (
    <div 
      className="editable-container" 
      onClick={() => setIsEditing(true)}
      style={{ fontSize, fontWeight, minHeight: isTextarea ? '60px' : 'auto' }}
    >
      {value || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{placeholder || "Нажмите, чтобы добавить..."}</span>}
    </div>
  );
};