// ==================== OBJETIVOS ====================
// Módulo autónomo: no requiere modificar los demás archivos js.
// Usa los globals existentes: apiCall, currentSession, users, rmRecords, progressions, exercises.
(function () {
    let goalsData = [];
    let loaded = false;
    let bound = false;

    function goalUserId() {
        return currentSession.role === 'member' ? currentSession.userId : $('#goalUser').val();
    }

    function updateGoalUsers() {
        const sel = $('#goalUser'), prev = sel.val();
        sel.empty().append('<option value="">Seleccionar miembro</option>');
        users.filter(u => u.active).forEach(u => sel.append(`<option value="${u.id}">${u.name}</option>`));
        if (prev) sel.val(prev);
    }

    function goalProgress(g, uid) {
        if (g.type === 'rm') {
            const t = parseFloat(g.target) || 0;
            const cur = Math.max(0, ...rmRecords.filter(r => r.userId === uid && r.exercise === g.exercise).map(r => r.rm));
            const done = t > 0 && cur >= t;
            return {
                pct: t ? Math.min(100, cur / t * 100) : 0,
                text: `${cur.toFixed(1)} / ${t} kg`,
                left: done ? '¡Meta lograda!' : `Faltan ${(t - cur).toFixed(1)} kg`,
                done
            };
        }
        const ex = exercises.find(e => e.name === g.exercise);
        const list = ex && ex.progressions ? ex.progressions : [];
        const ti = list.indexOf(g.target);
        const last = progressions
            .filter(p => p.userId === uid && p.exercise === g.exercise)
            .map(p => list.indexOf(p.level))
            .reduce((a, b) => Math.max(a, b), -1);
        const done = ti >= 0 && last >= ti;
        return {
            pct: ti < 0 ? 0 : Math.min(100, (last + 1) / (ti + 1) * 100),
            text: `${last >= 0 ? list[last] : 'Sin registro'} → ${g.target}`,
            left: done ? '¡Meta lograda!' : `Faltan ${ti - last} nivel(es)`,
            done
        };
    }

    function renderGoals() {
        if (!currentSession) return;
        const uid = goalUserId();
        if (!uid) { $('#goalsBody').html('<p class="text-muted">Seleccione un miembro.</p>'); return; }
        const mine = goalsData.filter(g => g.userId === uid);
        let h = '';
        [1, 2].forEach(slot => {
            const g = mine.find(x => Number(x.slot) === slot);
            if (!g) {
                h += `<div class="col-md-6 mb-3"><div class="exercise-card text-center">
                    <p class="text-muted mb-2">Objetivo ${slot} sin definir</p>
                    <button class="btn btn-primary btn-sm" onclick="openGoalModal(${slot})"><i class="fas fa-plus"></i> Definir objetivo</button>
                </div></div>`;
                return;
            }
            const p = goalProgress(g, uid);
            h += `<div class="col-md-6 mb-3"><div class="exercise-card">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${p.done ? '🏆 ' : '🎯 '}${g.exercise}</strong>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGoal('${g.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
                <div class="progress-container"><div class="progress-fill" style="width:${p.pct}%"></div></div>
                <div class="d-flex justify-content-between">
                    <small>${p.text}</small>
                    <small><strong>${Math.round(p.pct)}%</strong> · ${p.left}</small>
                </div>
                <div class="d-flex gap-2 mt-2 flex-wrap">
                    <button class="btn btn-sm ${p.done ? 'btn-outline-info' : 'btn-primary'}" onclick="goalRegister(${slot})">
                        <i class="fas ${g.type === 'rm' ? 'fa-dumbbell' : 'fa-chart-line'}"></i> ${g.type === 'rm' ? 'Registrar RM' : 'Registrar progresión'}
                    </button>
                    <button class="btn btn-sm ${p.done ? 'btn-success' : 'btn-outline-warning'}" onclick="openGoalModal(${slot}, true)">
                        <i class="fas fa-bullseye"></i> Nueva meta
                    </button>
                </div>
            </div></div>`;
        });
        $('#goalsBody').html(h);
    }

    function buildGoalTarget() {
        const ex = exercises.find(e => e.name === $('#goalExercise').val());
        const isRM = ex && ex.category === 'weightlifting';
        $('#goalRMBox').toggle(!!ex && isRM);
        $('#goalProgBox').toggle(!!ex && !isRM);
        if (ex && !isRM) {
            $('#goalProgTarget').empty().append((ex.progressions || []).map(p => `<option value="${p}">${p}</option>`));
        }
    }

    window.openGoalModal = function (slot, fresh) {
        if (!goalUserId()) { alert('Seleccione un miembro.'); return; }
        $('#goalSlot').val(slot);
        $('#goalExercise').empty().append('<option value="">Seleccionar ejercicio</option>')
            .append(exercises.map(e => `<option value="${e.name}">${e.name}</option>`));
        $('#goalRMTarget').val('');
        const g = fresh ? null : goalsData.find(x => x.userId === goalUserId() && Number(x.slot) === slot);
        if (g) {
            $('#goalExercise').val(g.exercise);
            buildGoalTarget();
            if (g.type === 'rm') $('#goalRMTarget').val(g.target); else $('#goalProgTarget').val(g.target);
        } else {
            buildGoalTarget();
        }
        $('#goalModal').modal('show');
    };

    async function saveGoal() {
        const ex = exercises.find(e => e.name === $('#goalExercise').val());
        if (!ex) { alert('Seleccione un ejercicio.'); return; }
        const isRM = ex.category === 'weightlifting';
        const target = isRM ? $('#goalRMTarget').val() : $('#goalProgTarget').val();
        if (!target || (isRM && parseFloat(target) <= 0)) { alert('Defina la meta.'); return; }

        const res = await apiCall('saveGoal', { goal: {
            userId: goalUserId(), slot: $('#goalSlot').val(),
            exercise: ex.name, type: isRM ? 'rm' : 'progression', target
        }});
        if (!res || !res.success) { alert((res && res.message) || 'No se pudo guardar.'); return; }
        await refreshGoals();
        $('#goalModal').modal('hide');
        renderGoals();
    }

    window.goalRegister = function (slot) {
        const uid = goalUserId();
        const g = goalsData.find(x => x.userId === uid && Number(x.slot) === slot);
        if (!g) return;
        if (g.type === 'rm') {
            $('#rmUser').val(uid);
            $('#rmExercise').val(g.exercise).trigger('change');
            $('#rmModal').modal('show');
        } else {
            $('#progressionUser').val(uid);
            $('#progressionExercise').val(g.exercise).trigger('change');
            $('#progressionModal').modal('show');
        }
    };

    window.deleteGoal = async function (id) {
        if (!confirm('¿Eliminar objetivo?')) return;
        const res = await apiCall('deleteGoal', { id });
        if (!res || !res.success) { alert((res && res.message) || 'No se pudo eliminar.'); return; }
        await refreshGoals();
        renderGoals();
    };

    async function refreshGoals() {
        const res = await apiCall('getGoals');
        if (res && res.success) goalsData = res.goals;
    }

    function bindOnce() {
        if (bound) return;
        bound = true;
        $('#goalUser').on('change', renderGoals);
        $('#goalExercise').on('change', buildGoalTarget);
        $('#saveGoalBtn').on('click', saveGoal);
    }

    async function ensureLoaded() {
        if (loaded || !currentSession || !currentSession.token) return;
        loaded = true;
        bindOnce();
        await refreshGoals();
        updateGoalUsers();
        renderGoals();
    }

    // Se engancha a funciones existentes para refrescar tras guardar RM/progresiones
    function wrap(name, after) {
        const orig = window[name];
        if (typeof orig !== 'function' || orig.__goalsWrapped) return;
        const w = function () {
            const r = orig.apply(this, arguments);
            try { after(); } catch (e) { console.error(e); }
            return r;
        };
        w.__goalsWrapped = true;
        window[name] = w;
    }

    $(function () {
        wrap('updateUserSelects', function () { if (loaded) updateGoalUsers(); });
        wrap('updateStats', function () { if (loaded) renderGoals(); else ensureLoaded(); });
        // Respaldo: carga inicial cuando la app ya está visible
        const t = setInterval(function () {
            if (typeof currentSession !== 'undefined' && currentSession && currentSession.token) {
                ensureLoaded();
                if (loaded) clearInterval(t);
            }
        }, 500);
    });
})();
