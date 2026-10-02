import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

// Datos de departamentos y municipios para la selección
const UBICACIONES = {
  Huila: ['Garzón', 'Neiva', 'Pitalito', 'Gigante', 'Apepe', 'La Plata'],
  Cauca: ['Popayán', 'Timbío', 'Piendamó', 'Silvia'],
  Tolima: ['Ibagué', 'Espinal', 'Melgar', 'Honda'],
  Nariño: ['Pasto', 'Ipiales', 'Tumaco']
};

export default function Auth() {
  const [esLogin, setEsLogin] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    departamento: 'Huila',
    municipio: 'Garzón',
    rol: 'cliente'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'departamento') {
      // Al cambiar departamento, selecciona automáticamente el primer municipio de la lista
      setFormData({
        ...formData,
        departamento: value,
        municipio: UBICACIONES[value] ? UBICACIONES[value][0] : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = esLogin ? '/auth/login' : '/auth/registro';

    try {
      const res = await API.post(endpoint, formData);

      if (res.data.token) {
        localStorage.setItem('token_comersail', res.data.token);
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

        alert(esLogin ? '¡Sesión iniciada con éxito!' : '¡Cuenta creada correctamente!');
        navigate('/compras');
      }
    } catch (error) {
      console.error('Error en la autenticación:', error);
      alert(error.response?.data?.mensaje || 'Ocurrió un error al procesar la solicitud');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '480px', width: '100%' }}>
        <h2 className="text-center mb-1 text-success fw-bold">CÓMERSAIL</h2>
        <h4 className="text-center mb-4">{esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h4>

        <form onSubmit={handleSubmit}>
          {!esLogin && (
            <div className="mb-3">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={handleChange}
                required={!esLogin}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!esLogin && (
            <>
              <div className="mb-3">
                <label className="form-label">Departamento</label>
                <select
                  name="departamento"
                  className="form-select"
                  value={formData.departamento}
                  onChange={handleChange}
                >
                  {Object.keys(UBICACIONES).map((depto) => (
                    <option key={depto} value={depto}>
                      {depto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Municipio</label>
                <select
                  name="municipio"
                  className="form-select"
                  value={formData.municipio}
                  onChange={handleChange}
                >
                  {UBICACIONES[formData.departamento]?.map((muni) => (
                    <option key={muni} value={muni}>
                      {muni}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Rol de Usuario</label>
                <select
                  name="rol"
                  className="form-select"
                  value={formData.rol}
                  onChange={handleChange}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-success w-100 mt-2 mb-3">
            {esLogin ? 'Ingresar' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={() => setEsLogin(!esLogin)}
          >
            {esLogin
              ? '¿No tienes cuenta? Regístrate aquí'
              : '¿Ya tienes una cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}