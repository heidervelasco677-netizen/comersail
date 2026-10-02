import { useState } from 'react';

export default function Compras() {
  // Estado para el dinero total en caja
  const [dineroCaja, setDineroCaja] = useState(0);
  const [inputCaja, setInputCaja] = useState('');

  // Estado para la lista de productos agregados
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Café', peso: 0, precioKg: 0 },
    { id: 2, nombre: 'Cacao', peso: 0, precioKg: 0 }
  ]);

  // Estado para el formulario de nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    peso: '',
    precioKg: ''
  });

  // Establecer el dinero inicial de la compraventa
  const handleGuardarCaja = (e) => {
    e.preventDefault();
    setDineroCaja(Number(inputCaja) || 0);
  };

  // Agregar un nuevo producto a la lista
  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.peso) return;

    const prod = {
      id: Date.now(),
      nombre: nuevoProducto.nombre,
      peso: Number(nuevoProducto.peso) || 0,
      precioKg: Number(nuevoProducto.precioKg) || 0
    };

    setProductos([...productos, prod]);
    setNuevoProducto({ nombre: '', peso: '', precioKg: '' });
  };

  // Cálculos dinámicos de los totales
  const totalPesoAcumulado = productos.reduce((acc, p) => acc + p.peso, 0);
  const valorTotalProductos = productos.reduce((acc, p) => acc + (p.peso * p.precioKg), 0);
  const dineroDisponible = dineroCaja - valorTotalProductos;

  return (
    <div className="container py-4">
      <h2 className="text-success fw-bold text-center mb-2">
        Control de Capital y Productos (CÓMERSAIL)
      </h2>
      <p className="text-center text-muted mb-4">
        Configura tu dinero total en caja y registra los productos con sus pesos para iniciar el seguimiento.
      </p>

      {/* 1. SECCIÓN: CONFIGURAR DINERO TOTAL EN CAJA */}
      <div className="row mb-4 justify-content-center">
        <div className="col-md-8">
          <div className="card p-3 shadow-sm border-0 bg-light">
            <h5 className="fw-bold text-secondary mb-3">1. Establecer Dinero Total en Caja</h5>
            <form onSubmit={handleGuardarCaja} className="row g-2 align-items-center">
              <div className="col-md-8">
                <input
                  type="number"
                  className="form-control form-control-lg"
                  placeholder="Ej: 10000000 (Dinero disponible)"
                  value={inputCaja}
                  onChange={(e) => setInputCaja(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">
                  Definir Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE BALANCE Y CAPITAL GENERAL */}
      <div className="row mb-4 text-center">
        <div className="col-md-4 mb-2">
          <div className="card border-0 shadow-sm bg-primary text-white p-3">
            <small className="text-uppercase text-white-50 fw-bold">Dinero Total Caja</small>
            <h3 className="fw-bold fs-4">${dineroCaja.toLocaleString('es-CO')} COP</h3>
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="card border-0 shadow-sm bg-success text-white p-3">
            <small className="text-uppercase text-white-50 fw-bold">Invertido en Productos</small>
            <h3 className="fw-bold fs-4">${valorTotalProductos.toLocaleString('es-CO')} COP</h3>
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="card border-0 shadow-sm bg-dark text-white p-3">
            <small className="text-uppercase text-white-50 fw-bold">Total Peso Recibido</small>
            <h3 className="fw-bold fs-4">{totalPesoAcumulado.toLocaleString('es-CO')} Kg</h3>
          </div>
        </div>
      </div>

      {/* 3. AGREGAR / REGISTRAR PRODUCTOS CON PESO */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card p-3 shadow-sm border-0">
            <h5 className="fw-bold text-secondary mb-3">2. Agregar Producto</h5>
            <form onSubmit={handleAgregarProducto}>
              <div className="mb-2">
                <label className="form-label fw-bold">Nombre del Producto</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Café Pasilla"
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label fw-bold">Peso (Kg)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ej: 50"
                  value={nuevoProducto.peso}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, peso: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Precio por Kg ($)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ej: 14000"
                  value={nuevoProducto.precioKg}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, precioKg: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-success w-100 fw-bold">
                + Guardar Producto
              </button>
            </form>
          </div>
        </div>

        {/* 4. TARJETAS INDIVIDUALES DE LOS PRODUCTOS CREADOS */}
        <div className="col-md-8">
          <h5 className="fw-bold text-secondary mb-3">3. Productos y sus Cargas</h5>
          <div className="row">
            {productos.map((prod) => {
              const valorProducto = prod.peso * prod.precioKg;
              return (
                <div className="col-md-6 mb-3" key={prod.id}>
                  <div className="card border-0 shadow-sm border-start border-4 border-success p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="fw-bold text-success m-0">{prod.nombre}</h4>
                      <span className="badge bg-success">{prod.peso} Kg</span>
                    </div>
                    <hr className="my-1" />
                    <div className="d-flex justify-content-between mt-2">
                      <span className="text-muted">Precio / Kg:</span>
                      <span className="fw-bold">${prod.precioKg.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted">Valor Total Carga:</span>
                      <span className="fw-bold text-primary">${valorProducto.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}