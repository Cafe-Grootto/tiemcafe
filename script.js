// ==========================================
// ☕ GROOTTO CAFE - QUẢN LÝ GIỎ HÀNG & THANH TOÁN
// ==========================================

const CART_KEY = "gc_cart";
const ORDER_KEY = "gc_orders";

// 🌿 ====== HỖ TRỢ ======
const read = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const formatVND = (n) => (n || 0).toLocaleString("vi-VN") + "₫";

// 🔔 ====== TOAST TỰ ẨN ======
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // hiệu ứng hiện
    setTimeout(() => toast.classList.add("show"), 100);

    // tự ẩn sau 2.5s
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// 🔢 ====== CẬP NHẬT SỐ GIỎ ======
function updateCount() {
    const count = read(CART_KEY).reduce((a, b) => a + (b.qty || 0), 0);
    document.querySelectorAll("#cartCount").forEach((e) => (e.textContent = count));
}

// 🛒 ====== THÊM VÀO GIỎ ======
function add(name, price, img) {
    const cart = read(CART_KEY);
    const item = cart.find((p) => p.name === name);
    if (item) item.qty++;
    else cart.push({ name, price, qty: 1, img });
    save(CART_KEY, cart);
    updateCount();
    showToast(`☕ Đã thêm "${name}" vào giỏ hàng!`);
}

