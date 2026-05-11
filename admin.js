const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

let productos = JSON.parse(localStorage.getItem('burgerOneProducts')) || [];

// DOM
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const adminList = document.getElementById('admin-list');

if (sessionStorage.getItem('burgerOneAuth')) {
    showDashboard();
}

function login() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem('burgerOneAuth', 'true');
        showDashboard();
    } else {
        const err = document.getElementById('error-msg');
        err.style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('burgerOneAuth');
    location.reload();
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    renderAdmin();
}

function renderAdmin() {
    adminList.innerHTML = '';
    productos.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'admin-item-row';
        
        // Manejo de variantes para el precio
        let priceInputs = '';
        if (p.precios) {
            priceInputs = '<div style="font-size:0.8rem; color:#888; margin-bottom:5px;">Precios por variante:</div>';
            Object.keys(p.precios).forEach(vKey => {
                priceInputs += `
                    <div style="display:flex; align-items:center; gap:5px; margin-bottom:5px;">
                        <span style="width:60px;">${vKey}:</span>
                        <input type="number" value="${p.precios[vKey]}" onchange="updatePrice(${p.id}, '${vKey}', this.value)" style="width:100px; margin:0;">
                    </div>
                `;
            });
        } else {
            priceInputs = `
                <div style="display:flex; align-items:center; gap:5px;">
                    <span>Precio ($):</span>
                    <input type="number" value="${p.precio}" onchange="updateBasePrice(${p.id}, this.value)" style="width:100px; margin:0;">
                </div>
            `;
        }

        item.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                <img src="${p.img}" alt="">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:0.7rem;" onclick="changeImg(${p.id})">CAMBIAR FOTO</button>
            </div>
            <div class="admin-item-info">
                <input type="text" value="${p.nombre}" onchange="updateField(${p.id}, 'nombre', this.value)" style="font-size:1.2rem; font-weight:700;">
                <textarea onchange="updateField(${p.id}, 'descripcion', this.value)">${p.descripcion}</textarea>
                ${priceInputs}
                <div class="admin-controls">
                    <div class="switch-group">
                        <input type="checkbox" ${p.agotado ? 'checked' : ''} onchange="updateField(${p.id}, 'agotado', this.checked)"> 🚫 AGOTADO
                    </div>
                    <div class="switch-group">
                        <input type="checkbox" ${p.destacado ? 'checked' : ''} onchange="updateField(${p.id}, 'destacado', this.checked)"> ⭐ DESTACADO
                    </div>
                    <button class="btn" style="background:red; color:white; padding:5px 10px; font-size:0.7rem;" onclick="deleteItem(${p.id})">ELIMINAR</button>
                </div>
            </div>
        `;
        adminList.appendChild(item);
    });
}

function updateField(id, field, value) {
    const p = productos.find(x => x.id === id);
    if (p) {
        p[field] = value;
        save();
        showToast("✓ Guardado");
    }
}

function updatePrice(id, vKey, value) {
    const p = productos.find(x => x.id === id);
    if (p && p.precios) {
        p.precios[vKey] = parseInt(value);
        save();
        showToast("✓ Precio actualizado");
    }
}

function updateBasePrice(id, value) {
    const p = productos.find(x => x.id === id);
    if (p) {
        p.precio = parseInt(value);
        save();
        showToast("✓ Precio actualizado");
    }
}

function deleteItem(id) {
    if (confirm("¿Borrar definitivamente?")) {
        productos = productos.filter(x => x.id !== id);
        save();
        renderAdmin();
    }
}

function addNew() {
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const type = document.getElementById('new-type').value;
    const desc = document.getElementById('new-desc').value;
    const file = document.getElementById('new-img').files[0];

    if (!name || !price || !file) {
        showToast("❌ Completa todos los campos");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const product = {
            id: Date.now(),
            nombre: name,
            precio: parseInt(price),
            tipo: type,
            descripcion: desc,
            img: e.target.result,
            agotado: false,
            destacado: false
        };
        productos.push(product);
        save();
        location.reload();
    };
    reader.readAsDataURL(file);
}

function changeImg(id) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            const p = productos.find(x => x.id === id);
            p.img = event.target.result;
            save();
            renderAdmin();
            showToast("📸 Foto actualizada");
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function save() {
    localStorage.setItem('burgerOneProducts', JSON.stringify(productos));
}

function showToast(text) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = text;
    container.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}
