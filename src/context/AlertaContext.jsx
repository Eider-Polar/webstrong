import React, { createContext, useState, useCallback } from 'react';

export const AlertaContext = createContext();

export const AlertaProvider = ({ children }) => {
  const [alerta, setAlerta] = useState({ msg: '', error: false, visible: false });

  const mostrarAlerta = useCallback((msg, error = false, duration = 3500) => {
    setAlerta({ msg, error, visible: true });
    setTimeout(() => {
      setAlerta({ msg: '', error: false, visible: false });
    }, duration);
  }, []);

  const ocultarAlerta = useCallback(() => {
    setAlerta({ msg: '', error: false, visible: false });
  }, []);

  return (
    <AlertaContext.Provider value={{ alerta, mostrarAlerta, ocultarAlerta }}>
      {children}
    </AlertaContext.Provider>
  );
};
