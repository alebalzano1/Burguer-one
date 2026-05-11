// CONSTANTES Y DATOS INICIALES
const defaultProductos = [
    {
        id: 1,
        nombre: "ONE",
        descripcion: "Pan a elección, blend 110 gr, cheddar, bacon, cebolla caramelizada, salsa cuarto de libra.",
        img: "img/one.png",
        tipo: "burger",
        variant: "Simple",
        precios: {
            "Simple": 1800,
            "Doble": 2400,
            "Triple": 2900,
            "Cuadr": 3500
        }
    },
    {
        id: 2,
        nombre: "HUEONE",
        descripcion: "Pan a elección, blend 110 gr, cheddar, bacon y huevo.",
        img: "img/hueone.png",
        tipo: "burger",
        variant: "Simple",
        precios: {
            "Simple": 1900,
            "Doble": 2500,
            "Triple": 3000
        }
    },
    {
        id: 3,
        nombre: "BIG ONE",
        descripcion: "Pan brioche, blend 110 gr, cheddar, lechuga, pickles de pepino y salsa one.",
        img: "img/bigone.png",
        tipo: "burger",
        variant: "Simple",
        precios: {
            "Simple": 2100,
            "Doble": 2700
        }
    },
    {
        id: 4,
        nombre: "FULL CHEDDAR",
        descripcion: "Pan a elección, blend 110 gr, cheddar, extra bacon y salsa cheddar.",
        img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
        tipo: "burger",
        variant: "Simple",
        precios: {
            "Simple": 2000,
            "Doble": 2600
        }
    },
    {
        id: 5,
        nombre: "Papas Fritas XL",
        descripcion: "Porción grande de papas súper crujientes.",
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
        tipo: "papas",
        precio: 850
    },
    {
        id: 6,
        nombre: "Coca Cola 500ml",
        descripcion: "Lata original o zero bien fría.",
        img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
        tipo: "bebida",
        precio: 600
    }
];

let productos = JSON.parse(localStorage.getItem('burgerOneProducts')) || defaultProductos;
let carrito = [];
let filtroActual = 'burger';

// DOM ELEMENTS
const productGrid = document.getElementById('product-grid');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartBadge = document.querySelector('.cart-count');

// INICIALIZAR
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    updateCartUI();
});

// RENDER MENU
function renderMenu() {
    productGrid.innerHTML = '';
    const filtrados = productos.filter(p => p.tipo === filtroActual);

    filtrados.forEach(prod => {
        const hasVariants = prod.precios ? true : false;
        // Default variant to 'Simple' if variants exist
        const activeVariant = prod.variant || 'Simple';
        const displayPrice = hasVariants ? prod.precios[activeVariant] : prod.precio;

        const card = document.createElement('div');
        card.className = `card ${prod.agotado ? 'sold-out' : ''} ${prod.destacado ? 'featured' : ''}`;
        
        // Build Variant Buttons HTML
        let variantsHTML = '';
        if (hasVariants) {
            variantsHTML = '<div class="variants">';
            Object.keys(prod.precios).forEach(vKey => {
                variantsHTML += `
                    <button class="variant-btn ${activeVariant === vKey ? 'active' : ''}" 
                            onclick="changeVariant(${prod.id}, '${vKey}')">${vKey}</button>
                `;
            });
            variantsHTML += '</div>';
        }

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${prod.img}" alt="${prod.nombre}" loading="lazy">
            </div>
            <div class="card-info">
                <h3>${prod.nombre}</h3>
                <p class="ingredients">${prod.descripcion}</p>
                ${variantsHTML}
                <div class="card-footer">
                    <span class="price">$${displayPrice}</span>
                    <button class="add-btn" onclick="addToCart(${prod.id})">+ CARGAR</button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// CAMBIAR VARIANTE (Visualmente en el objeto temporal)
function changeVariant(id, variantKey) {
    const prod = productos.find(p => p.id === id);
    if (prod) {
        prod.variant = variantKey;
        renderMenu();
    }
}

// FILTRAR
function filterMenu(tipo) {
    filtroActual = tipo;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(tipo));
    });
    renderMenu();
}

// CARRITO
function toggleCart() {
    cartDrawer.classList.toggle('active');
}

function addToCart(id) {
    const prod = productos.find(p => p.id === id);
    if (prod.agotado) return;

    const variantName = prod.variant || null;
    const finalPrice = prod.variant ? prod.precios[prod.variant] : prod.precio;
    const uniqueId = variantName ? `${id}-${variantName}` : `${id}`;

    const existing = carrito.find(item => item.cartId === uniqueId);
    if (existing) {
        existing.cantidad++;
    } else {
        carrito.push({
            cartId: uniqueId,
            id: prod.id,
            nombre: prod.nombre,
            variant: variantName,
            precio: finalPrice,
            cantidad: 1
        });
    }

    showToast(`✅ ${prod.nombre} agregado`);
    updateCartUI();
}

function removeFromCart(cartId) {
    carrito = carrito.filter(item => item.cartId !== cartId);
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let counts = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        counts += item.cantidad;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.nombre} ${item.variant ? `(${item.variant})` : ''}</h4>
                <p>$${item.precio} x ${item.cantidad}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.cartId}')">🗑️</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalElement.innerText = `$${total}`;
    cartBadge.innerText = counts;
}

// ADRESS UI
function toggleAddressField() {
    const type = document.getElementById('order-type').value;
    document.getElementById('address-input').style.display = type === 'delivery' ? 'block' : 'none';
}

// CHECKOUT
function checkout() {
    if (carrito.length === 0) {
        showToast("❌ Tu pedido está vacío");
        return;
    }

    const type = document.getElementById('order-type').value;
    const address = document.getElementById('address-input').value;
    const notes = document.getElementById('notes-input').value;

    if (type === 'delivery' && !address.trim()) {
        showToast("📍 Ingresá tu dirección");
        return;
    }

    let msg = `🔥 *NUEVO PEDIDO - BURGER ONE* 🔥%0A%0A`;
    msg += `*Tipo:* ${type === 'delivery' ? '🛵 Envío a Domicilio' : '🏪 Retiro en Local'}%0A`;
    if (type === 'delivery') msg += `*📍 Dirección:* ${address}%0A`;
    if (notes) msg += `*📝 Notas:* ${notes}%0A`;
    
    msg += `%0A*DETALLE:*%0A`;
    let total = 0;
    carrito.forEach(item => {
        msg += `- ${item.cantidad}x ${item.nombre} ${item.variant ? `(${item.variant})` : ''} ($${item.precio * item.cantidad})%0A`;
        total += item.precio * item.cantidad;
    });

    msg += `%0A💰 *TOTAL:* $${total}`;

    const phone = "1123456789"; // Numero de prueba
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

// TOAST
function showToast(text) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = text;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
