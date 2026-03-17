// открытие модалок
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById(`${btn.dataset.modal}Modal`).classList.add("active");
    });
});

// закрытие через кнопку ✕ — ищем ближайшую родительскую модалку
document.querySelectorAll(".modal-close").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.closest(".modal").classList.remove("active");
    });
});

// закрытие по клику на фон
document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
    });
});

document.querySelectorAll(".color-option").forEach(option => {
    option.addEventListener("click", () => {
    document.querySelector(".color-option.active")?.classList.remove("active");
    option.classList.add("active");
    })
})

document.querySelector(".add-button").addEventListener("click", () => {
    const input = document.querySelector(".menu-input");
    const newEl = document.createElement('li');
    if (!input.value.trim()) return;
    newEl.textContent = input.value;
    newEl.style.backgroundColor = document.querySelector(".color-option.active").dataset.color;
    document.querySelector(".result-menu").append(newEl);
    document.getElementById("resultModal").classList.add("active");
    input.value = "";
})