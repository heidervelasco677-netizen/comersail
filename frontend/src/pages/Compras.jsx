import { useState } from 'react';

export default function Compras() {
  // estado para productos ndestacados 
  const [producto, setProducto] = useState('Café');
  const [cantidadTotal, setCantidadTotal] = useState('');
  const [productosDestacados, setProductosDestacados] = useState([]);

  // estado para la caha 
  const [montoCaja, setMontoCaja] = useState('');
  const [totalCajaGuardado, setTotalCajaGuardado] = useState([]);

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!cantidadTotal) return;

    const nuevoProducto = {
      id: Date.now(),
      nombre: producto,
      cantidadTotal: Number(cantidadTotal)
    };

    setProductosDestacados([...productosDestacados, nuevoProducto]);
    setCantidadTotal('');
  };

  // guardar el dinero disponible
  const handleGuardarCaja = (e) => {
    e.preventDefault();
    if(!montoCaja) return;

    setTotalCajaGuardado(Number(montoCaja));
    setMontoCaja('');
  }

  return (
    <div className="container py-4">
      {/* Mensaje principal */}
      <div className="text-center mb-4">
        <h3 className="fw-bold text-success mb-2">
          Módulo de Configuración Inicial (CÓMERSAIL)
        </h3>
        <p className="fs-5 text-secondary">
          Por favor ingrese los siguientes datos:
        </p>
      </div>

      {/* Cuadro: Productos Destacados */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm border-0 bg-light">
            <h4 className="fw-bold text-success text-center mb-3">
              📦 Productos Destacados
            </h4>

            <form onSubmit={handleAgregarProducto}>
              <div className="mb-3">
                <label className="form-label fw-bold">Producto</label>
                <select
                  className="form-select form-select-lg"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                >
                  <option value="Café">Coffee</option>
                  <option value="Cacao">Cacao</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Cantidad Total (Kg)</label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  placeholder="Ej: 3000"
                  value={cantidadTotal}
                  onChange={(e) => setCantidadTotal(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100 btn-lg fw-bold mt-2">
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lista de productos destacados ingresados */}
      {productosDestacados.length > 0 && (
        <div className="row justify-content-center mt-4">
          <div className="col-md-6">
            <h5 className="fw-bold text-secondary mb-3">Registrados:</h5>
            <div className="list-group">
              {productosDestacados.map((item) => (
                <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-success fs-5">{item.nombre}</span>
                  <span className="badge bg-success rounded-pill fs-6">
                    {item.cantidadTotal.toLocaleString('es-CO')} Kg
                  </span>
                </div>
              ))}
            </div>
          </div>

           {/*columna de caja*/}
           <div className='col-md-6'>
            <div className='card p-4 shadow-sm border-0 bg-light h-100'>
              <h4 className='fw-bold text-success text-center mb-3'>
                💰 Agregar total en caja
              </h4>

              <form onSubmit={handleGuardarCaja}>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>Monto disponible ($ COP)</label>
                  <div className='input-group input-group-lg'>
                    <span className='input-group-text fw-bold'>$</span>
                    <input 
                        type="number"
                        className='form-control'
                        placeholder='ej: 20000000'
                        value={montoCaja}
                        onChange={(e) => setMontoCaja(e.target.value)}
                        required
                        />
                  </div>
                </div>
              </form>
            </div>
           </div>

        </div>
      )}
    </div>
  );
}