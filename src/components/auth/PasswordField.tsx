import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { t1dInput, t1dSoftLabel, type T1DTheme } from '../../lib/t1d-ui';

interface PasswordFieldProps {
  theme: T1DTheme;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showLabel: string;
  hideLabel: string;
  rtl?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  theme,
  id,
  label,
  value,
  onChange,
  placeholder,
  showLabel,
  hideLabel,
  rtl = false,
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={t1dSoftLabel(theme)}>
        {label}
      </label>
      <div className={`t1d-password-field ${rtl ? 't1d-password-field--rtl' : ''}`}>
        <input
          id={id}
          className={`${t1dInput(theme)} t1d-password-input ${rtl ? 'text-right' : 'text-left'}`}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={id.includes('signup') ? 'new-password' : 'current-password'}
        />
        <button
          type="button"
          className="t1d-password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};
