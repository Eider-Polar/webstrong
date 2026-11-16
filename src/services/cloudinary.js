import clienteAxios from '../config/clienteAxios';

/**
 * Convierte un File o Blob o URI local en un Data URI base64.
 */
async function uriToDataUri(input) {
  if (!input) return '';
  if (typeof input === 'string') {
    if (input.startsWith('data:') || input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }
  }
  try {
    if (input instanceof Blob || input instanceof File) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(input);
      });
    }

    const response = await fetch(input);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Fallback al convertir imagen a base64:', e.message);
    return input;
  }
}

/**
 * Sube una imagen a través del backend hacia Cloudinary.
 *
 * @param {string|File|Blob} imageInput - Archivo o Data URI
 * @param {string} folder - Carpeta de destino ('clients', 'ecommerce', 'exercises', 'general')
 * @returns {Promise<string>} - URL de Cloudinary
 */
export async function uploadImageToCloudinary(imageInput, folder = 'general') {
  if (!imageInput) return '';

  let dataUri = '';
  if (typeof imageInput === 'object' && imageInput?.base64) {
    dataUri = 'data:image/jpeg;base64,' + imageInput.base64;
  } else {
    dataUri = await uriToDataUri(imageInput);
  }

  if (!dataUri) return '';

  try {
    const { data: response } = await clienteAxios.post('/upload', {
      image: dataUri,
      folder
    });

    const url = response?.data?.url || response?.url;
    if (url && (url.startsWith('http://') || url.startsWith('https://')) && !url.startsWith('data:')) {
      return url;
    }

    throw new Error(response?.message || 'No se recibió un enlace válido de Cloudinary.');
  } catch (error) {
    const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error.message || 'Error al subir la imagen';
    console.error('Error al subir imagen a Cloudinary vía backend:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Sube y actualiza directamente la foto de perfil del usuario/cliente logueado.
 */
export async function uploadUserProfileAvatar(imageInput) {
  let dataUri = '';
  if (typeof imageInput === 'object' && imageInput?.base64) {
    dataUri = 'data:image/jpeg;base64,' + imageInput.base64;
  } else {
    dataUri = await uriToDataUri(imageInput);
  }

  try {
    const { data: response } = await clienteAxios.post('/upload/avatar', {
      image: dataUri
    });

    const avatarUrl = response?.data?.avatar_url || response?.avatar_url;
    if (avatarUrl && !avatarUrl.startsWith('data:')) {
      return response.data || response;
    }

    throw new Error(response?.message || 'Error al obtener el enlace del avatar.');
  } catch (error) {
    const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error.message || 'Error al subir el avatar';
    console.error('Error al actualizar avatar en backend:', errorMsg);
    throw new Error(errorMsg);
  }
}
