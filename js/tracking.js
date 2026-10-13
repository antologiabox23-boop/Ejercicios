// ==================== SEGUIMIENTO SEMANAL / MENSUAL / TRIMESTRAL ====================
let weeklyRecords = [];
let trackCursor = new Date();
let trackGroup = 'gimnastic';

const TRACK_EXTRA = [
    { name: 'Air Squat', category: 'weightlifting' },
    { name: 'Row (remo)', category: 'endurance' },
    { name: 'Run', category: 'endurance' },
    { name: 'Kettlebell Swing', category: 'endurance' },
    { name: 'Wall Ball', category: 'endurance' }
];

const EX_GROUPS = {
    'Pull-up': ['traccion'], 'Rope Climb': ['traccion'], 'Muscle-up': ['traccion', 'empuje'],
    'Push-up': ['empuje'], 'Bench press': ['empuje'],
    'Handstand Push-up': ['hombro'], 'Handstand walk': ['hombro', 'core'], 'Wall walk': ['hombro', 'core'],
    'Snatch': ['hombro', 'posterior'], 'Push Jerk': ['hombro', 'piernas'], 'Split Jerk': ['hombro', 'piernas'],
    'Clean & Jerk': ['posterior', 'hombro'], 'Clean': ['posterior'], 'Cluster': ['piernas', 'hombro'],
    'Thruster': ['piernas', 'hombro'], 'Deadlift': ['posterior'],
    'Front Squat': ['piernas'], 'Back Squat': ['piernas'], 'Air Squat': ['piernas'],
    'Pistol Squat': ['piernas'], 'Box Jump': ['piernas'],
    'Toes-to-bar': ['core', 'traccion'], 'Burpee': ['cardio', 'empuje'], 'Double Under': ['cardio'],
    'Row (remo)': ['cardio', 'traccion'], 'Run': ['cardio', 'piernas'],
    'Kettlebell Swing': ['posterior', 'cardio'], 'Wall Ball': ['piernas', 'hombro', 'cardio']
};

const REC = {
    traccion: { label: 'Tracción (espalda/bíceps)', icon: 'fa-grip-lines',
        mov: ['Dislocaciones con PVC/banda (2x10)', 'Rotación torácica en cuadrupedia (2x8/lado)'],
        fort: ['Ring rows (3x10)', 'Face pulls con banda (3x15)', 'Scapular pulls (3x8)'],
        est: ['Dorsal en pared/barra (30 s)', 'Bíceps y antebrazo en pared (30 s/lado)'] },
    empuje: { label: 'Empuje (pecho/tríceps)', icon: 'fa-hand',
        mov: ['Círculos de hombro con banda (2x10)', 'Cat-cow (2x10)'],
        fort: ['Push-up plus (3x10)', 'Press con mancuerna (3x10)', 'Fondos en banco (3x8)'],
        est: ['Pectoral en marco de puerta (30 s/lado)', 'Tríceps overhead (30 s/lado)'] },
    hombro: { label: 'Hombros / Overhead', icon: 'fa-circle-up',
        mov: ['Pass-through con PVC (2x10)', 'Rotaciones y flexo-extensión de muñeca (1 min)', 'Wall slides (2x10)'],
        fort: ['Y-T-W en banco (2x8 c/u)', 'Rotación externa con banda (3x15)', 'Hang activo en barra (3x20 s)'],
        est: ['Sleeper stretch (30 s/lado)', 'Dorsal en pared (30 s)', 'Flexores/extensores de antebrazo (30 s)'] },
    piernas: { label: 'Piernas', icon: 'fa-shoe-prints',
        mov: ['Rodilla a pared, tobillo (2x10/lado)', '90/90 de cadera (2x8/lado)', 'Sentadilla profunda sostenida (1-2 min)'],
        fort: ['Puente de glúteo (3x15)', 'Bulgarian split squat (3x8/lado)', 'Step-up lateral (3x10)'],
        est: ['Cuádriceps de rodillas (30 s/lado)', 'Flexor de cadera en lunge (30 s/lado)', 'Aductores en mariposa (45 s)'] },
    posterior: { label: 'Cadena posterior', icon: 'fa-angles-up',
        mov: ['Cat-cow (2x10)', 'Good morning con PVC (2x10)'],
        fort: ['Hip thrust (3x12)', 'Bird-dog (3x8/lado)', 'Extensión de espalda/GHD (3x12)'],
        est: ['Isquiotibiales sentado (30 s/lado)', 'Postura del niño (1 min)', 'Piriforme figura 4 (30 s/lado)'] },
    core: { label: 'Core', icon: 'fa-bullseye',
        mov: ['Rotación torácica en cuadrupedia (2x8/lado)', 'Cat-cow (2x10)'],
        fort: ['Hollow hold (3x20 s)', 'Dead bug (3x8/lado)', 'Plancha lateral (3x20 s/lado)'],
        est: ['Cobra (30 s)', 'Postura del niño (1 min)', 'Flexión lateral de pie (30 s/lado)'] },
    cardio: { label: 'Resistencia / Cardio', icon: 'fa-heart-pulse',
        mov: ['Círculos de tobillo (1 min)', 'Zancada con rotación (2x6/lado)'],
        fort: ['Elevación de talones (3x15)', 'Plancha (3x30 s)', 'Saltos suaves a cuerda (3x20)'],
        est: ['Gemelos y sóleo en pared (30 s/lado)', 'Cuádriceps de pie (30 s/lado)', 'Flexor de cadera (30 s/lado)'] }
};

