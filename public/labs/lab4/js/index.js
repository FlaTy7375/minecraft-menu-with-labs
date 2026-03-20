const submitButton = document.querySelector(".btn-submit");
const modal = document.getElementById("resultsModal");
const closeModal = document.querySelector(".btn-close-modal");
const showAllBtn = document.getElementById("showAllBtn");
const tbody = document.getElementById("resultsBody");

// логика чекбокса "Проблем нет"
const noneCheckbox = document.getElementById("noneCheckbox");
const otherCheckboxes = [...document.querySelectorAll('input[name="problems"]:not(#noneCheckbox)')];

noneCheckbox.addEventListener("change", () => {
    otherCheckboxes.forEach(cb => {
        cb.disabled = noneCheckbox.checked;
        cb.checked = false;
        cb.closest(".check-label").classList.toggle("disabled", noneCheckbox.checked);
    });
});

otherCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        if (cb.checked) {
            noneCheckbox.checked = false;
        }
    });
});

const allData = [];

function renderTable(rows) {
    tbody.innerHTML = "";
    rows.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(val => {
            const td = document.createElement("td");
            td.textContent = Array.isArray(val) ? val.join(", ") : val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

submitButton.addEventListener("click", () => {
    const form = document.getElementById("surveyForm");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        week: document.getElementById("week").value.replace("-W", ", неделя "),
        course: document.getElementById("course").value,
        faculty: document.getElementById("faculty").selectedOptions[0].text,
        form: document.querySelector('input[name="form"]:checked')?.parentElement.textContent.trim(),
        problems: [...document.querySelectorAll('input[name="problems"]:checked')].map(inp => inp.parentElement.textContent.trim()),
    };

    allData.push(data);
    renderTable([data]);
    modal.classList.add("active");
});

showAllBtn.addEventListener("click", () => {
    renderTable(allData);
});

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
});

document.querySelector(".btn-back").addEventListener("click", () => {
    modal.classList.remove("active");
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
});
