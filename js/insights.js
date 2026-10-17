// ==================== EJERCICIOS MÁS / MENOS PRACTICADOS (solo admin) ====================
// Módulo autónomo. Usa globals: currentSession, users, weeklyRecords, trackExercises().
(function () {
    let cursor = new Date();
    let bound = false;

    const z = n => String(n).padStart(2, '0');
    const ymdI = d => d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
    const esc = s => $('<div>').text(s).html();

    function range() {
        const p = $('#insPeriod').val();
        const c = new Date(cursor); c.setHours(0, 0, 0, 0);
        let s, e;
        if (p === 'week') {
            s = new Date(c); s.setDate(c.getDate() - ((c.getDay() + 6) % 7));
            e = new Date(s); e.setDate(s.getDate() + 6);
        } else if (p === 'fortnight') {
            const first = c.getDate() <= 15;
            s = new Date(c.getFullYear(), c.getMonth(), first ? 1 : 16);
            e = first ? new Date(c.getFullYear(), c.getMonth(), 15) : new Date(c.getFullYear(), c.getMonth() + 1, 0);
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

    function shift(n) {
        const p = $('#insPeriod').val(), d = new Date(cursor);
        if (p === 'week') d.setDate(d.getDate() + 7 * n);
        else if (p === 'fortnight') {
            // salta entre quincenas
            const first = d.getDate() <= 15;
            if (n > 0) { if (first) d.setDate(16); else d.setMonth(d.getMonth() + 1, 1); }
            else { if (first) { d.setMonth(d.getMonth() - 1, 16); } else d.setDate(1); }
        }
        else if (p === 'month') d.setMonth(d.getMonth() + n, 1);
        else d.setMonth(d.getMonth() + 3 * n, 1);
        cursor = d;
        render();
    }

    function updateUsers() {
        const sel = $('#insUser'), prev = sel.val();
        sel.empty().append('<option value="">Todos</option>');
        users.filter(u => u.active).forEach(u => sel.append(`<option value="${u.id}">${esc(u.name)}</option>`));
        if (prev) sel.val(prev);
    }

    function list(rows, max, emptyMsg) {
        if (!rows.length) return `<p class="text-muted">${emptyMsg}</p>`;
        return rows.map(([n, v], i) =>
            `<div class="mb-2"><div class="d-flex justify-content-between"><span>${i + 1}. ${esc(n)}</span><strong>${v}</strong></div>
             <div class="progress-container"><div class="progress-fill" style="width:${max ? v / max * 100 : 0}%"></div></div></div>`
        ).join('');
    }

    function render() {
        if (!currentSession || currentSession.role !== 'admin' || !$('#insCard').length) return;
        const { p, s, e } = range();
        const fmt = d => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        $('#insLabel').text(
            p === 'quarter' ? `T${Math.floor(s.getMonth() / 3) + 1} ${s.getFullYear()}` :
            p === 'month' ? s.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) :
            `${fmt(s)} - ${fmt(e)}`
        );
        const uid = $('#insUser').val(), sD = ymdI(s), eD = ymdI(e);
        const recs = weeklyRecords.filter(r =>
            (!uid || String(r.userId) === String(uid)) && r.date >= sD && r.date <= eD);

        const counts = {};
        trackExercises().forEach(x => counts[x.name] = 0);
        // Cuenta 1 por día por ejercicio, sin importar cuántos usuarios lo registraron
        const days = {};
        recs.forEach(r => { (days[r.exercise] = days[r.exercise] || new Set()).add(String(r.date).substring(0, 10)); });
        Object.keys(days).forEach(k => counts[k] = days[k].size);

        const all = Object.entries(counts);
        const top = all.filter(a => a[1] > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3);
        const low = all.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).slice(0, 3);
        const max = top.length ? top[0][1] : 0;

        $('#insTop').html(list(top, max, 'Sin registros en el periodo.'));
        $('#insLow').html(list(low, max || 1, 'Sin datos.'));
    }

    function bindOnce() {
        if (bound) return;
        bound = true;
        $('#insUser, #insPeriod').on('change', function () { cursor = new Date(cursor); render(); });
        $('#insPrev').on('click', () => shift(-1));
        $('#insNext').on('click', () => shift(1));
        $('#insToday').on('click', () => { cursor = new Date(); render(); });
        $('#tracking-tab').on('shown.bs.tab', function () { updateUsers(); render(); });
    }

    function wrap(name, after) {
        const orig = window[name];
        if (typeof orig !== 'function' || orig.__insWrapped) return;
        const w = function () {
            const r = orig.apply(this, arguments);
            try { after(); } catch (e) { console.error(e); }
            return r;
        };
        w.__insWrapped = true;
        window[name] = w;
    }

    $(function () {
        bindOnce();
        wrap('renderTracking', render);
        wrap('updateUserSelects', updateUsers);
        const t = setInterval(function () {
            if (typeof currentSession !== 'undefined' && currentSession && currentSession.token) {
                updateUsers(); render();
                clearInterval(t);
            }
        }, 700);
    });
})();
