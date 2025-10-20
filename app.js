// Espera a que todo el HTML esté cargado para empezar a ejecutar el código.
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    // Guardamos en variables los elementos del HTML que vamos a necesitar.
    const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');
    const tablaCarritoBody = document.querySelector('.tabla-carrito tbody');
    const resumenCarritoDiv = document.querySelector('.resumen-carrito');
    const contenidoCarritoDiv = document.querySelector('.contenido-carrito');
    const carritoVacioDiv = document.querySelector('.carrito-vacio');
    const menuHamburguesa = document.getElementById('menu-hamburguesa');
    const navLinks = document.querySelector('.barra-navegacion ul');
    const notificacion = document.getElementById('notificacion');

    // --- ESTADO DE LA APLICACIÓN ---

    // Carga el carrito guardado en el navegador, o crea un carrito vacío si es la primera vez.
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // --- FUNCIONES ---

    /**
     * Guarda el carrito en el almacenamiento local del navegador.
     */
    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    /**
     * Actualiza el numerito del ícono del carrito.
     */
    function actualizarContador() {
        // Suma las cantidades de todos los productos para saber el total.
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        if (contadorCarrito) {
            contadorCarrito.textContent = totalItems;
        }
    }
    
    /**
     * Muestra un mensaje temporal en la pantalla (ej: "Producto añadido").
     */
    function mostrarNotificacion(mensaje) {
        if (!notificacion) return;
        notificacion.textContent = mensaje;
        notificacion.classList.add('mostrar');

        // Oculta el mensaje después de 2 segundos.
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
        }, 2000);
    }

    /**
     * Agrega un producto al carrito cuando se hace clic en el botón.
     */
    function agregarProducto(e) {
        const boton = e.target;
        // Busca la tarjeta del producto a la que pertenece el botón.
        const tarjeta = boton.closest('.tarjeta-producto');
        
        // Saca la información del producto de la tarjeta HTML.
        const producto = {
            id: tarjeta.dataset.id,
            nombre: tarjeta.querySelector('h5').textContent,
            // Convierte el precio de texto a número.
            precio: parseFloat(tarjeta.querySelector('.texto-precio').textContent.replace('$', '').replace('.', '')),
            imagen: tarjeta.querySelector('img').src,
            cantidad: 1
        };

        // Revisa si el producto ya está en el carrito.
        const productoExistente = carrito.find(item => item.id === producto.id);

        if (productoExistente) {
            // Si ya está, solo aumenta la cantidad.
            productoExistente.cantidad++;
        } else {
            // Si es nuevo, lo agrega al carrito.
            carrito.push(producto);
        }

        guardarCarrito();
        actualizarContador();
        mostrarNotificacion(`"${producto.nombre}" fue añadido al carrito.`);
    }

    /**
     * Muestra los productos en la página del carrito.
     */
    function renderizarCarrito() {
        // Si no estamos en la página del carrito, no hace nada.
        if (!tablaCarritoBody) return;

        // Si no hay productos, muestra un mensaje.
        if (carrito.length === 0) {
            if (contenidoCarritoDiv) contenidoCarritoDiv.style.display = 'none';
            if (carritoVacioDiv) carritoVacioDiv.style.display = 'block';
            return;
        }

        // Si hay productos, muestra la tabla.
        if (contenidoCarritoDiv) contenidoCarritoDiv.style.display = 'grid';
        if (carritoVacioDiv) carritoVacioDiv.style.display = 'none';

        // Vacía la tabla para no repetir productos al actualizar.
        tablaCarritoBody.innerHTML = '';
        let subtotal = 0;

        // Por cada producto en el carrito...
        carrito.forEach(item => {
            const totalItem = item.precio * item.cantidad;
            subtotal += totalItem;

            // ...crea una fila en la tabla...
            const tr = document.createElement('tr');
            // ...y la llena con la información del producto.
            tr.innerHTML = `
                <td data-label="Producto">
                    <div class="info-producto-carrito">
                        <img src="${item.imagen}" alt="${item.nombre}">
                        <h5>${item.nombre}</h5>
                    </div>
                </td>
                <td data-label="Precio">$${item.precio.toLocaleString('es-CO')}</td>
                <td data-label="Cantidad">
                    <input type="number" value="${item.cantidad}" min="1" class="input-cantidad" data-id="${item.id}">
                </td>
                <td data-label="Total">$${totalItem.toLocaleString('es-CO')}</td>
                <td data-label="Eliminar">
                    <a href="#" class="boton-eliminar" data-id="${item.id}">X</a>
                </td>
            `;
            tablaCarritoBody.appendChild(tr);
        });

        // Actualiza los valores de subtotal y total en el resumen.
        const envio = 8000; // Costo de envío fijo.
        const total = subtotal + envio;
        if (resumenCarritoDiv) {
            resumenCarritoDiv.querySelector('#subtotal-valor').textContent = `$${subtotal.toLocaleString('es-CO')}`;
            resumenCarritoDiv.querySelector('#total-valor').textContent = `$${total.toLocaleString('es-CO')}`;
        }
    }

    /**
     * Se encarga de los eventos en la página del carrito, como eliminar un producto
     * o cambiar la cantidad.
     */
    function manejarEventosCarrito(e) {
        e.preventDefault();
        const target = e.target;

        // Si se hace clic en el botón de eliminar.
        if (target.classList.contains('boton-eliminar')) {
            const id = target.dataset.id;
            // Quita el producto del carrito.
            carrito = carrito.filter(item => item.id !== id);
            mostrarNotificacion("Producto eliminado del carrito.");
        }

        // Si se cambia la cantidad en el input.
        if (target.classList.contains('input-cantidad')) {
            const id = target.dataset.id;
            const cantidad = parseInt(target.value);
            const productoEnCarrito = carrito.find(item => item.id === id);

            // Actualiza la cantidad del producto.
            if (productoEnCarrito && cantidad > 0) {
                productoEnCarrito.cantidad = cantidad;
            }
        }

        // Vuelve a guardar y a mostrar todo actualizado.
        guardarCarrito();
        renderizarCarrito();
        actualizarContador();
    }

    // --- INICIALIZACIÓN Y EVENT LISTENERS ---
    
    // Activa el menú de hamburguesa para móviles.
    if (menuHamburguesa) {
        menuHamburguesa.addEventListener('click', () => {
            const isExpanded = navLinks.classList.toggle('activo');
            menuHamburguesa.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Le dice a todos los botones "Añadir al Carrito" qué hacer cuando se les da clic.
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarProducto);
    });

    // Activa las funciones de la tabla del carrito (eliminar, cambiar cantidad).
    if (tablaCarritoBody) {
        tablaCarritoBody.addEventListener('click', manejarEventosCarrito);
        tablaCarritoBody.addEventListener('change', manejarEventosCarrito);
    }

    // --- VALIDACIÓN DE FORMULARIOS ---
    const formularios = document.querySelectorAll('form');
    formularios.forEach(form => {
        form.addEventListener('submit', function(e) {
            let esValido = true;
            const campos = form.querySelectorAll('[required]');

            campos.forEach(campo => {
                const grupo = campo.closest('.grupo-formulario');
                const mensajeError = grupo.querySelector('.error-mensaje');
                
                // Ocultar errores previos
                grupo.classList.remove('error');
                if (mensajeError) mensajeError.style.display = 'none';

                // Validar campo vacío
                if (campo.value.trim() === '') {
                    esValido = false;
                    grupo.classList.add('error');
                    if (mensajeError) {
                        mensajeError.textContent = 'Este campo es obligatorio.';
                        mensajeError.style.display = 'block';
                    }
                }
                // Validar formato de email
                else if (campo.type === 'email' && !/^\S+@\S+\.\S+$/.test(campo.value)) {
                    esValido = false;
                    grupo.classList.add('error');
                    if (mensajeError) {
                        mensajeError.textContent = 'Por favor, introduce un email válido.';
                        mensajeError.style.display = 'block';
                    }
                }
            });

            if (!esValido) {
                e.preventDefault(); // Evita que el formulario se envíe si hay errores.
            }
        });
    });

    // --- ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER) ---
    // Esta función se encarga de añadir la clase 'visible' a los elementos cuando entran en la pantalla.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si el elemento está en la pantalla...
            if (entry.isIntersecting) {
                // Si el elemento es un contenedor de grid, animamos sus hijos de forma escalonada.
                if (entry.target.classList.contains('stagger-container')) {
                    const children = entry.target.querySelectorAll('.animar');
                    children.forEach((child, index) => {
                        // Aplicamos un retraso creciente a cada hijo para el efecto 'stagger'.
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, index * 150); // 150ms de retraso entre cada elemento.
                    });
                } else {
                    // Si es un elemento normal, solo lo hacemos visible.
                    entry.target.classList.add('visible');
                }
                // Dejamos de observar el elemento una vez que ha sido animado.
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }); // La animación se dispara cuando el 10% del elemento es visible.

    // Le dice al observador que vigile todos los elementos con la clase '.animar' o '.stagger-container'.
    document.querySelectorAll('.animar, .stagger-container').forEach(el => observer.observe(el));

    // --- Carga Inicial ---
    // Al cargar la página, actualiza el contador y muestra los productos en el carrito.
    actualizarContador();
    renderizarCarrito();
});