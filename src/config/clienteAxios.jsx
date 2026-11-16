import axios from "axios";

const clienteAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Interceptor para inyectar token de autenticación en cada petición
clienteAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para detectar token no válido, expirado o manipulado y redirigir al login
clienteAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.msg || error.response.data?.message || "";

      const esTokenInvalido =
        status === 401 ||
        status === 403 ||
        msg.toLowerCase().includes("token no válido") ||
        msg.toLowerCase().includes("token invalido") ||
        msg.toLowerCase().includes("expirado") ||
        msg.toLowerCase().includes("no hay token");

      if (esTokenInvalido) {
        localStorage.removeItem("token");
        localStorage.removeItem("empresa_id");
        localStorage.removeItem("usuario_local_id");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default clienteAxios;