function trackExercises() {
    return exercises.concat(TRACK_EXTRA.filter(x => !exercises.some(e => e.name === x.name)));
}

function ymd(d) {
    const z = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
}

function trackUserId() {
    return currentSession.role === 'member' ? currentSession.userId : $('#trackUser').val();
}

function updateTrackUsers() {
    const sel = $('#trackUser'), prev = sel.val();
    sel.empty().append('<option value="">Seleccionar miembro</option>');
    users.filter(u => u.active).forEach(u => sel.append(`<option value="${u.id}">${u.name}</option>`));
    if (prev) sel.val(prev);
}

function trackRange() {
    const p = $('#trackPeriod').val(), c = new Date(trackCursor);
    c.setHours(0, 0, 0, 0);
    let s, e;
    if (p === 'week') {
        s = new Date(c); s.setDate(c.getDate() - ((c.getDay() + 6) % 7));
        e = new Date(s); e.setDate(s.getDate() + 6);
    } else if (p === 'month') {
        s = new Date(c.getFullYear(), c.getMonth(), 1);
        e = new Date(c.getFullYear(), c.getMonth() + 1, 0);
    } else {
        const q = Math.floor(c.getMonth() / 3) * 3;
        s = new Date(c.getFullYear(), q, 1);
        e = new Date(c.getFullYear(), q + 3, 0);
    }
    return { p, s, e };
}

function shiftTrack(n) {
    const p = $('#trackPeriod').val(), d = new Date(trackCursor);
    if (p === 'week') d.setDate(d.getDate() + 7 * n);
    else if (p === 'month') d.setMonth(d.getMonth() + n, 1);
    else d.setMonth(d.getMonth() + 3 * n, 1);
    trackCursor = d;
    renderTracking();
}

function renderTracking() {
    const uid = trackUserId(), { p, s, e } = trackRange();
    const fmt = d => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    $('#trackLabel').text(
        p === 'quarter' ? `T${Math.floor(s.getMonth() / 3) + 1} ${s.getFullYear()}` :
        p === 'month' ? s.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) :
        `${fmt(s)} - ${fmt(e)}`
    );
    if (!uid) {
        $('#trackBody, #trackStats, #trackRecs').html('<p class="text-muted">Seleccione un miembro.</p>');
        return;
    }
    const sD = ymd(s), eD = ymd(e);
    const recs = weeklyRecords.filter(r => r.userId === uid && r.date >= sD && r.date <= eD);
    if (p === 'week') renderTrackWeek(s, recs); else renderTrackSummary(recs);
    renderTrackStats(recs);
    renderTrackRecs(recs);
}

