import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  rol: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  setRangoFechas: (r: [Date | null, Date | null]) => void;
  fechasReservadas: Date[];
  diasSeleccionados: number;
  montoTotal: number;
  handleAlquilar: () => void;
}

const MaquinariaCalendario: React.FC<Props> = ({
  rol, fechaInicio, fechaFin, setRangoFechas, fechasReservadas, diasSeleccionados, montoTotal, handleAlquilar
}) => (
  <>
    {rol !== 'administrador' && (
      <div className="mb-3">
        <DatePicker
          selectsRange
          startDate={fechaInicio}
          endDate={fechaFin}
          onChange={(update) => {
            if (Array.isArray(update)) {
              const [start, end] = update;
              if (start && end) {
                const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                if (diff > 6) {
                  const newEnd = new Date(start);
                  newEnd.setDate(start.getDate() + 6);
                  setRangoFechas([start, newEnd]);
                  return;
                }
              }
            }
            setRangoFechas(update as [Date | null, Date | null]);
          }}
          inline
          monthsShown={1}
          dateFormat="yyyy/MM/dd"
          className="form-control"
          minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
          excludeDates={fechasReservadas}
        />
        <div className="mt-2 text-start">
          <span className="fw-bold" style={{ color: "#198754", fontSize: "1.2rem" }}>
            {diasSeleccionados > 0
              ? `Monto total: $${montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
              : 'Seleccioná un rango de fechas'}
          </span>
        </div>
        <button
          className="btn btn-danger fw-bold mb-3"
          style={{ fontSize: '1rem', padding: '8px 20px', alignSelf: 'start' }}
          onClick={handleAlquilar}
        >
          Reservar
        </button>
      </div>
    )}
  </>
);

export default MaquinariaCalendario;