import { useEffect } from 'react';

export default function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#66766F', fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>
      Redirecionando...
    </div>
  );
}
