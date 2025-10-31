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
// ============ 📰 BẢNG TIN COFFEE STORIES (Slide chuyển tin) ============
document.addEventListener("DOMContentLoaded", () => {
  const openNews = document.getElementById("openNews");
  const closeNews = document.getElementById("closeNews");
  const newsPopup = document.getElementById("newsPopup");
  const newsItems = document.querySelectorAll(".news-item");
  const prevBtn = document.getElementById("prevNews");
  const nextBtn = document.getElementById("nextNews");

  let currentIndex = 0;
  let autoSlide;

  // 🌟 Hiển thị tin hiện tại
  function showNews(index) {
    newsItems.forEach((item, i) => {
      item.classList.remove("active", "exit-left");
      if (i === index) {
        item.classList.add("active");
      } else if (i < index) {
        item.classList.add("exit-left");
      }
    });
  }

  // 👉 Nút qua tin mới
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % newsItems.length;
    showNews(currentIndex);
    resetAutoSlide();
  });

  // 👈 Nút quay lại tin trước
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + newsItems.length) % newsItems.length;
    showNews(currentIndex);
    resetAutoSlide();
  });

  // 📰 Mở popup
  openNews.addEventListener("click", () => {
    newsPopup.classList.add("show");
    openNews.style.display = "none";
    showNews(currentIndex);
    startAutoSlide();
  });

  // ❌ Đóng popup
  closeNews.addEventListener("click", () => {
    newsPopup.classList.remove("show");
    openNews.style.display = "block";
    stopAutoSlide();
  });

  // ⏱️ Tự động chuyển tin mỗi 5 giây
  function startAutoSlide() {
    stopAutoSlide();
    autoSlide = setInterval(() => {
      currentIndex = (currentIndex + 1) % newsItems.length;
      showNews(currentIndex);
    }, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlide);
  }

  function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // 👉 Đóng khi click ngoài popup
  document.addEventListener("click", (e) => {
    if (!newsPopup.contains(e.target) && !openNews.contains(e.target)) {
      newsPopup.classList.remove("show");
      openNews.style.display = "block";
      stopAutoSlide();
    }
  });

  // 🕒 Hiện popup sau 5 giây khi mở trang
  setTimeout(() => {
    newsPopup.classList.add("show");
    openNews.style.display = "none";
    showNews(currentIndex);
    startAutoSlide();

    // ⏰ Ẩn lại sau 10 giây
    setTimeout(() => {
      newsPopup.classList.remove("show");
      openNews.style.display = "block";
      stopAutoSlide();
    }, 10000);
  }, 5000);
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