function renderTrackWeek(s, recs) {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dates = days.map((_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return ymd(d); });
    const done = new Set(recs.map(r => r.exercise + '|' + r.date));
    const cats = { gimnastic: 'Gimnásticos', weightlifting: 'Levantamiento', endurance: 'Resistencia' };
    const catOf = n => (trackExercises().find(x => x.name === n) || {}).category;
    const pills = Object.keys(cats).map(k => {
        const n = recs.filter(r => catOf(r.exercise) === k).length;
        return `<button type="button" class="btn btn-sm track-grp ${k === trackGroup ? 'btn-primary' : 'btn-outline-light'}" data-grp="${k}">${cats[k]} <span class="badge bg-dark">${n}</span></button>`;
    }).join('');
    let h = `<div class="d-flex gap-2 flex-wrap mb-3">${pills}</div>
        <div class="track-scroll"><table class="table table-sm text-center mb-0"><thead><tr><th class="text-start">Ejercicio</th>`
        + days.map((d, i) => `<th>${d}<br><small>${dates[i].slice(8)}</small></th>`).join('') + '</tr></thead><tbody>';
    trackExercises().filter(x => x.category === trackGroup).forEach(x => {
        h += `<tr><td class="text-start">${x.name}</td>` + dates.map(dt =>
            `<td><input type="checkbox" class="form-check-input track-chk" data-ex="${x.name}" data-date="${dt}" ${done.has(x.name + '|' + dt) ? 'checked' : ''}></td>`
        ).join('') + '</tr>';
    });
    $('#trackBody').html(h + '</tbody></table></div>');
}

function renderTrackSummary(recs) {
    const c = {};
    recs.forEach(r => c[r.exercise] = (c[r.exercise] || 0) + 1);
    const rows = Object.entries(c).sort((a, b) => b[1] - a[1]);
    if (!rows.length) { $('#trackBody').html('<p class="text-muted">Sin registros en el periodo.</p>'); return; }
    const max = rows[0][1];
    $('#trackBody').html(rows.map(([n, v]) =>
        `<div class="mb-2"><div class="d-flex justify-content-between"><span>${n}</span><strong>${v}</strong></div>
         <div class="progress-container"><div class="progress-fill" style="width:${v / max * 100}%"></div></div></div>`
    ).join('') + '<small class="text-muted">Para registrar, use la vista Semanal.</small>');
}

function renderTrackStats(recs) {
    const days = new Set(recs.map(r => r.date)).size;
    const c = {};
    recs.forEach(r => c[r.exercise] = (c[r.exercise] || 0) + 1);
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    const rp = recs.map(r => parseFloat(r.rpe)).filter(n => n > 0);
    const avg = rp.length ? (rp.reduce((a, b) => a + b, 0) / rp.length).toFixed(1) : '-';
    $('#trackStats').html(`
        <div class="d-flex justify-content-between mb-2"><span>Registros</span><strong>${recs.length}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Días activos</span><strong>${days}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Percepción de carga (prom.)</span><strong>${avg}/10</strong></div>
        <div class="d-flex justify-content-between"><span>Más realizado</span><strong>${top ? top[0] + ' (' + top[1] + ')' : '-'}</strong></div>`);
}

function renderTrackRecs(recs) {
    if (currentSession.role !== 'admin') { $('#trackRecs').empty(); return; }
    const g = {};
    recs.forEach(r => (EX_GROUPS[r.exercise] || []).forEach(k => g[k] = (g[k] || 0) + 1));
    const keys = Object.keys(g).sort((a, b) => g[b] - g[a]);
    if (!keys.length) { $('#trackRecs').html('<p class="text-muted">Registre ejercicios para ver recomendaciones.</p>'); return; }
    const esc = s => $('<div>').text(s).html();
    const items = (k, t) => REC[k][t].map(x => `<li>${x}</li>`).concat(
        customExercises.filter(c => c.group === k && c.type === t).map(c =>
            `<li>${esc(c.name)} <a href="#" class="text-danger ms-1" onclick="deleteCustomEx('${c.id}');return false;"><i class="fas fa-times"></i></a></li>`)
    ).join('');
    const sec = (t, ic, html) => `<h6 class="mt-2 text-primary"><i class="fas ${ic}"></i> ${t}</h6><ul class="small ps-3 mb-0">${html}</ul>`;
    $('#trackRecs').html(keys.map(k => {
        const r = REC[k];
        return `<div class="col-md-6 col-xl-4 mb-3"><div class="card h-100">
            <div class="card-header"><i class="fas ${r.icon}"></i> ${r.label} <span class="badge bg-dark float-end">${g[k]}x</span></div>
            <div class="card-body">${sec('Movilidad', 'fa-rotate', items(k, 'mov'))}${sec('Fortalecimiento', 'fa-dumbbell', items(k, 'fort'))}${sec('Estiramiento', 'fa-spa', items(k, 'est'))}</div>
        </div></div>`;
    }).join(''));
}

