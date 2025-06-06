import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export interface Maquinaria {
  nombre: string;
  descripcion: string;
  foto: string;
  precio: number;
  codigo: string;
  politicas_reembolso?: string;
  categoria_id?: number;
  categoria?: string;
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

    const storedRol = localStorage.getItem('usuarioRol');
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
    navigate
  };
}