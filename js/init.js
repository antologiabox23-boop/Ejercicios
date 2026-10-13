function initializeApp() {
    // Configurar fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    $('#rmDate').val(today);
    $('#progressionDate').val(today);

    // Cargar ejercicios de levantamiento en modal RM
    exercises
        .filter(ex => ex.category === "weightlifting")
        .forEach(exercise => {
            $('#rmExercise').append(`<option value="${exercise.name}">${exercise.name}</option>`);
            $('#filterRMExercise').append(`<option value="${exercise.name}">${exercise.name}</option>`);
        });

    // Cargar ejercicios gimnásticos en modal Progresiones
    exercises
        .filter(ex => ex.category === "gimnastic")
        .forEach(exercise => {
            $('#progressionExercise').append(`<option value="${exercise.name}">${exercise.name}</option>`);
            $('#filterProgressionExercise').append(`<option value="${exercise.name}">${exercise.name}</option>`);
        });

    // Evento para mostrar GIFs de ejercicios
    $('#rmExercise').change(function() {
        const exerciseName = $(this).val();
        showExerciseGif(exerciseName, 'rm');
    });

    $('#progressionExercise').change(function() {
        const exerciseName = $(this).val();
        showExerciseGif(exerciseName, 'progression');
    });

    // Evento para cargar progresiones cuando se selecciona un ejercicio
    $('#progressionExercise').change(function() {
        loadNextGoalOptions();
    });

    // Evento para actualizar nivel cuando se selecciona una progresión
    $('#progressionLevel').change(function() {
        updateNextGoalBasedOnCurrent();
    });

    // Validación de teléfono
    $('#userPhone').on('input', function() {
        validatePhone($(this), $('#userPhoneError'));
    });

    // Cálculo de RM en tiempo real
    $('#rmWeight, #rmReps').on('input', function() {
        calculateRM();
    });

    // Calculadora independiente
    $('#calculateRM').click(function() {
        const weight = parseFloat($('#calcWeight').val()) || 0;
        const reps = parseInt($('#calcReps').val()) || 0;
        if (weight > 0 && reps > 0) {
            const rm = calculate1RM(weight, reps);
            $('#calculatedRM').text(rm.toFixed(1) + ' kg');
        }
    });

    // Guardar usuario
    $('#saveUserBtn').click(function() {
        saveUser();
    });

    // Guardar RM
    $('#saveRMBtn').click(function() {
        saveRM();
    });

    // Guardar progresión
    $('#saveProgressionBtn').click(function() {
        saveProgression();
    });

    // Exportar datos
    $('#exportAllData').click(function() {
        exportData();
    });

    // WhatsApp: eventos para actualizar vista previa
    $('#whatsappUserSelect, #whatsappDataType, #includeCSV, #whatsappMessage').on('change input', function() {
        updateCSVPreview();
    });

    // WhatsApp: descargar CSV
    $('#downloadCSVBtn').click(function() {
        downloadCSV();
    });

    // WhatsApp: enviar por WhatsApp
    $('#sendWhatsAppBtn').click(function() {
        sendWhatsApp();
    });

    // Búsqueda de usuarios
    $('#searchUserInput').on('input', function() {
        searchUsers($(this).val());
    });

    // Filtros RM
    $('#filterRMUser, #filterRMExercise').change(function() {
        filterRMRecords();
    });

    // Filtros progresiones
    $('#filterProgressionUser, #filterProgressionExercise').change(function() {
        filterProgressions();
    });

    // Exportación rápida
    $('#quickExportBtn').click(function() {
        quickExport();
    });

    // Inicializar selects de usuarios en modales
    updateUserSelects();

    // Cargar usuarios en modal WhatsApp
    loadWhatsAppUsers();

    // Confirmar carga de CSV
    $('#confirmCSVUpload').click(function() {
        confirmCSVUpload();
    });

    initTracking();
}