function initTracking() {
    updateTrackUsers();
    renderTracking();
    $('#trackUser, #trackPeriod').on('change', renderTracking);
    $('#trackPrev').click(() => shiftTrack(-1));
    $('#trackNext').click(() => shiftTrack(1));
    $('#trackToday').click(() => { trackCursor = new Date(); renderTracking(); });
    $('#tracking-tab').on('shown.bs.tab', renderTracking);

    $(document).off('click.grp').on('click.grp', '.track-grp', function () {
        trackGroup = $(this).attr('data-grp');
        renderTracking();
    });
    $('#newCustomExBtn').click(openCustomEx);
    $('#cexSave').click(saveCustomEx);

    $(document).off('change.track').on('change.track', '.track-chk', function () {
        const el = this, $el = $(this);
        const ex = $el.attr('data-ex'), date = $el.attr('data-date');
        if (el.checked) {
            askRPE(ex, rpe => { if (rpe === null) el.checked = false; else toggleTrack($el, ex, date, rpe); });
        } else {
            toggleTrack($el, ex, date, '');
        }
    });
}

function askRPE(ex, cb) {
    $('#rpeExName').text(ex);
    const m = bootstrap.Modal.getOrCreateInstance(document.getElementById('rpeModal'));
    let done = false;
    const finish = v => { if (done) return; done = true; m.hide(); cb(v); };
    $('#rpeButtons').empty();
    for (let i = 1; i <= 10; i++) {
        $('#rpeButtons').append(`<button type="button" class="btn btn-outline-light rpe-btn" data-v="${i}" style="width:48px">${i}</button>`);
    }
    $('#rpeButtons .rpe-btn').on('click', function () { finish(+$(this).data('v')); });
    $('#rpeCancel').off('click').on('click', () => finish(null));
    m.show();
}

async function toggleTrack($el, ex, date, rpe) {
    const uid = trackUserId();
    const category = (trackExercises().find(x => x.name === ex) || {}).category || '';
    const res = await apiCall('toggleWeekly', { entry: { userId: uid, date, exercise: ex, category, rpe } });
    if (!res || !res.success) {
        alert((res && res.message) || 'No se pudo guardar.');
        $el.prop('checked', !$el.prop('checked'));
        return;
    }
    if (res.done) weeklyRecords.push({ id: res.id, userId: uid, date, exercise: ex, category, rpe });
    else weeklyRecords = weeklyRecords.filter(r => !(r.userId === uid && r.date === date && r.exercise === ex));
    renderTracking();
}

function openCustomEx() {
    $('#cexGroup').html(Object.keys(REC).map(k => `<option value="${k}">${REC[k].label}</option>`).join(''));
    $('#cexName').val('');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('customExModal')).show();
}

async function saveCustomEx() {
    const group = $('#cexGroup').val(), type = $('#cexType').val(), name = $('#cexName').val().trim();
    if (!name) { alert('Escriba el nombre del ejercicio.'); return; }
    const res = await apiCall('saveCustomExercise', { item: { group, type, name } });
    if (!res || !res.success) { alert((res && res.message) || 'No se pudo guardar.'); return; }
    customExercises.push({ id: res.id, group, type, name });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('customExModal')).hide();
    renderTracking();
}

async function deleteCustomEx(id) {
    if (!confirm('¿Eliminar este ejercicio?')) return;
    const res = await apiCall('deleteCustomExercise', { id });
    if (!res || !res.success) { alert((res && res.message) || 'No se pudo eliminar.'); return; }
    customExercises = customExercises.filter(c => c.id !== id);
    renderTracking();
}
