import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Auth() {
    const [esLogin, setEsLogin] = useState(false);
    const navigate = useNavigate();

    // Formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        departamento: '',
        municipio: '', 
        rol: '',
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = esLogin ? '/auth/login' : '/auth/registro';

        try {
            // Peticion al backend con servicios axios
            const res = await API.post(endpoint, formData);

            // guardar tokenJWT y datos de usuario
            if (res.data.token) {
                localStorage.setItem('token_comersail', res.data.token);
                localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

                alert(esLogin ? '¡Sesión iniciada con éxito!' : '¡Cuenta creada correctamente!');
                navigate('/compras'); //Redirigir al panel principal
            }
        } catch (error) {
            console.error('Error en la autenticación:', error);
            alert(error.response?.data?.mensaje || 'Ocurrió un error al procesar la solicitud');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow-lg style-container" style={{ maxWidth: '480px', width: '100%' }}>
                <h2 className="text-center mb-1 text-success fw-bold">CÓMERSAIL</h2>
                <h4 className="text-center mb-4">{esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h4>

                <form onSubmit={handleSubmit}>
                    {!esLogin && (
                        <div className='mb-3'>
                            <label className='form-label'>Nombre Completo</label>
                            <input 
                                type="text"
                                name='nombre'
                                className='form-control'
                                placeholder='Tu nombre'
                                value={formData.nombre}
                                onChange={handleChange}
                                required={!esLogin}

                             />
                        </div>
                    )}
                    
                    <div className='mb-3'>
                        <label className='form-label'>Correo Electrónico</label>
                        <input
                            type='email'
                            name='email'
                            className='form-control'
                            placeholder='correo@ejemplo.com'
                            value={formData.email}
                            onChange={handleChange}
                            required    
                        />
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Contraseña</label>
                        <input 
                            type="password" 
                            name='password'
                            className='form-control'
                            placeholder='Mínimo 6 caracteres'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!esLogin && (
                        <>
                            <div className='mb-3'>
                                <label className='form-label'>Departamento</label>
                                <select 
                                    name="departamento"
                                    className='form-select'
                                    value={formData.departamento}
                                    onChange={handleChange}
                                    >
                                        <option value="Huila">Huila</option>
                                        <option value="Cauca">Cauca</option>
                                        <option value="Tolima">Tolima</option>
                                        <option value="Nariño">Nariño</option>
                                    </select>
                            </div>

                            <div className='mb-3'>
                                <label className='form-label'>Municipio</label>
                                <input 
                                    type="text"
                                    name='municipio'
                                    className='form-control'
                                    placeholder='Ej: Garzón'
                                    value={formData.municipio}
                                    onChange={handleChange} 
                                />
                            </div>

                            <div className='mb-3'>
                                <label className='form-label'>Rol de usuario</label>
                                <select 
                                    name="rol"
                                    className='form-select'
                                    value={formData.rol}
                                    onChange={handleChange}
                                >
                                    <option value="cliente">Cliente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button type='submit' className='btn btn-success w-100 mt-2 mb-3'>
                        {esLogin ? 'Ingresar' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>
        </div>
    )
    
}