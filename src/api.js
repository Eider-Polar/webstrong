import clienteAxios from "./config/clienteAxios";

function getAuthDetails() {
  const token = localStorage.getItem("token");
  let isSuperAdmin = false;
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));
        const role = payload.tipo_usuario || payload.role || payload.rol;
        if (role === "superadmin" || role === "admin" || role === "dueño") {
          isSuperAdmin = true;
        }
      }
    } catch (e) {
      console.error("Error decoding token in api.js:", e);
    }
  }
  return { token, isSuperAdmin };
}

// Maneja la suscripción a notificaciones WebPush retornando estados sin alerts nativos
export async function suscribirseAlPush() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    return {
      success: false,
      code: 'UNSUPPORTED',
      msg: 'Este navegador no soporta notificaciones Push en el escritorio.'
    };
  }
  const { token } = getAuthDetails();
  if (!token) {
    return {
      success: false,
      code: 'NO_TOKEN',
      msg: 'Debes iniciar sesión para activar las notificaciones de la tienda.'
    };
  }
  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      return {
        success: false,
        code: 'PERMISSION_DENIED',
        msg: 'Permisos bloqueados en el navegador. Haz clic en el ícono de candado en tu barra de direcciones para permitir notificaciones.'
      };
    }

    await navigator.serviceWorker.register('/service-worker.js');
    const readyServiceWorker = await navigator.serviceWorker.ready;
    
    const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY || 'BHO0g-GeEpxSdQOmScSstctPideC7I7YnwpfuvYsF_D3kxSudfcNvUudiR_v8mQXNRdydvQZIrZqb7m7lrNvLZI';

    const subscription = await readyServiceWorker.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicVapidKey,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    await clienteAxios.post("/push-subscriptions/subscribe", { subscription }, config);
    return {
      success: true,
      msg: '¡Notificaciones Push activadas exitosamente en tu equipo!'
    };
  } catch (error) {
    console.error('Error al suscribirse a notificaciones WebPush:', error);
    return {
      success: false,
      code: 'PERMISSION_DENIED',
      msg: 'No se pudo registrar la notificaciones en tu navegador. Revisa los permisos de notificaciones del sistema o navegador.'
    };
  }
}

export async function enviarNotificacion(title, message) {
  const { token } = getAuthDetails();
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return await clienteAxios.post("/push-subscriptions/send", { titulo: title, mensaje: message }, config);
}
