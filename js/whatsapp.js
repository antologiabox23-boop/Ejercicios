// ==================== FUNCIONES PARA WHATSAPP ====================

function loadWhatsAppUsers() {
    const select = $('#whatsappUserSelect');
    select.empty();
    select.append('<option value="all">Todos los usuarios</option>');
    users.forEach(user => {
        select.append(`<option value="${user.id}">${user.name}</option>`);
    });
}

function generateCSVData() {
    const userId = $('#whatsappUserSelect').val();
    const dataType = $('#whatsappDataType').val();

    let csvContent = "";

    if (userId === "all") {
        // Todos los usuarios
        if (dataType === "summary" || dataType === "all") {
            csvContent += "RESUMEN DE USUARIOS\n";
            csvContent += "Nombre,Telefono,Categoria,Peso (kg),Notas\n";
            users.forEach(user => {
                csvContent += `"${user.name}","${user.phone}","${user.category}",${user.weight},"${user.notes || ''}"\n`;
            });
            csvContent += "\n";
        }

        if (dataType === "rm" || dataType === "all") {
            csvContent += "REGISTROS DE RM\n";
            csvContent += "Usuario,Ejercicio,Peso (kg),Repeticiones,1RM (kg),Fecha,Notas\n";
            rmRecords.forEach(record => {
                csvContent += `"${record.userName}","${record.exercise}",${record.weight},${record.reps},${record.rm.toFixed(1)},"${record.date}","${record.notes || ''}"\n`;
            });
            csvContent += "\n";
        }

        if (dataType === "progressions" || dataType === "all") {
            csvContent += "PROGRESIONES\n";
            csvContent += "Usuario,Ejercicio,Nivel,Fecha,Detalles,Proxima Meta\n";
            progressions.forEach(progression => {
                csvContent += `"${progression.userName}","${progression.exercise}","${progression.level}","${progression.date}","${progression.details || ''}","${progression.nextGoal || ''}"\n`;
            });
        }
    } else {
        // Usuario específico
        const user = users.find(u => u.id === userId);
        if (!user) return "";

        csvContent += `DATOS DE ${user.name.toUpperCase()}\n`;
        csvContent += `Telefono: ${user.phone}, Categoria: ${user.category}, Peso: ${user.weight}kg\n\n`;

        if (dataType === "summary" || dataType === "all" || dataType === "rm") {
            csvContent += "REGISTROS DE RM\n";
            csvContent += "Ejercicio,Peso (kg),Repeticiones,1RM (kg),Fecha,Notas\n";
            const userRM = rmRecords.filter(r => r.userId === userId);
            userRM.forEach(record => {
                csvContent += `"${record.exercise}",${record.weight},${record.reps},${record.rm.toFixed(1)},"${record.date}","${record.notes || ''}"\n`;
            });
            csvContent += "\n";
        }

        if (dataType === "summary" || dataType === "all" || dataType === "progressions") {
            csvContent += "PROGRESIONES\n";
            csvContent += "Ejercicio,Nivel,Fecha,Detalles,Proxima Meta\n";
            const userProgressions = progressions.filter(p => p.userId === userId);
            userProgressions.forEach(progression => {
                csvContent += `"${progression.exercise}","${progression.level}","${progression.date}","${progression.details || ''}","${progression.nextGoal || ''}"\n`;
            });
        }

        // Agregar records personales
        if (dataType === "summary" || dataType === "all") {
            csvContent += "\nRECORDS PERSONALES\n";
            csvContent += "Ejercicio,1RM Maximo (kg),Fecha\n";

            // Encontrar máximo por ejercicio
            const recordsByExercise = {};
            rmRecords.filter(r => r.userId === userId).forEach(record => {
                if (!recordsByExercise[record.exercise] || record.rm > recordsByExercise[record.exercise].rm) {
                    recordsByExercise[record.exercise] = record;
                }
            });

            Object.values(recordsByExercise).forEach(record => {
                csvContent += `"${record.exercise}",${record.rm.toFixed(1)},"${record.date}"\n`;
            });
        }
    }

    return csvContent;
}

