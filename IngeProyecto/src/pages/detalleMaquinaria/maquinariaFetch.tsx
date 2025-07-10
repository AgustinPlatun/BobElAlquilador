import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export interface Maquinaria {
  id: number;
  nombre: string;
  descripcion: string;
  foto: string;
  precio: number;
  codigo: string;
  politicas_reembolso?: number;
  categoria_id?: number;
  categoria?: string;
  mantenimiento: boolean;
  calificaciones?: {
    promedio: number;
    total_calificaciones: number;
    calificaciones: Array<{
      id: number;
      puntaje: number;
      comentario: string;
      fecha: string;
      usuario_id: number;
      usuario_nombre: string;
    }>;
  };
  preguntas?: Array<{
    id: number;
    pregunta: string;
    respuesta: string | null;
    fecha_pregunta: string;
    fecha_respuesta: string | null;
    usuario_id: number;
    usuario_nombre: string;
    empleado_id: number | null;
    empleado_nombre: string | null;
    usuario_email: string;
    empleado_email: string | null;
  }>;
  historial_mantenimiento?: Array<{
    id: number;
    descripcion: string;
    fecha: string;
    empleado_id: number;
    empleado_nombre: string;
    empleado_email: string;
  }>;
}

export function useDetalleMaquinariaContent() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [maquinaria, setMaquinaria] = useState<Maquinaria | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPrecio, setEditPrecio] = useState(0);
  const [editFoto, setEditFoto] = useState<File | null>(null);
  const [editPoliticas, setEditPoliticas] = useState('');
  const [editCategoriaId, setEditCategoriaId] = useState('');
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [editError, setEditError] = useState('');
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [rangoFechas, setRangoFechas] = useState<[Date | null, Date | null]>([null, null]);
  const [fechasReservadas, setFechasReservadas] = useState<Date[]>([]);
  const [showCalificacionModal, setShowCalificacionModal] = useState(false);
  const [calificacionPuntaje, setCalificacionPuntaje] = useState(0);
  const [calificacionComentario, setCalificacionComentario] = useState('');
  const [showPreguntaModal, setShowPreguntaModal] = useState(false);
  const [preguntaTexto, setPreguntaTexto] = useState('');
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState<number | null>(null);
  const [showMantenimientoModal, setShowMantenimientoModal] = useState(false);
  const [mantenimientoDescripcion, setMantenimientoDescripcion] = useState('');
  const [calificacionError, setCalificacionError] = useState<string | null>(null);
  const [justCalified, setJustCalified] = useState(false);

  useEffect(() => {
    setNoEncontrada(false);
    fetch('http://localhost:5000/maquinarias')
      .then(res => res.json())
      .then(data => {
        const found = data.find((m: Maquinaria) => m.codigo === codigo);
        if (found) {
          if (found.categoria_id) {
            fetch('http://localhost:5000/categorias-activas')
              .then(res => res.json())
              .then(cats => {
                const cat = cats.find((c: { id: number }) => c.id === found.categoria_id);
                setMaquinaria({ ...found, categoria: cat ? cat.nombre : '-' });
                // Cargar calificaciones
                fetch(`http://localhost:5000/calificaciones-maquinaria/${codigo}`)
                  .then(res => res.json())
                  .then(calificaciones => {
                    // Cargar preguntas
                    fetch(`http://localhost:5000/preguntas-maquinaria/${codigo}`)
                      .then(res => res.json())
                      .then(preguntas => {
                        // Cargar historial de mantenimiento
                        fetch(`http://localhost:5000/historial-mantenimiento/${codigo}`)
                          .then(res => res.json())
                          .then(historial => {
                            setMaquinaria(prev => prev ? { 
                              ...prev, 
                              calificaciones,
                              preguntas,
                              historial_mantenimiento: historial
                            } : null);
                          });
                      });
                  });
              })
              .catch(() => setMaquinaria({ ...found, categoria: '-' }));
          } else {
            setMaquinaria({ ...found, categoria: '-' });
          }
          setNoEncontrada(false);
        } else {
          setNoEncontrada(true);
        }
      });

    const storedRol = sessionStorage.getItem('usuarioRol');
    setRol(storedRol);

    fetch('http://localhost:5000/categorias-activas')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));

    if (codigo) {
      fetch(`http://localhost:5000/fechas-reservadas/${codigo}`)
        .then(res => res.json())
        .then((fechas: string[]) => {
          setFechasReservadas(
            fechas.map(f => new Date(f.length > 10 ? f : `${f}T12:00:00`))
          );
        });
    }
  }, [codigo]);

  // Evitar que el modal de calificación se vuelva a abrir si ya calificó
  const removeCalificarParam = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('calificar') === '1') {
      params.delete('calificar');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      setJustCalified(true);
    }
  };

  const handleCalificacionSubmit = async () => {
    try {
      const usuarioId = sessionStorage.getItem('usuarioId');
      if (!usuarioId) {
        setCalificacionError('Debes iniciar sesión para calificar');
        return;
      }

      const response = await fetch(`http://localhost:5000/calificar-maquinaria/${codigo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puntaje: calificacionPuntaje,
          comentario: calificacionComentario,
          usuario_id: parseInt(usuarioId)
        }),
      });

      if (response.ok) {
        setShowCalificacionModal(false);
        setCalificacionPuntaje(0);
        setCalificacionComentario('');
        setCalificacionError(null);
        // Recargar calificaciones
        const calificacionesResponse = await fetch(`http://localhost:5000/calificaciones-maquinaria/${codigo}`);
        const calificaciones = await calificacionesResponse.json();
        setMaquinaria(prev => prev ? { ...prev, calificaciones } : null);
      } else {
        const error = await response.json();
        setCalificacionError(error.message || 'Error al calificar la maquinaria');
      }
    } catch (error) {
      setCalificacionError('Error al calificar la maquinaria');
    }
  };

  const handlePreguntaSubmit = async () => {
    try {
      const usuarioId = sessionStorage.getItem('usuarioId');
      const usuarioRol = sessionStorage.getItem('usuarioRol');
      
      if (!usuarioId) {
        alert('Debes iniciar sesión para hacer una pregunta');
        return;
      }

      if (usuarioRol !== 'cliente') {
        alert('Solo los clientes pueden hacer preguntas');
        return;
      }

      const response = await fetch(`http://localhost:5000/preguntar-maquinaria/${codigo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pregunta: preguntaTexto,
          usuario_id: parseInt(usuarioId)
        }),
      });

      if (response.ok) {
        setShowPreguntaModal(false);
        setPreguntaTexto('');
        // Recargar preguntas
        const preguntasResponse = await fetch(`http://localhost:5000/preguntas-maquinaria/${codigo}`);
        const preguntas = await preguntasResponse.json();
        setMaquinaria(prev => prev ? { ...prev, preguntas } : null);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al enviar la pregunta');
      }
    } catch (error) {
      alert('Error al enviar la pregunta');
    }
  };

  const handleRespuestaSubmit = async () => {
    if (!preguntaSeleccionada) return;

    try {
      const empleadoId = sessionStorage.getItem('usuarioId');
      const usuarioRol = sessionStorage.getItem('usuarioRol');
      
      if (!empleadoId) {
        alert('Error de autenticación');
        return;
      }

      if (usuarioRol !== 'empleado' && usuarioRol !== 'administrador') {
        alert('Solo los empleados pueden responder preguntas');
        return;
      }

      const response = await fetch(`http://localhost:5000/responder-pregunta/${preguntaSeleccionada}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          respuesta: respuestaTexto,
          empleado_id: parseInt(empleadoId)
        }),
      });

      if (response.ok) {
        setShowPreguntaModal(false);
        setRespuestaTexto('');
        setPreguntaSeleccionada(null);
        // Recargar preguntas
        const preguntasResponse = await fetch(`http://localhost:5000/preguntas-maquinaria/${codigo}`);
        const preguntas = await preguntasResponse.json();
        setMaquinaria(prev => prev ? { ...prev, preguntas } : null);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al enviar la respuesta');
      }
    } catch (error) {
      alert('Error al enviar la respuesta');
    }
  };

  const abrirModalRespuesta = (preguntaId: number, pregunta: string) => {
    setPreguntaSeleccionada(preguntaId);
    setPreguntaTexto(pregunta);
    setRespuestaTexto('');
    setShowPreguntaModal(true);
  };

  const handleMantenimientoSubmit = async () => {
    try {
      const empleadoId = sessionStorage.getItem('usuarioId');
      if (!empleadoId) {
        alert('Error de autenticación');
        return;
      }

      const response = await fetch(`http://localhost:5000/agregar-mantenimiento/${codigo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: mantenimientoDescripcion,
          empleado_id: parseInt(empleadoId)
        }),
      });

      if (response.ok) {
        setMantenimientoDescripcion('');
        // Recargar historial
        const historialResponse = await fetch(`http://localhost:5000/historial-mantenimiento/${codigo}`);
        const historial = await historialResponse.json();
        setMaquinaria(prev => prev ? { ...prev, historial_mantenimiento: historial } : null);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al registrar el mantenimiento');
      }
    } catch (error) {
      alert('Error al registrar el mantenimiento');
    }
  };

  return {
    maquinaria, setMaquinaria,
    rol, setRol,
    showEditModal, setShowEditModal,
    editNombre, setEditNombre,
    editDescripcion, setEditDescripcion,
    editPrecio, setEditPrecio,
    editFoto, setEditFoto,
    editPoliticas, setEditPoliticas,
    editCategoriaId, setEditCategoriaId,
    categorias, setCategorias,
    editError, setEditError,
    noEncontrada, setNoEncontrada,
    rangoFechas, setRangoFechas,
    fechasReservadas, setFechasReservadas,
    navigate,
    showCalificacionModal, setShowCalificacionModal,
    calificacionPuntaje, setCalificacionPuntaje,
    calificacionComentario, setCalificacionComentario,
    handleCalificacionSubmit,
    showPreguntaModal, setShowPreguntaModal,
    preguntaTexto, setPreguntaTexto,
    respuestaTexto, setRespuestaTexto,
    handlePreguntaSubmit,
    handleRespuestaSubmit,
    abrirModalRespuesta,
    preguntaSeleccionada, setPreguntaSeleccionada,
    showMantenimientoModal, setShowMantenimientoModal,
    mantenimientoDescripcion, setMantenimientoDescripcion,
    handleMantenimientoSubmit,
    calificacionError,
    setCalificacionError,
    removeCalificarParam,
    justCalified, setJustCalified
  };
}