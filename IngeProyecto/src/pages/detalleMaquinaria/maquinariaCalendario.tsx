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
  reservarParaCliente: boolean;
  abrirInputEmail: () => void;
  mostrarInputEmail: boolean;
  setEmailCliente: (email: string) => void;
  emailCliente: string;
  confirmarReservaCliente: () => void;
  errorEmailCliente: string | null;
  confirmacionReservaCliente: string | null;
  setShowFechaModal: (show: boolean) => void;
  envio: boolean;
  setEnvio: (v: boolean) => void;
  direccion: string;
  setDireccion: (v: string) => void;
  showDireccionError: boolean;
  setShowDireccionError: (v: boolean) => void;
  setShowMinDiasError: (show: boolean) => void;
  setConfirmacionReservaCliente: (v: string) => void;
}

const MaquinariaCalendario: React.FC<Props> = ({
  rol, fechaInicio, fechaFin, setRangoFechas, fechasReservadas, diasSeleccionados, montoTotal, handleAlquilar,
  reservarParaCliente, abrirInputEmail, mostrarInputEmail, setEmailCliente, emailCliente, confirmarReservaCliente, errorEmailCliente, confirmacionReservaCliente, setShowFechaModal,
  envio, setEnvio, direccion, setDireccion, showDireccionError, setShowDireccionError, setShowMinDiasError, setConfirmacionReservaCliente
}) => {
  const [error, setError] = useState<string | null>(null);
  const [errorReserva, setErrorReserva] = useState<string | null>(null);

  const handleAbrirInputEmail = () => {
    if (!fechaInicio || !fechaFin) {
      setShowFechaModal(true);
      return;
    }
    if (diasSeleccionados < 7) {
      setShowMinDiasError(true);
      return;
    }
    abrirInputEmail();
  };

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
          {diasSeleccionados > 0 && (
            <div className="mt-2 text-start">
              <span className="fw-bold" style={{ color: '#198754', fontSize: '1.1rem' }}>
                Monto total: ${montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {rol === null ? (
            <div className="alert alert-warning text-center p-2 mt-3 mb-3" style={{ fontSize: '1rem' }}>
              Debes iniciar sesión para poder reservar.
            </div>
          ) : (
            <>
              <div className="form-check mb-3 mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="envioCheckbox"
                  checked={envio}
                  onChange={e => {
                    setEnvio(e.target.checked);
                    if (!e.target.checked) setDireccion('');
                    setShowDireccionError(false);
                  }}
                />
                <label className="form-check-label fw-bold" htmlFor="envioCheckbox" style={{ fontSize: '1.1rem' }}>
                  Envío
                </label>
              </div>
              {envio && (
                <div className="mb-4">
                  <label htmlFor="direccionEnvio" className="form-label">Dirección de envío:</label>
                  <input
                    type="text"
                    id="direccionEnvio"
                    className="form-control"
                    value={direccion}
                    onChange={e => {
                      setDireccion(e.target.value);
                      setShowDireccionError(false);
                    }}
                    placeholder="Ingresá la dirección"
                  />
                  {showDireccionError && (
                    <div className="text-danger mt-1">Debes ingresar una dirección para el envío.</div>
                  )}
                </div>
              )}
              <button
                className="btn btn-danger fw-bold"
                style={{ fontSize: '1rem', padding: '8px 20px', alignSelf: 'start' }}
                onClick={() => {
                  if (!fechaInicio || !fechaFin) {
                    setShowFechaModal(true);
                    return;
                  }
                  handleAlquilar();
                }}
                disabled={envio && direccion.trim() === ''}
              >
                Reservar
              </button>
              {errorReserva && (
                <div className="text-danger mt-1">{errorReserva}</div>
              )}
              {rol === 'empleado' && reservarParaCliente && (
                <div className="mt-3 d-flex flex-column align-items-start">
                  <button
                    className="btn btn-secondary fw-bold"
                    style={{ fontSize: '1rem', padding: '8px 20px' }}
                    onClick={handleAbrirInputEmail}
                  >
                    Reservar para cliente
                  </button>
                  {mostrarInputEmail && (
                    <div className="mt-2 w-100">
                      <input
                        type="email"
                        className="form-control mb-2"
                        placeholder="Email del cliente"
                        value={emailCliente}
                        onChange={e => setEmailCliente(e.target.value)}
                      />
                      <button
                        className="btn btn-success w-100"
                        onClick={confirmarReservaCliente}
                        disabled={!emailCliente || (envio && direccion.trim() === '')}
                      >
                        Confirmar reserva para cliente
                      </button>
                      {errorEmailCliente && (
                        <div className="text-danger mt-1">{errorEmailCliente}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default MaquinariaCalendario;