function updateCSVPreview() {
    const csvContent = generateCSVData();
    const preview = $('#csvPreview');

    if (csvContent.length > 1000) {
        preview.text(csvContent.substring(0, 1000) + "\n\n... (continuación en el archivo completo)");
    } else {
        preview.text(csvContent);
    }

    // Actualizar texto informativo
    const userId = $('#whatsappUserSelect').val();
    const dataType = $('#whatsappDataType').val();
    const includeCSV = $('#includeCSV').is(':checked');

    let infoText = "El mensaje se enviará al instructor (3208009736). ";

    if (userId === "all") {
        infoText += "Se enviarán datos de todos los usuarios. ";
    } else {
        const user = users.find(u => u.id === userId);
        if (user) {
            infoText += `Se enviarán datos de ${user.name}. `;
        }
    }

    if (includeCSV) {
        infoText += "Los datos CSV se incluirán en el mensaje.";
    } else {
        infoText += "Solo se enviará un resumen.";
    }

    $('#whatsappInfoText').text(infoText);
}

function downloadCSV() {
    const csvContent = generateCSVData();
    if (!csvContent) {
        alert("No hay datos para descargar");
        return;
    }

    const userId = $('#whatsappUserSelect').val();
    const user = users.find(u => u.id === userId);
    const filename = userId === "all" 
        ? `AntologiaBox23_Datos_Completos_${new Date().toISOString().split('T')[0]}.csv`
        : `AntologiaBox23_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Archivo ${filename} descargado correctamente`);
}

function sendWhatsApp() {
    const phone = '+573208009736';
    const customMessage = $('#whatsappMessage').val() || "Datos de entrenamiento Antología Box23";
    const includeCSV = $('#includeCSV').is(':checked');
    const csvContent = generateCSVData();

    if (!csvContent) {
        alert("No hay datos para enviar");
        return;
    }

    let fullMessage = customMessage;

    if (includeCSV) {
        // Limitar el tamaño del mensaje para WhatsApp (aproximadamente 4000 caracteres)
        const maxLength = 3500; // Dejamos margen para el mensaje personalizado
        if (csvContent.length + customMessage.length > maxLength) {
            const truncatedCSV = csvContent.substring(0, maxLength - customMessage.length - 100) + "\n\n... (mensaje truncado por límite de WhatsApp)";
            fullMessage += "\n\n" + truncatedCSV;
        } else {
            fullMessage += "\n\n" + csvContent;
        }
    } else {
        // Solo resumen
        const userId = $('#whatsappUserSelect').val();
        if (userId === "all") {
            fullMessage += `\n\nResumen Antología Box23:\n`;
            fullMessage += `Usuarios: ${users.length}\n`;
            fullMessage += `Registros RM: ${rmRecords.length}\n`;
            fullMessage += `Progresiones: ${progressions.length}\n`;
            fullMessage += `Fecha: ${formatDate(new Date())}`;
        } else {
            const user = users.find(u => u.id === userId);
            if (user) {
                const userRM = rmRecords.filter(r => r.userId === userId);
                const userProgressions = progressions.filter(p => p.userId === userId);

                fullMessage += `\n\nResumen de ${user.name}:\n`;
                fullMessage += `Categoría: ${user.category}\n`;
                fullMessage += `Peso: ${user.weight} kg\n`;
                fullMessage += `Registros RM: ${userRM.length}\n`;
                fullMessage += `Progresiones: ${userProgressions.length}\n`;

                // Top 3 records
                const topRecords = userRM.sort((a, b) => b.rm - a.rm).slice(0, 3);
                if (topRecords.length > 0) {
                    fullMessage += `\nTop 3 Records:\n`;
                    topRecords.forEach(record => {
                        fullMessage += `- ${record.exercise}: ${record.rm.toFixed(1)} kg\n`;
                    });
                }
            }
        }
    }

    // Codificar para URL
    const encodedMessage = encodeURIComponent(fullMessage);

    // Usar wa.me para mejor compatibilidad
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    // Abrir en nueva ventana
    window.open(whatsappUrl, '_blank');

    // Cerrar modal
    $('#whatsappModal').modal('hide');

    // Resetear formulario
    $('#whatsappMessage').val('');
    $('#whatsappUserSelect').val('all');
    $('#whatsappDataType').val('summary');
    $('#includeCSV').prop('checked', true);
}
