import { useState, useEffect } from 'react';
import axios from 'axios';
import './Calendario.css';


const API_URL = "http://127.0.0.1:8000/api/eventos/";

const Calendario = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventos, setEventos] = useState([]); // Eventos desde Django
  const [modalAbierto, setModalAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const ano = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  const mesesAnio = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const totalDiasMes = new Date(ano, mes + 1, 0).getDate();
  const primerDiaSemana = new Date(ano, mes, 1).getDay();
  const espaciosVacios = Array.from({ length: primerDiaSemana });
  const diasDelMes = Array.from({ length: totalDiasMes }, (_, i) => i + 1);


  const obtenerEventos = async () => {
    try {
      const respuesta = await axios.get(API_URL);
      setEventos(respuesta.data); 
    } catch (error) {
      console.error("Error al traer los eventos de Django:", error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerEventos();
    };
    cargarDatos();
  }, []); 

  
  const mesAnterior = () => setFechaActual(new Date(ano, mes - 1, 1));
  const mesSiguiente = () => setFechaActual(new Date(ano, mes + 1, 1));

  const abrirFormularioCrear = (dia) => {
    setDiaSeleccionado(dia);
    setTitulo('');
    setDescripcion('');
    setModalAbierto(true);
  };


  const guardarEvento = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const fechaEvento = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`;

    const nuevoEvento = {
      titulo: titulo,
      descripcion: descripcion,
      fecha: fechaEvento
    };

    try {
      await axios.post(API_URL, nuevoEvento);
      setModalAbierto(false);
      obtenerEventos();  
    } catch (error) {
      console.error("Error al guardar el evento en Django:", error);
    }
  };

  return (
    <div className="calendar-container">
      
       <div className="calendar-header">
        <button className="btn-nav" onClick={mesAnterior}>{"<"}</button>
        <h2>{mesesAnio[mes]} {ano}</h2>
        <button className="btn-nav" onClick={mesSiguiente}>{">"}</button>
      </div>

       <div className="weekdays-grid">
        <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
      </div>

       <div className="days-grid">
        {espaciosVacios.map((_, index) => (
          <div key={`empty-${index}`} className="day-empty"></div>
        ))}

        {diasDelMes.map((dia) => {
          const esHoy = dia === new Date().getDate() && mes === new Date().getMonth() && ano === new Date().getFullYear();
          const fechaCelda = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const eventosDelDia = eventos.filter(ev => ev.fecha === fechaCelda);

          return (
            <div 
              key={dia} 
              className={`day-card ${esHoy ? 'today' : ''}`}
              onClick={() => abrirFormularioCrear(dia)}
            >
              <span className="day-number">{dia}</span>
              
              <div className="events-container">
                {eventosDelDia.map(ev => (
                  <div key={ev.id} className="event-badge" title={ev.descripcion}>
                    {ev.titulo}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

       {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar Evento para el {diaSeleccionado} de {mesesAnio[mes]}</h3>
            
            <form onSubmit={guardarEvento}>
              <div className="form-group">
                <label>Título del evento:</label>
                <input 
                  type="text" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  required 
                  placeholder="Ej. Examen de Programación Web"
                />
              </div>

              <div className="form-group">
                <label>Descripción:</label>
                <textarea 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles del evento..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Calendario;




  