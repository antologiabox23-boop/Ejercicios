// ==================== FUNCIONES PARA GIFs ====================

function showExerciseGif(exerciseName, type) {
    // Buscar el ejercicio para obtener su GIF
    let exercise = exercises.find(ex => ex.name === exerciseName && ex.category === "gimnastic");

    // Si no se encuentra en ejercicios gimnásticos, buscar en levantamiento
    if (!exercise && type === 'rm') {
        exercise = exercises.find(ex => ex.name === exerciseName && ex.category === "weightlifting");
    }

    const containerId = `#${type}ExerciseGifContainer`;
    const gifId = `#${type}ExerciseGif`;
    const placeholderId = `#${type}ExerciseGifPlaceholder`;

    if (exercise && exercise.video) {
        $(gifId).attr('src', exercise.video).show()[0].load();
        $(placeholderId).hide();
        $(containerId).show();

        // Agregar información del ejercicio
        $(containerId + ' .exercise-gif-container').append(`
            <small class="text-muted mt-2 d-block">
                <i class="fas fa-info-circle"></i> 
                ${exercise.category === 'gimnastic' ? 'Ejercicio gimnástico' : 'Ejercicio de levantamiento'}
            </small>
        `);
    } else {
        $(gifId).hide();
        $(placeholderId).show().html(`
            <i class="fas fa-question-circle fa-2x mb-2"></i><br>
            <small>No hay video disponible para "${exerciseName}"</small>
        `);
        $(containerId).show();
    }
}

function showExerciseGifModal(exerciseName) {
    const exercise = exercises.find(ex => ex.name === exerciseName);

    $('#exerciseGifName').text(exerciseName);

    if (exercise && exercise.video) {
        $('#exerciseGifPreview').attr('src', exercise.video).show()[0].load();
        $('#exerciseGifPlaceholder').hide();
    } else {
        $('#exerciseGifPreview').hide();
        $('#exerciseGifPlaceholder').show().html(`
            <i class="fas fa-question-circle fa-3x mb-3"></i><br>
            <p>No hay video disponible para "${exerciseName}"</p>
            <small class="text-muted">Busca el ejercicio en YouTube para ver técnicas correctas</small>
        `);
    }

    $('#exerciseGifModal').modal('show');
}
