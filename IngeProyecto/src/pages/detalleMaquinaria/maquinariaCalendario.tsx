import React, { useState } from 'react';
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
}) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      {rol !== 'administrador' && (
        <div className="mb-3">
          <div className="alert alert-info text-center p-2 mb-3" style={{ fontSize: '1rem' }}>
            El mínimo de días para la reserva es de <b>7 días</b>.
          </div>
          <DatePicker
            selectsRange
            startDate={fechaInicio}
            endDate={fechaFin}
            onChange={(update) => {
              if (Array.isArray(update)) {
                const [start, end] = update;
                if (start && end) {
                  // Generar todas las fechas del rango seleccionado
                  const datesInRange: Date[] = [];
                  let current = new Date(start);
                  while (current <= end) {
                    datesInRange.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                  }
                  // Verificar si alguna fecha del rango está reservada
                  const haySolapamiento = datesInRange.some(date =>
                    fechasReservadas.some(res =>
                      date.toDateString() === res.toDateString()
                    )
                  );
                  if (haySolapamiento) {
                    setError('El rango seleccionado incluye fechas ya reservadas.');
                    return;
                  }
                }
                setError(null); // Limpiar error si el rango es válido
                setRangoFechas(update as [Date | null, Date | null]);
              }
            }}
            inline
            monthsShown={1}
            dateFormat="yyyy/MM/dd"
            className="form-control"
            minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
            excludeDates={fechasReservadas}
          />
          {error && (
            <div className="alert alert-danger mt-2 p-2 text-center">
              {error}
            </div>
          )}
          <div className="mt-2 text-start">
            <span className="fw-bold" style={{ color: "#198754", fontSize: "1.2rem" }}>
              {diasSeleccionados > 0
                ? `Monto total: $${montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                : 'Seleccioná un rango de fechas'}
            </span>
          </div>
          <button
            className="btn btn-danger fw-bold"
            style={{ fontSize: '1rem', padding: '8px 20px', alignSelf: 'start' }}
            onClick={handleAlquilar}
          >
            Reservar
          </button>
        </div>
      )}
    </>
  );
};

export default MaquinariaCalendario;