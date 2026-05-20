// 1. Для организации бизнес логики используется только JavaScript.
// 2. Пользовательский объект для хранения и обработки.
class StoreApp {
    constructor() {
        this.records = [];
        this.customProperties = [];
        this.nextId = 1;
        this.loadFromStorage();
    }

    log(msg) {
        const box = document.getElementById('logBox');
        box.innerHTML += `<div>> ${msg}</div>`;
        box.scrollTop = box.scrollHeight;
    }

    // Метод вывода значений на экран (отрисовка таблицы)
    renderDisplay(data = this.records) {
        const thead = document.getElementById('tableHead');
        const tbody = document.getElementById('tableBody');
        
        // Обновляем заголовки таблицы с учетом добавленных свойств
        let headHtml = `<th>ID</th><th>Название</th><th>Дата</th><th>Доставка</th><th>Реквизиты</th>`;
        this.customProperties.forEach(prop => {
            headHtml += `<th>${prop}</th>`;
        });
        thead.innerHTML = headHtml;

        // Обновляем тело таблицы (используем map, как требуется)
        tbody.innerHTML = data.map(record => {
            let row = `<td>${record.id}</td>
                       <td>${record.name}</td>
                       <td>${record.date}</td>
                       <td>${record.deliveryType}</td>
                       <td>${record.manufacturer}</td>`;
            this.customProperties.forEach(prop => {
                row += `<td>${record[prop] !== undefined ? record[prop] : ''}</td>`;
            });
            return `<tr>${row}</tr>`;
        }).join('');

        this.renderDropdowns();
    }

    // Метод поиска и вывода нужного элемента (для выпадающего списка ID)
    renderDropdowns() {
        const idSelect = document.getElementById('idSelect');
        idSelect.innerHTML = this.records.map(r => `<option value="${r.id}">${r.id} - ${r.name}</option>`).join('');
        if(this.records.length === 0) {
            idSelect.innerHTML = '<option value="">Нет записей</option>';
        }
    }

    // Метод добавления нового веб-элемента для ввода значения свойства
    renderDynamicInputs() {
        const container = document.getElementById('dynamicFieldsContainer');
        if (this.customProperties.length > 0) {
            container.classList.remove('hidden');
            container.innerHTML = this.customProperties.map(prop => `
                <div class="form-group">
                    <label>${prop}</label>
                    <input type="text" id="dyn_${prop}" placeholder="Введите ${prop}">
                </div>
            `).join('');
        } else {
            container.classList.add('hidden');
            container.innerHTML = '';
        }
    }

    // Использование LocalStorage
    loadFromStorage() {
        try {
            const storedRecords = localStorage.getItem('lab5_records');
            const storedProps = localStorage.getItem('lab5_props');
            const storedId = localStorage.getItem('lab5_nextid');
            
            if (storedRecords) this.records = JSON.parse(storedRecords);
            if (storedProps) this.customProperties = JSON.parse(storedProps);
            if (storedId) this.nextId = parseInt(storedId);
        } catch (e) {
            console.error("Storage load error", e);
        }
    }

    saveToStorage() {
        localStorage.setItem('lab5_records', JSON.stringify(this.records));
        localStorage.setItem('lab5_props', JSON.stringify(this.customProperties));
        localStorage.setItem('lab5_nextid', this.nextId.toString());
    }

    // Добавление записи
    addRecord(recordData) {
        const newRecord = {
            id: this.nextId++,
            name: recordData.name,
            date: recordData.date,
            deliveryType: recordData.deliveryType,
            manufacturer: recordData.manufacturer
        };
        
        // Добавляем значения для динамических свойств
        this.customProperties.forEach(prop => {
            newRecord[prop] = recordData[prop] || '';
        });

        this.records.push(newRecord);
        this.saveToStorage();
        this.renderDisplay();
        this.log(`Запись #${newRecord.id} успешно добавлена.`);
    }

    // Удаление записи
    deleteRecord(id) {
        // Использование filter стандарта ECMA6
        const initialLength = this.records.length;
        this.records = this.records.filter(r => r.id !== parseInt(id));
        if (this.records.length < initialLength) {
            this.saveToStorage();
            this.renderDisplay();
            this.log(`Запись #${id} удалена.`);
        }
    }

    // Метод добавления нового выбранного свойства объекту
    addCustomProperty(propName, defaultValue) {
        if (!this.customProperties.includes(propName)) {
            this.customProperties.push(propName);
            // Обновляем существующие записи (использование map)
            this.records = this.records.map(r => ({...r, [propName]: defaultValue}));
            this.saveToStorage();
            this.renderDynamicInputs();
            this.renderDisplay();
            this.log(`Свойство [${propName}] добавлено. Значение: ${defaultValue}`);
        } else {
            this.log(`Свойство [${propName}] уже существует.`);
        }
    }

    // Метод удаления выбранного свойства
    removeCustomProperty(propName) {
        if (this.customProperties.includes(propName)) {
            this.customProperties = this.customProperties.filter(p => p !== propName);
            // Удаляем свойство из всех объектов
            this.records = this.records.map(r => {
                const newR = {...r};
                delete newR[propName];
                return newR;
            });
            this.saveToStorage();
            this.renderDynamicInputs();
            this.renderDisplay();
            this.log(`Свойство [${propName}] удалено.`);
        }
    }

    // UI Связки
    uiAddRecord() {
        const name = document.getElementById('devName').value;
        if (!name) {
            this.log("Ошибка: Название не может быть пустым!");
            return;
        }
        const data = {
            name: name,
            date: document.getElementById('devDate').value,
            deliveryType: document.getElementById('devDelivery').value,
            manufacturer: document.getElementById('devManufacturer').value
        };
        this.customProperties.forEach(prop => {
            const el = document.getElementById(`dyn_${prop}`);
            if (el) data[prop] = el.value;
        });
        this.addRecord(data);
        this.uiClearForm();
    }

    uiClearForm() {
        document.getElementById('devName').value = '';
        document.getElementById('devDate').value = '';
        document.getElementById('devDelivery').selectedIndex = 0;
        document.getElementById('devManufacturer').value = '';
        this.customProperties.forEach(prop => {
            const el = document.getElementById(`dyn_${prop}`);
            if (el) el.value = '';
        });
    }

    uiDeleteRecord() {
        const idSelect = document.getElementById('idSelect');
        if (idSelect.value) {
            this.deleteRecord(idSelect.value);
        }
    }

    uiFilterRecords() {
        const delivery = document.getElementById('devDelivery').value;
        // Использование filter
        const filtered = this.records.filter(r => r.deliveryType === delivery);
        this.renderDisplay(filtered);
        this.log(`Фильтр применен: ${delivery}. Найдено: ${filtered.length}`);
    }

    uiShowAll() {
        this.renderDisplay();
        this.log(`Отображены все записи.`);
    }

    uiAddProperty() {
        const propName = document.getElementById('newPropName').value;
        const propValue = document.getElementById('newPropValue').value;
        this.addCustomProperty(propName, propValue);
    }

    uiRemoveProperty() {
        const propName = document.getElementById('newPropName').value;
        this.removeCustomProperty(propName);
    }

    init() {
        this.renderDynamicInputs();
        this.renderDisplay();
    }
}

const app = new StoreApp();
app.init();
