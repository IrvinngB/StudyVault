// Simulación de un servicio para obtener notas del curso
export const fetchCourseNotes = async () => {
  // Aquí se simula una llamada a una API o base de datos
  return [
    {
      id: '1',
      title: 'Introducción al curso',
      content: 'Esta es una nota introductoria.',
      tags: ['introducción'],
      local_files_path: '',
      attachments: [],
      is_favorite: false,
    },
    {
      id: '2',
      title: 'Tema 1: Fundamentos',
      content: 'Detalles sobre los fundamentos.',
      tags: ['fundamentos'],
      local_files_path: '',
      attachments: [],
      is_favorite: false,
    },
    {
      id: '3',
      title: 'Tema 2: Avanzado',
      content: 'Información avanzada del tema.',
      tags: ['avanzado'],
      local_files_path: '',
      attachments: [],
      is_favorite: false,
    },
  ];
};
