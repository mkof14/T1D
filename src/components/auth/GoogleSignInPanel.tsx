import React, { useEffect, useRef, useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleSignInPanelProps {
  clientId: string;
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: () => void;
}

export const GoogleSignInPanel: React.FC<GoogleSignInPanelProps> = ({
  clientId,
  disabled = false,
  onCredential,
  onError,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(360);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;

    const updateWidth = () => {
      const next = Math.max(280, Math.min(420, Math.floor(node.clientWidth)));
      setButtonWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!clientId || disabled) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div ref={wrapRef} className="t1d-google-login-wrap">
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) onCredential(response.credential);
            else onError();
          }}
          onError={onError}
          useOneTap={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width={buttonWidth}
        />
      </div>
    </GoogleOAuthProvider>
  );
};
