// ==================== CONFIGURACIÓN DE LA API (Google Sheets) ====================
// Pega aquí la URL de tu implementación de Google Apps Script (Code.gs)
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzvG-9QPQjWxrI3nWynSIng6AJqryDVKj2xffwibj1wXOLTucL8FKgVB3kcWmGf98J5xg/exec'
};

// Datos en memoria (se llenan desde Google Sheets tras iniciar sesión)
let users = [];
let rmRecords = [];
let progressions = [];

// Sesión actual
let currentSession = null; // { token, role, userId, username, name }

// ==================== LLAMADAS A LA API ====================

function apiCall(action, payload) {
    payload = payload || {};
    payload.action = action;
    if (currentSession && currentSession.token) payload.token = currentSession.token;

    return fetch(CONFIG.API_URL, {
        method: 'POST',
        // text/plain evita el preflight CORS; Apps Script igual responde en JSON
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
        .then(function (res) { return res.json(); })
        .catch(function (err) {
            console.error('Error de conexión con la API:', err);
            return { success: false, message: 'No se pudo conectar con Google Sheets. Verifique CONFIG.API_URL y su conexión.' };
        });
}