// 🧾 ====== HIỂN THỊ GIỎ HÀNG ======
function renderCart() {
    const tbody = document.querySelector("#cartBody");
    const totalEl = document.querySelector("#cartTotal");
    if (!tbody || !totalEl) return;

    const cart = read(CART_KEY);
    tbody.innerHTML = "";
    let total = 0;

    if (!cart.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">🛒 Giỏ hàng trống ☕</td></tr>`;
        totalEl.textContent = "0₫";
        updateCount();
        return;
    }

    cart.forEach((item, i) => {
        const sum = item.price * item.qty;
        total += sum;
        tbody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${formatVND(item.price)}</td>
        <td>
          <button class="qty-btn" onclick="chg(${i}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="chg(${i}, 1)">+</button>
        </td>
        <td>${formatVND(sum)}</td>
        <td><button class="del-btn" onclick="del(${i})">Xóa</button></td>
      </tr>`;
    });

    totalEl.textContent = formatVND(total);
    updateCount();
}

// ➕ / ➖ ====== TĂNG GIẢM ======
function chg(i, d) {
    const cart = read(CART_KEY);
    cart[i].qty = Math.max(1, cart[i].qty + d);
    save(CART_KEY, cart);
    renderCart();
}

// ❌ ====== XÓA 1 MÓN ======
function del(i) {
    const cart = read(CART_KEY);
    const name = cart[i].name;
    cart.splice(i, 1);
    save(CART_KEY, cart);
    renderCart();
    showToast(`🗑️ Đã xóa ${name} khỏi giỏ hàng`, "error");
}

// 🧹 ====== XÓA TOÀN BỘ ======
function clearCart() {
    const cart = read(CART_KEY);
    if (!cart.length) return showToast("🛒 Giỏ hàng đang trống!", "error");

    showToast("🧺 Đã xóa toàn bộ giỏ hàng!", "error");
    localStorage.removeItem(CART_KEY);
    renderCart();
}

// 💳 ====== HIỂN THỊ ĐƠN HÀNG THANH TOÁN ======
function renderOrder() {
    const div = document.getElementById("order-summary");
    if (!div) return;
    const cart = read(CART_KEY);
    if (!cart.length) {
        div.innerHTML = "<p>Không có sản phẩm nào trong giỏ hàng 🍰</p>";
        return;
    }

    let total = 0;
    let html = "<ul>";
    cart.forEach((item) => {
        const sum = item.price * item.qty;
        total += sum;
        html += `<li>${item.name} × ${item.qty} — ${formatVND(sum)}</li>`;
    });
    html += `</ul><p><strong>Tổng cộng:</strong> ${formatVND(total)}</p>`;
    div.innerHTML = html;
}

// 🧾 ====== XỬ LÝ NÚT THANH TOÁN ======
function handleCheckout() {
    const form = document.getElementById("checkoutForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const cart = read(CART_KEY);
        const name = form.fullname.value.trim();
        const phone = form.phone.value.trim();
        const addr = form.address.value.trim();

        if (!name || !phone || !addr) return showToast("⚠️ Vui lòng nhập đầy đủ thông tin!", "error");
        if (!cart.length) return showToast("🛒 Giỏ hàng trống!", "error");

        const order = {
            id: "GC" + Date.now(),
            at: new Date().toLocaleString("vi-VN"),
            name,
            phone,
            addr,
            items: cart,
            total: cart.reduce((s, i) => s + i.price * i.qty, 0),
        };

        const orders = read(ORDER_KEY);
        orders.push(order);
        save(ORDER_KEY, orders);
        localStorage.removeItem(CART_KEY);
        updateCount();

        document.querySelector("#popup h3").textContent = `🎉 Cảm ơn ${name}!`;
        document.querySelector("#popup p").innerHTML = `
      Mã đơn: <strong>${order.id}</strong><br>
      Tổng tiền: <strong>${formatVND(order.total)}</strong><br>
      Giao đến: <em>${addr}</em>`;
        document.getElementById("popup").classList.add("show");
        showToast("🎂 Đặt hàng thành công!");
    });
}

// ❎ ====== ĐÓNG POPUP ======
function closePopup() {
    document.getElementById("popup").classList.remove("show");
    window.location.href = "index.html";
}

// 🚀 ====== KHỞI TẠO ======
document.addEventListener("DOMContentLoaded", () => {
    updateCount();

    // Trang giỏ hàng
    if (document.querySelector("#cartBody")) {
        renderCart();
        const clearBtn = document.getElementById("clear-cart");
        const checkoutBtn = document.getElementById("checkout-btn");
        if (clearBtn) clearBtn.addEventListener("click", clearCart);
        if (checkoutBtn)
            checkoutBtn.addEventListener("click", () => {
                const cart = read(CART_KEY);
                if (!cart.length) return showToast("🛍️ Giỏ hàng của bạn đang trống!", "error");
                window.location.href = "thanhtoan.html";
            });
    }

    // Trang thanh toán
    if (document.querySelector("#order-summary")) {
        renderOrder();
        handleCheckout();
    }

    // Nút thêm giỏ hàng
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
            add(btn.dataset.name, parseInt(btn.dataset.price), btn.dataset.img || "");
        });
    });
});
// ============BANGTIN====================
const popup = document.getElementById("newsPopup");
const openBtn = document.getElementById("openNews");
const closeBtn = document.getElementById("closeNews");
const content = document.getElementById("newsContent");

// 🎯 Danh sách tin ngẫu nhiên
const newsItems = [{
    title: "✨ Ra mắt Blend No.9",
    text: "Công thức cà phê rang mới với hương caramel và chocolate. Dành riêng cho tháng này!"
}, {
    title: "🎨 Workshop Latte Art",
    text: "Tham gia lớp pha chế nghệ thuật Latte Art – Chủ nhật hàng tuần tại GROOTTO Studio."
}, {
    title: "🍰 Bánh Mùa Đông",
    text: "Thưởng thức tiramisu và apple pie nóng giòn, kết hợp cappuccino ấm nồng."
}];

// 🧠 Hiển thị ngẫu nhiên 1 tin
function showRandomNews() {
    const random = newsItems[Math.floor(Math.random() * newsItems.length)];
    content.innerHTML = `
      <div class="news-item">
        <h4>${random.title}</h4>
        <p>${random.text}</p>
      </div>
    `;
}

// 🚀 Khi tải trang
window.addEventListener("load", () => {
    showRandomNews();
    popup.classList.add("show");
    openBtn.style.display = "none";

    // ⏰ Tự ẩn sau 10 giây
    setTimeout(() => {
        popup.classList.remove("show");
        openBtn.style.display = "block";
    }, 10000);
});

// 🖱️ Mở và đóng thủ công
openBtn.addEventListener("click", () => {
    showRandomNews();
    popup.classList.add("show");
    openBtn.style.display = "none";
});

closeBtn.addEventListener("click", () => {
    popup.classList.remove("show");
    openBtn.style.display = "block";
});
//======LIENHE==========
const form = document.getElementById('contactForm');
const thankMsg = document.getElementById('thankyou-msg');
form.addEventListener('submit', e => {
    e.preventDefault();
    form.reset();
    thankMsg.style.display = 'block';
    setTimeout(() => {
        thankMsg.style.display = 'none';
    }, 4000);
});