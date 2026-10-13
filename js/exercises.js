// Datos para procesamiento CSV
let csvUsersData = [];
let csvProcessingResults = [];

// Lista de ejercicios con GIFs demostrativos
const exercises = [
    // Ejercicios Gimnásticos
    { 
        name: "Pull-up", 
        category: "gimnastic",
        progressions: ["Pull-up Australiana", "Pull-up con banda", "Jumping Pull-up", "Pull-up con Kipping", "Pull-up estricto", "Pull-up con peso"],
        video: "pullup.mp4"
    },
    { 
        name: "Push-up", 
        category: "gimnastic",
        progressions: ["Push-up en pared", "Push-up en cajon", "Push-up en rodillas", "Push-up acostandose", "Push-up completo", "Push-up con elevación de pies"],
        video: "pushup.mp4"
    },
    { 
        name: "Burpee", 
        category: "gimnastic",
        progressions: ["Burpee sin push-up", "Burpee completo", "Burpee con salto", "Burpee con pull-up"],
        video: "burpee.mp4"
    },
    { 
        name: "Box Jump", 
        category: "gimnastic",
        progressions: ["Pasos al cajon", "Box jump bajo", "Box jump medio", "Box jump alto"],
        video: "buxjump.mp4"
    },
    { 
        name: "Double Under", 
        category: "gimnastic",
        progressions: ["Single Under", "Doble Under/Single Under", "Doble Under continuo", "CrosOver Doble Under"],
        video: "doubleunder.mp4"
    },
    { 
        name: "Handstand Push-up", 
        category: "gimnastic",
        progressions: ["Pike push-up", "Handstand con cajon", "Handstand push-up Kipping", "Handstand push-up estricto", "Handstand push-up deficit"],
        video: "handstandpushup.mp4"
    },
    { 
        name: "Handstand walk", 
        category: "gimnastic",
        progressions: ["Handstand hold", "Handstand Shoulder Taps", "Handstand wall lateral walking", "Handstand walk corto", "Handstand walk medio", "Handstand walk largo"],
        video: "handstandwalk.mp4"
    },
    { 
        name: "Wall walk", 
        category: "gimnastic",
        progressions: ["Inclinación contra pared", "Wall walk parcial", "Wall walk completo"],
        video: "wallwalk.mp4"
    },
    { 
        name: "Pistol Squat", 
        category: "gimnastic",
        progressions: ["Pistol Squat en cajón", "Pistol Squat con pie atras", "Pistol Squat asistido", "Pistol Squat con elevacion y soporte", "Pistol Squat sin elevacion con soporte", "Pistol Squat libre"],
        video: "pistolsquat.mp4"
    },
    { 
        name: "Toes-to-bar", 
        category: "gimnastic",
        progressions: ["Knee raises", "Toes-to-rig", "Toes-to-bar asistido", "Toes-to-bar completo", "Toes-to-bar enlazado"],
        video: "toestobar"
    },
    { 
        name: "Rope Climb", 
        category: "gimnastic",
        progressions: ["Rope pull", "Rope climb asistido", "Rope climb con piernas", "Rope climb sin piernas"],
        video: "ropeclimb.mp4"
    },
    { 
        name: "Muscle-up", 
        category: "gimnastic",
        progressions: ["Pull-up explosivo", "Transition drills", "Muscle-up con banda", "Muscle-up completo", "Muscle-up completo enlazado", "Muscle-up estricto"],
        video: "muscleup.mp4"
    },

    // Ejercicios de Levantamiento
    { name: "Deadlift", category: "weightlifting", video: "deadlift.mp4" },
    { name: "Snatch", category: "weightlifting", video: "snatch.mp4" },
    { name: "Thruster", category: "weightlifting", video: "thruster.mp4" },
    { name: "Cluster", category: "weightlifting", video: "cluster.mp4" },
    { name: "Clean & Jerk", category: "weightlifting", video: "clean&jerk.mp4" },
    { name: "Push Jerk", category: "weightlifting", video: "pushjerk.mp4" },
    { name: "Split Jerk", category: "weightlifting", video: "splitjerk.mp4" },
    { name: "Front Squat", category: "weightlifting", video: "frontsquat.mp4" },
    { name: "Back Squat", category: "weightlifting", video: "backsquat.mp4" },
    { name: "Bench press", category: "weightlifting", video: "benchpress.mp4" },
    { name: "Clean", category: "weightlifting", video: "clean.mp4" }
];
