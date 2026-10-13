// ==================== FUNCIONES PRINCIPALES ====================

function validatePhone(input, errorElement) {
    const phone = input.val().replace(/\D/g, '');
    if (phone.length === 10) {
        errorElement.hide();
        return true;
    } else {
        errorElement.show();
        return false;
    }
}

function calculate1RM(weight, reps) {
    return weight / (1.0278 - 0.0278 * reps);
}

function calculateRM() {
    const weight = parseFloat($('#rmWeight').val()) || 0;
    const reps = parseInt($('#rmReps').val()) || 0;
    if (weight > 0 && reps > 0) {
        const rm = calculate1RM(weight, reps);
        $('#estimatedRM').text(rm.toFixed(1));
    }
}

function loadNextGoalOptions() {
    const exerciseName = $('#progressionExercise').val();
    if (!exerciseName) return;

    const exercise = exercises.find(ex => ex.name === exerciseName && ex.category === "gimnastic");
    const nextGoalSelect = $('#nextGoal');

    nextGoalSelect.empty();
    nextGoalSelect.append('<option value="">Seleccionar próxima progresión</option>');

    if (exercise && exercise.progressions) {
        exercise.progressions.forEach(progression => {
            nextGoalSelect.append(`<option value="${progression}">${progression}</option>`);
        });
    }

    const userId = currentSession.role === 'member' ? currentSession.userId : $('#progressionUser').val();
    if (userId) {
        const userProgressions = progressions.filter(p => 
            p.userId === userId && p.exercise === exerciseName
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (userProgressions.length > 0) {
            const lastProgression = userProgressions[0];
            const progressionIndex = exercise.progressions.indexOf(lastProgression.level);

            $('#progressionLevel').empty();
            $('#progressionLevel').append('<option value="">Seleccionar nivel alcanzado</option>');

            exercise.progressions.forEach((prog, index) => {
                $('#progressionLevel').append(`<option value="${prog}">${prog}</option>`);
            });

            if (lastProgression.level) {
                $('#progressionLevel').val(lastProgression.level);
            }

            if (progressionIndex >= 0 && progressionIndex < exercise.progressions.length - 1) {
                nextGoalSelect.val(exercise.progressions[progressionIndex + 1]);
            } else if (progressionIndex === exercise.progressions.length - 1) {
                nextGoalSelect.val("¡Dominado!");
            }
        } else {
            $('#progressionLevel').empty();
            $('#progressionLevel').append('<option value="">Seleccionar nivel alcanzado</option>');
            exercise.progressions.forEach(prog => {
                $('#progressionLevel').append(`<option value="${prog}">${prog}</option>`);
            });
        }
    }
}

function updateNextGoalBasedOnCurrent() {
    const currentLevel = $('#progressionLevel').val();
    const exerciseName = $('#progressionExercise').val();

    if (!currentLevel || !exerciseName) return;

    const exercise = exercises.find(ex => ex.name === exerciseName && ex.category === "gimnastic");
    if (!exercise || !exercise.progressions) return;

    const currentIndex = exercise.progressions.indexOf(currentLevel);
    const nextGoalSelect = $('#nextGoal');

    if (currentIndex >= 0 && currentIndex < exercise.progressions.length - 1) {
        nextGoalSelect.val(exercise.progressions[currentIndex + 1]);
    } else if (currentIndex === exercise.progressions.length - 1) {
        nextGoalSelect.val("¡Dominado!");
    }
}

async function saveUser() {
    const name = $('#userName').val().trim();
    const phone = $('#userPhone').val().replace(/\D/g, '');
    const category = $('#userCategory').val();
    const weight = parseFloat($('#userWeight').val());
    const notes = $('#userNotes').val().trim();

    if (!name || !phone || !category || !weight) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    if (phone.length !== 10) {
        alert('El teléfono debe tener 10 dígitos');
        return;
    }

    const btn = $('#saveUserBtn');
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

    const res = await apiCall('saveUser', {
        user: { id: $('#userId').val(), name, phone, category, weight, notes }
    });

    btn.prop('disabled', false).html('Guardar Usuario');

    if (!res || !res.success) {
        alert((res && res.message) || 'No se pudo guardar el usuario.');
        return;
    }

    await refreshUsers();
    $('#userModal').modal('hide');
    resetUserForm();
    loadUsers();
    updateUserSelects();
    loadWhatsAppUsers();
    updateStats();
}

async function saveRM() {
    const userId = currentSession.role === 'member' ? currentSession.userId : $('#rmUser').val();
    const exercise = $('#rmExercise').val();
    const weight = parseFloat($('#rmWeight').val());
    const reps = parseInt($('#rmReps').val());
    const date = $('#rmDate').val();
    const notes = $('#rmNotes').val().trim();

    if (!userId || !exercise || !weight || !reps || !date) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    if (weight <= 0 || reps <= 0) {
        alert('El peso y las repeticiones deben ser mayores a 0');
        return;
    }

    const btn = $('#saveRMBtn');
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

    const res = await apiCall('saveRM', {
        record: { userId, exercise, weight, reps, date, notes }
    });

    btn.prop('disabled', false).html('Guardar RM');

    if (!res || !res.success) {
        alert((res && res.message) || 'No se pudo guardar el registro.');
        return;
    }

    await refreshRM();
    $('#rmModal').modal('hide');
    resetRMForm();
    loadRMRecords();
    updateStats();
}

async function saveProgression() {
    const userId = currentSession.role === 'member' ? currentSession.userId : $('#progressionUser').val();
    const exercise = $('#progressionExercise').val();
    const level = $('#progressionLevel').val();
    const date = $('#progressionDate').val();
    const details = $('#progressionDetails').val().trim();
    const nextGoal = $('#nextGoal').val();

    if (!userId || !exercise || !level || !date) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    const btn = $('#saveProgressionBtn');
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

    const res = await apiCall('saveProgression', {
        progression: { userId, exercise, level, date, details, nextGoal }
    });

    btn.prop('disabled', false).html('Guardar Progresión');

    if (!res || !res.success) {
        alert((res && res.message) || 'No se pudo guardar la progresión.');
        return;
    }

    await refreshProgressions();
    $('#progressionModal').modal('hide');
    resetProgressionForm();
    loadProgressions();
    updateStats();
}

function userLevelsHTML(userId) {
    const lastProg = {};
    progressions.filter(p => p.userId === userId).forEach(p => {
        const c = lastProg[p.exercise];
        if (!c || new Date(p.date) >= new Date(c.date)) lastProg[p.exercise] = p;
    });
    const bestRM = {};
    rmRecords.filter(r => r.userId === userId).forEach(r => {
        if (!bestRM[r.exercise] || r.rm > bestRM[r.exercise].rm) bestRM[r.exercise] = r;
    });
    const g = Object.values(lastProg).map(p =>
        `<span class="lvl-chip lvl-gym"><b>${p.exercise}:</b> ${p.level}</span>`).join('');
    const w = Object.values(bestRM).map(r =>
        `<span class="lvl-chip lvl-rm"><b>${r.exercise}:</b> ${Math.round(r.rm)} kg</span>`).join('');
    return (g || w) ? g + w : '<small class="text-muted">Sin registros</small>';
}

function loadUsers() {
    const usersList = $('#usersList');
    usersList.empty();

    users.forEach(user => {
        const categoryClass = `badge-${user.category}`;
        const row = `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">${user.name.charAt(0)}</div>
                        <div>
                            <strong>${user.name}</strong>
                            ${user.notes ? `<br><small class="text-muted">${user.notes.substring(0, 30)}${user.notes.length > 30 ? '...' : ''}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>${user.phone}</td>
                <td><span class="badge-category ${categoryClass}">${user.category}</span></td>
                <td>${user.weight} kg</td>
                <td>${userLevelsHTML(user.id)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewUserProgress('${user.id}')" title="Ver progreso">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="editUser('${user.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${currentSession && currentSession.role === 'admin' ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </td>
            </tr>
        `;
        usersList.append(row);
    });

    $('#totalUsers').text(users.length);
    $('#activeUsers').text(users.filter(u => u.active).length);
    $('#infoTotalUsers').text(users.length);
    $('#infoTotalUsers2').text(users.length);
}

function loadRMRecords() {
    const rmList = $('#rmList');
    rmList.empty();

    let filteredRecords = rmRecords;
    const userFilter = $('#filterRMUser').val();
    const exerciseFilter = $('#filterRMExercise').val();

    if (userFilter) {
        filteredRecords = filteredRecords.filter(r => r.userId === userFilter);
    }

    if (exerciseFilter) {
        filteredRecords = filteredRecords.filter(r => r.exercise === exerciseFilter);
    }

    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredRecords.forEach(record => {
        const row = `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>${record.userName}</td>
                <td>
                    ${record.exercise}
                    <button class="btn btn-sm btn-outline-info ms-2" onclick="showExerciseGifModal('${record.exercise}')" 
                            title="Ver demostración">
                        <i class="fas fa-play-circle"></i>
                    </button>
                </td>
                <td>${record.weight} kg</td>
                <td>${record.reps}</td>
                <td><strong class="text-secundary">${record.rm.toFixed(1)} kg</strong></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRMRecord('${record.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        rmList.append(row);
    });

    loadPersonalRecords();
    $('#infoTotalRM').text(rmRecords.length);
    $('#infoTotalRM2').text(rmRecords.length);
}

function loadProgressions() {
    const progressionList = $('#progressionList');
    progressionList.empty();

    let filteredProgressions = progressions;
    const userFilter = $('#filterProgressionUser').val();
    const exerciseFilter = $('#filterProgressionExercise').val();

    if (userFilter) {
        filteredProgressions = filteredProgressions.filter(p => p.userId === userFilter);
    }

    if (exerciseFilter) {
        filteredProgressions = filteredProgressions.filter(p => p.exercise === exerciseFilter);
    }

    filteredProgressions.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredProgressions.forEach(progression => {
        const levelBadge = progression.level.includes("Dominado") ? 'success' : 
                         progression.level.includes("asistido") ? 'warning' : 'primary';
        const row = `
            <tr>
                <td>${formatDate(progression.date)}</td>
                <td>${progression.userName}</td>
                <td>
                    ${progression.exercise}
                    <button class="btn btn-sm btn-outline-info ms-2" onclick="showExerciseGifModal('${progression.exercise}')" 
                            title="Ver demostración">
                        <i class="fas fa-play-circle"></i>
                    </button>
                </td>
                <td><span class="badge bg-${levelBadge}">${progression.level}</span></td>
                <td>${progression.nextGoal || 'No especificada'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProgression('${progression.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        progressionList.append(row);
    });

    loadAchievements();
    $('#infoTotalProgressions').text(progressions.length);
    $('#infoTotalProgressions2').text(progressions.length);
}

function loadPersonalRecords() {
    const personalRecords = $('#personalRecords');
    personalRecords.empty();

    const recordsByUserExercise = {};

    rmRecords.forEach(record => {
        const key = `${record.userId}-${record.exercise}`;
        if (!recordsByUserExercise[key] || record.rm > recordsByUserExercise[key].rm) {
            recordsByUserExercise[key] = record;
        }
    });

    const recordsArray = Object.values(recordsByUserExercise);

    if (recordsArray.length === 0) {
        personalRecords.html('<p class="text-muted text-center">No hay records registrados aún.</p>');
        return;
    }

    recordsArray.slice(0, 5).forEach(record => {
        // Encontrar el usuario para obtener su peso corporal
        const user = users.find(u => u.id === record.userId);
        let bodyWeightRatio = "";

        if (user && user.weight && user.weight > 0) {
            const ratio = (record.rm / user.weight).toFixed(1);
            bodyWeightRatio = `
                <div class="mt-1">
                    <small class="text-success">
                        <i class="fas fa-balance-scale"></i> 
                        ${ratio}x tu peso corporal (${user.weight} kg)
                    </small>
                </div>
            `;
        }

        const card = `
            <div class="exercise-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${record.userName}</strong><br>
                        <small>${record.exercise}</small>
                    </div>
                    <div class="rm-value">${record.rm.toFixed(1)} kg</div>
                </div>
                <div class="mt-2">
                    <small>Peso: ${record.weight} kg × ${record.reps} reps</small><br>
                    <small>Fecha: ${formatDate(record.date)}</small>
                    ${bodyWeightRatio}
                    <button class="btn btn-sm btn-outline-info ms-2" onclick="showExerciseGifModal('${record.exercise}')" 
                            title="Ver demostración">
                        <i class="fas fa-play-circle"></i>
                    </button>
                </div>
            </div>
        `;
        personalRecords.append(card);
    });
}

function loadAchievements() {
    const achievementsList = $('#achievementsList');
    achievementsList.empty();

    const achievementsByExercise = {};

    progressions.forEach(progression => {
        const exercise = exercises.find(ex => ex.name === progression.exercise);
        if (!exercise || !exercise.progressions) return;

        const currentIndex = exercise.progressions.indexOf(progression.level);

        if (!achievementsByExercise[progression.exercise]) {
            achievementsByExercise[progression.exercise] = {
                exercise: progression.exercise,
                maxLevel: progression.level,
                maxIndex: currentIndex,
                userCount: 1
            };
        } else {
            if (currentIndex > achievementsByExercise[progression.exercise].maxIndex) {
                achievementsByExercise[progression.exercise].maxLevel = progression.level;
                achievementsByExercise[progression.exercise].maxIndex = currentIndex;
            }
            achievementsByExercise[progression.exercise].userCount++;
        }
    });

    Object.values(achievementsByExercise).forEach(achievement => {
        const achievementCard = `
            <div class="exercise-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${achievement.exercise}</strong><br>
                        <small>Nivel máximo alcanzado</small>
                    </div>
                    <div class="record-badge">${achievement.maxLevel}</div>
                </div>
                <div class="mt-2">
                    <small>Usuarios: ${achievement.userCount}</small>
                    <button class="btn btn-sm btn-outline-info ms-2" onclick="showExerciseGifModal('${achievement.exercise}')" 
                            title="Ver demostración">
                        <i class="fas fa-play-circle"></i>
                    </button>
                </div>
            </div>
        `;
        achievementsList.append(achievementCard);
    });

    $('#totalProgressions').text(progressions.length);
    const masteryCount = progressions.filter(p => p.level.includes("Dominado") || p.level.includes("completo")).length;
    $('#masteryCount').text(masteryCount);
    const regressionCount = progressions.filter(p => p.level.includes("asistido") || p.level.includes("parcial")).length;
    $('#regressionCount').text(regressionCount);

    const totalProgressions = progressions.length;
    const progressPercentage = totalProgressions > 0 ? (masteryCount / totalProgressions) * 100 : 0;
    $('#overallProgress').css('width', `${progressPercentage}%`);
}

function viewUserProgress(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const userRM = rmRecords.filter(r => r.userId === userId);
    const userProgressions = progressions.filter(p => p.userId === userId);

    let content = `
        <div class="text-center mb-4">
            <div class="user-avatar mx-auto mb-2" style="width: 60px; height: 60px; font-size: 1.5rem;">${user.name.charAt(0)}</div>
            <h4>${user.name}</h4>
            <p class="text-muted">${user.category} • ${user.weight} kg</p>
        </div>

        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">Records de RM</h6>
                    </div>
                    <div class="card-body">
    `;

    if (userRM.length > 0) {
        const maxByExercise = {};
        userRM.forEach(record => {
            if (!maxByExercise[record.exercise] || record.rm > maxByExercise[record.exercise].rm) {
                maxByExercise[record.exercise] = record;
            }
        });

        Object.values(maxByExercise).forEach(record => {
            content += `
                <div class="mb-3">
                    <div class="d-flex justify-content-between">
                        <strong>${record.exercise}</strong>
                        <span class="text-primary">${record.rm.toFixed(1)} kg</span>
                    </div>
                    <small class="text-muted">${formatDate(record.date)} - ${record.weight} kg × ${record.reps} reps</small>
                </div>
            `;
        });
    } else {
        content += '<p class="text-muted text-center">No hay registros de RM</p>';
    }

    content += `
            </div>
        </div>
    </div>

    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">Progresiones Actuales</h6>
            </div>
            <div class="card-body">
    `;

    if (userProgressions.length > 0) {
        const lastByExercise = {};
        userProgressions.forEach(progression => {
            if (!lastByExercise[progression.exercise] || 
                new Date(progression.date) > new Date(lastByExercise[progression.exercise].date)) {
                lastByExercise[progression.exercise] = progression;
            }
        });

        Object.values(lastByExercise).forEach(progression => {
            const exercise = exercises.find(ex => ex.name === progression.exercise);
            content += `
                <div class="mb-3">
                    <div class="d-flex justify-content-between">
                        <strong>${progression.exercise}</strong>
                        <span class="badge bg-primary">${progression.level}</span>
                    </div>
                    ${progression.nextGoal ? `<small>Próximo: ${progression.nextGoal}</small><br>` : ''}
                    <small class="text-muted">${formatDate(progression.date)}</small>
                </div>
            `;
        });
    } else {
        content += '<p class="text-muted text-center">No hay progresiones registradas</p>';
    }

    content += `
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h6 class="mb-0">Progresión Detallada por Ejercicio</h6>
    </div>
    <div class="card-body">
    `;

    const gymnasticExercises = exercises.filter(ex => ex.category === "gimnastic");
    gymnasticExercises.forEach(exercise => {
        const exerciseProgressions = userProgressions
            .filter(p => p.exercise === exercise.name)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (exerciseProgressions.length > 0) {
            content += `
                <div class="mb-4">
                    <h6>${exercise.name}</h6>
                    <div class="progression-timeline">
            `;

            exercise.progressions.forEach((prog, index) => {
                const userProgression = exerciseProgressions.find(p => p.level === prog);
                const isCurrent = userProgression && 
                    (!exerciseProgressions[index + 1] || 
                     exerciseProgressions[index + 1].level !== prog);

                content += `
                    <div class="progression-item ${isCurrent ? 'current-progression' : ''}">
                        ${prog}
                        ${userProgression ? `<small class="text-muted d-block">${formatDate(userProgression.date)}</small>` : ''}
                    </div>
                `;
            });

            content += `</div></div>`;
        }
    });

    content += `
        </div>
    </div>
    `;

    $('#progressContent').html(content);
    $('#progressModal').modal('show');
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    $('#userId').val(user.id);
    $('#userName').val(user.name);
    $('#userPhone').val(user.phone);
    $('#userCategory').val(user.category);
    $('#userWeight').val(user.weight);
    $('#userNotes').val(user.notes);

    $('#userModalLabel').html('<i class="fas fa-user-edit"></i> Editar Usuario');
    $('#userModal').modal('show');
}

async function deleteUser(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario? También se eliminarán sus registros de RM y progresiones.')) return;

    const res = await apiCall('deleteUser', { id: userId });
    if (!res || !res.success) {
        alert((res && res.message) || 'No se pudo eliminar el usuario.');
        return;
    }

    await Promise.all([refreshUsers(), refreshRM(), refreshProgressions()]);
    loadUsers();
    loadRMRecords();
    loadProgressions();
    loadWhatsAppUsers();
    updateStats();
}

async function deleteRMRecord(recordId) {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;

    const res = await apiCall('deleteRM', { id: recordId });
    if (!res || !res.success) {
        alert((res && res.message) || 'No se pudo eliminar el registro.');
        return;
    }

    await refreshRM();
    loadRMRecords();
    updateStats();
}

async function deleteProgression(progressionId) {
    if (!confirm('¿Está seguro de eliminar esta progresión?')) return;

    const res = await apiCall('deleteProgression', { id: progressionId });
    if (!res || !res.success) {
        alert((res && res.message) || 'No se pudo eliminar la progresión.');
        return;
    }

    await refreshProgressions();
    loadProgressions();
    updateStats();
}

function updateUserSelects() {
    $('#rmUser, #progressionUser, #filterRMUser, #filterProgressionUser').empty();
    $('#rmUser, #progressionUser').append('<option value="">Seleccionar usuario</option>');
    $('#filterRMUser, #filterProgressionUser').append('<option value="">Todos los usuarios</option>');

    users.filter(u => u.active).forEach(user => {
        $('#rmUser, #progressionUser').append(`<option value="${user.id}">${user.name}</option>`);
        $('#filterRMUser, #filterProgressionUser').append(`<option value="${user.id}">${user.name}</option>`);
    });
    updateTrackUsers();
}

function resetUserForm() {
    $('#userForm')[0].reset();
    $('#userId').val('');
    $('#userPhoneError').hide();
    $('#userModalLabel').html('<i class="fas fa-user-plus"></i> Registrar Nuevo Usuario');
}

function resetRMForm() {
    $('#rmForm')[0].reset();
    $('#rmDate').val(new Date().toISOString().split('T')[0]);
    $('#estimatedRM').text('0');
    $('#rmExerciseGifContainer').hide();
}

function resetProgressionForm() {
    $('#progressionForm')[0].reset();
    $('#progressionDate').val(new Date().toISOString().split('T')[0]);
    $('#nextGoal').empty().append('<option value="">Seleccionar próxima progresión</option>');
    $('#progressionExerciseGifContainer').hide();
}

function searchUsers(query) {
    query = query.toLowerCase();
    $('#usersList tr').each(function() {
        const text = $(this).text().toLowerCase();
        $(this).toggle(text.indexOf(query) > -1);
    });
}

function filterRMRecords() {
    loadRMRecords();
}

function filterProgressions() {
    loadProgressions();
}

function exportData() {
    const data = {};

    if (users.length > 0) {
        data.Usuarios = users.map(user => ({
            'ID': user.id,
            'Nombre': user.name,
            'Teléfono': user.phone,
            'Categoría': user.category,
            'Peso (kg)': user.weight,
            'Notas': user.notes,
            'Fecha Creación': formatDate(user.createdAt),
            'Estado': user.active ? 'Activo' : 'Inactivo'
        }));
    }

    if (rmRecords.length > 0) {
        data.RM_Levantamiento = rmRecords.map(record => ({
            'ID': record.id,
            'Usuario': record.userName,
            'Ejercicio': record.exercise,
            'Peso (kg)': record.weight,
            'Repeticiones': record.reps,
            '1RM (kg)': record.rm.toFixed(1),
            'Fecha': formatDate(record.date),
            'Notas': record.notes
        }));
    }

    if (progressions.length > 0) {
        data.Progresiones = progressions.map(progression => ({
            'ID': progression.id,
            'Usuario': progression.userName,
            'Ejercicio': progression.exercise,
            'Nivel Alcanzado': progression.level,
            'Fecha': formatDate(progression.date),
            'Detalles': progression.details,
            'Próxima Meta': progression.nextGoal
        }));
    }

    if (Object.keys(data).length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const wb = XLSX.utils.book_new();

    Object.keys(data).forEach(sheetName => {
        const ws = XLSX.utils.json_to_sheet(data[sheetName]);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const fileName = `AntologiaBox23_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    $('#infoLastBackup').text(formatDate(new Date()));
    localStorage.setItem('antologia_lastBackup', new Date().toISOString());

    alert('Datos exportados exitosamente');
}

function quickExport() {
    exportData();
}

function updateStats() {
    $('#infoTotalUsers').text(users.length);
    $('#infoTotalUsers2').text(users.length);
    $('#infoTotalRM').text(rmRecords.length);
    $('#infoTotalRM2').text(rmRecords.length);
    $('#infoTotalProgressions').text(progressions.length);
    $('#infoTotalProgressions2').text(progressions.length);

    const lastBackup = localStorage.getItem('antologia_lastBackup');
    if (lastBackup) {
        $('#infoLastBackup').text(formatDate(lastBackup));
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
