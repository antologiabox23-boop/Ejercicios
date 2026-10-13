// ==================== SESIÓN ====================

function saveSessionLocally(session) {
    currentSession = session;
    localStorage.setItem('antologia_session', JSON.stringify(session));
}

function clearSessionLocally() {
    currentSession = null;
    localStorage.removeItem('antologia_session');
}

function showAuthScreen() {
    $('#authScreen').show();
    $('#appContent').hide();
}

async function showAppScreen() {
    $('#authScreen').hide();
    $('#appContent').show();

    $('#sessionUserName').text(currentSession.name);
    $('#sessionUserRole').text(currentSession.role === 'admin' ? 'Administrador' : 'Miembro');

    applyRoleRestrictions();

    await loadAllData();
    initializeApp();
    $('[data-bs-toggle="tooltip"]').tooltip();
}

function applyRoleRestrictions() {
    const isAdmin = currentSession.role === 'admin';
    $('.admin-only').toggleClass('d-none', !isAdmin).each(function () {
        if (isAdmin) $(this).removeAttr('disabled'); 
    });
    $('.member-only').toggleClass('d-none', isAdmin);
}

async function loadAllData() {
    const [usersRes, rmRes, progRes, weeklyRes, customRes] = await Promise.all([
        apiCall('getUsers'),
        apiCall('getRM'),
        apiCall('getProgressions'),
        apiCall('getWeekly'),
                apiCall('getCustomExercises')
    ]);

    customExercises = (customRes && customRes.success) ? customRes.items : [];
            users = (usersRes && usersRes.success) ? usersRes.users.map(normalizeUser) : [];
    rmRecords = (rmRes && rmRes.success) ? rmRes.records.map(normalizeRM) : [];
    progressions = (progRes && progRes.success) ? progRes.progressions.map(normalizeProgression) : [];
    weeklyRecords = (weeklyRes && weeklyRes.success)
        ? weeklyRes.records.map(r => Object.assign({}, r, { date: String(r.date).substring(0, 10) }))
        : [];

    loadUsers();
    updateUserSelects();
    loadRMRecords();
    loadProgressions();
    loadWhatsAppUsers();
    updateStats();
}

// Normaliza los valores que llegan desde Google Sheets (texto/numero) al
// formato que ya esperaba el resto de la app
function normalizeUser(u) {
    return Object.assign({}, u, {
        weight: parseFloat(u.weight) || 0,
        active: (u.active === true || u.active === 'TRUE' || u.active === 'true')
    });
}
function normalizeRM(r) {
    return Object.assign({}, r, {
        weight: parseFloat(r.weight) || 0,
        reps: parseInt(r.reps, 10) || 0,
        rm: parseFloat(r.rm) || 0
    });
}
function normalizeProgression(p) {
    return Object.assign({}, p);
}

async function refreshUsers() {
    const res = await apiCall('getUsers');
    users = (res && res.success) ? res.users.map(normalizeUser) : users;
}
async function refreshRM() {
    const res = await apiCall('getRM');
    rmRecords = (res && res.success) ? res.records.map(normalizeRM) : rmRecords;
}
async function refreshProgressions() {
    const res = await apiCall('getProgressions');
    progressions = (res && res.success) ? res.progressions.map(normalizeProgression) : progressions;
}

// ==================== EVENTOS DE LOGIN / REGISTRO / LOGOUT ====================

$(function () {
    if (!CONFIG.API_URL || CONFIG.API_URL.indexOf('PEGA_AQUI') !== -1) {
        $('#loginAlert').removeClass('d-none').text('⚠️ Falta configurar CONFIG.API_URL con la URL de tu Google Apps Script.');
    }

    const savedSession = localStorage.getItem('antologia_session');
    if (savedSession) {
        currentSession = JSON.parse(savedSession);
        apiCall('validateSession').then(function (res) {
            if (res && res.success) {
                saveSessionLocally({
                    token: currentSession.token,
                    role: res.role,
                    userId: res.userId,
                    username: res.username,
                    name: res.name
                });
                showAppScreen();
            } else {
                clearSessionLocally();
                showAuthScreen();
            }
        });
    } else {
        showAuthScreen();
    }

    $('#loginForm').on('submit', async function (e) {
        e.preventDefault();
        $('#loginAlert').addClass('d-none');
        const btn = $('#loginBtn');
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Ingresando...');

        const res = await apiCall('login', {
            username: $('#loginUsername').val().trim(),
            password: $('#loginPassword').val()
        });

        btn.prop('disabled', false).html('<i class="fas fa-sign-in-alt"></i> Ingresar');

        if (res && res.success) {
            saveSessionLocally(res);
            showAppScreen();
        } else {
            $('#loginAlert').removeClass('d-none').text((res && res.message) || 'No se pudo iniciar sesión.');
        }
    });

    $('#registerForm').on('submit', async function (e) {
        e.preventDefault();
        $('#registerAlert').addClass('d-none');

        if ($('#regPassword').val() !== $('#regPassword2').val()) {
            $('#registerAlert').removeClass('d-none').text('Las contraseñas no coinciden.');
            return;
        }

        const btn = $('#registerBtn');
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Creando cuenta...');

        const res = await apiCall('register', {
            name: $('#regName').val().trim(),
            phone: $('#regPhone').val().trim(),
            category: $('#regCategory').val(),
            weight: $('#regWeight').val(),
            username: $('#regUsername').val().trim(),
            password: $('#regPassword').val(),
            adminCode: $('#regAdminCode').val().trim()
        });

        btn.prop('disabled', false).html('<i class="fas fa-user-plus"></i> Crear cuenta');

        if (res && res.success) {
            alert('Cuenta creada correctamente. Ahora puede iniciar sesión.');
            $('#registerForm')[0].reset();
            $('#login-tab').tab('show');
            $('#loginUsername').val($('#regUsername').val());
        } else {
            $('#registerAlert').removeClass('d-none').text((res && res.message) || 'No se pudo crear la cuenta.');
        }
    });

    $('#logoutBtn').on('click', async function () {
        if (!confirm('¿Cerrar sesión?')) return;
        await apiCall('logout');
        clearSessionLocally();
        location.reload();
    });
});
