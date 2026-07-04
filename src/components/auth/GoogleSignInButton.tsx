import React from 'react';

interface GoogleSignInButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label, disabled = false, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="t1d-google-btn disabled:cursor-not-allowed disabled:opacity-55"
  >
    <span className="t1d-google-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" role="img">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.2-.98 2.2-2.08 2.88l3.36 2.6C20.66 18.1 22 15.72 22 12c0-.68-.06-1.34-.18-1.98H12z" />
        <path fill="#34A853" d="M6.5 14.32l-.9.69-2.62 2.04C4.72 20.58 8.08 22 12 22c3.24 0 5.96-1.07 7.94-2.92l-3.36-2.6c-.92.62-2.1.98-3.38.98-2.6 0-4.8-1.75-5.58-4.12z" />
        <path fill="#4A90E2" d="M2.18 7.32C1.43 8.86 1 10.6 1 12s.43 3.14 1.18 4.68C1.18 16.68 1 16.34 1 16v-.34c0-2.86 1.02-5.48 2.72-7.52z" />
        <path fill="#FBBC05" d="M12 4.98c1.76 0 3.34.6 4.58 1.78l3.43-3.43C17.94 1.34 15.22 0 12 0 8.08 0 4.72 1.42 2.18 3.82l3.32 2.58C6.2 4.73 8.4 4.98 12 4.98z" />
      </svg>
    </span>
    <span>{label}</span>
  </button>
);
