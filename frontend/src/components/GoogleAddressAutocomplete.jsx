import { useEffect, useRef } from 'react';

// Singleton para carregar o script do Google Maps Places apenas uma vez
let googleMapsPromise = null;

const loadGoogleMapsScript = (apiKey) => {
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API Key not provided'));
  }
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      // Registrar listener para falhas de autenticação do Google Maps
      window.gm_authFailure = () => {
        console.error(
          '❌ [Google Maps Auth Error] A chave de API foi recusada pelo Google. ' +
          'Verifique se a "Maps JavaScript API" e a "Places API" estão ativadas no Google Cloud e se as restrições de referenciador HTTP incluem a URL atual (ex: http://localhost:5173/*, http://localhost:5174/*).'
        );
      };

      const existingScript = document.getElementById('google-maps-places-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google));
        existingScript.addEventListener('error', (e) => {
          googleMapsPromise = null;
          reject(e);
        });
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-places-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = (e) => {
        googleMapsPromise = null; // permite retentar se o usuário corrigir as configurações
        reject(e);
      };
      document.head.appendChild(script);
    });
  }
  return googleMapsPromise;
};

export default function GoogleAddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = 'Endereço',
  className = 'glass-input',
  disabled = false,
  readOnly = false,
  onKeyDown,
  autoFocus = false,
  ...props
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ [GoogleAddressAutocomplete] VITE_GOOGLE_MAPS_API_KEY não definida no arquivo .env.');
      } else {
        console.warn('⚠️ [GoogleAddressAutocomplete] VITE_GOOGLE_MAPS_API_KEY não configurada nas Environment Variables do Render.');
      }
      return;
    }
    if (!inputRef.current || readOnly || disabled) return;

    let isMounted = true;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!isMounted || !inputRef.current || autocompleteRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'br' },
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (onPlaceSelected && place) {
            onPlaceSelected(place);
          }
        });

        autocompleteRef.current = autocomplete;
      })
      .catch((err) => {
        console.warn('Google Maps Places Autocomplete não carregou:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, readOnly, disabled, onPlaceSelected]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      readOnly={readOnly}
      autoFocus={autoFocus}
      autoComplete="off"
      {...props}
    />
  );
}
