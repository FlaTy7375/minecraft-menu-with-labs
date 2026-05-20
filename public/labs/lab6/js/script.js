// Базовый класс Автосалона
class AutoShop {
    // Симуляция 3 различных конструкторов с помощью проверки аргументов
    constructor() {
        if (arguments.length === 0) {
            this.name = "Грибной Автосалон (Стандартный)";
            this.theme = "Mushroom";
        } else if (arguments.length === 1 && typeof arguments[0] === 'object') {
            this.name = arguments[0].name || "Грибной Автосалон";
            this.theme = arguments[0].theme || "Mushroom";
        } else if (arguments.length === 2) {
            this.name = arguments[0];
            this.theme = arguments[1];
        }

        // Коллекция Map для автомобилей (согласно ТЗ)
        this.carsMap = new Map([
            [1, "Mooshroom GT (Экологичный)"],
            [2, "Mycelium Cruiser 3000"],
            [3, "Red Mushroom Truck (Грузовой)"],
            [4, "Spores Hoverboard"],
            [5, "Brown Mushroom Chopper"]
        ]);

        // Коллекция Set для контента (заголовки и параграфы)
        this.contentSet = new Set([
            "Производитель: FungiCorp",
            "Производитель: Mooshroom Motors",
            "Надежный транспорт для путешествий по грибным островам.",
            "Топливо: грибной суп.",
            "Гарантия: пока не съедите транспорт.",
            "Встроенная защита от враждебных мобов."
        ]);

        this.extraProperties = new Map();
    }

    // 1. Метод добавления дополнительных свойств в класс
    addExtraProperty(key, value) {
        this.extraProperties.set(key, value);
    }

    // 2. Вывод хранящейся информации (в виде выпадающих списков)
    populateDropdowns() {
        const carSelect = document.getElementById('newCarSelect');
        const headerSelect = document.getElementById('newHeaderSelect');
        const paraSelect = document.getElementById('newParaSelect');

        // Очистка
        carSelect.innerHTML = '';
        headerSelect.innerHTML = '';
        paraSelect.innerHTML = '';

        // Заполнение машин из Map
        for (let [key, car] of this.carsMap) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = car;
            carSelect.appendChild(opt);
        }

        // Заполнение текстов из Set
        let index = 0;
        for (let text of this.contentSet) {
            const optHeader = document.createElement('option');
            optHeader.value = index;
            optHeader.textContent = text.substring(0, 30) + '...';
            headerSelect.appendChild(optHeader);

            const optPara = document.createElement('option');
            optPara.value = index;
            optPara.textContent = text.substring(0, 30) + '...';
            paraSelect.appendChild(optPara);
            
            index++;
        }
    }

    // 3. Вывод информации - рендер начального DOM (согласно ТЗ: create методы DOM-узла, текстового)
    renderInitialDOM() {
        const container = document.getElementById('shop-container');
        container.innerHTML = ''; // Очистка

        // Создаем заголовок (h1)
        const h1 = document.createElement('h1');
        h1.id = 'main-header';
        // Берем первый элемент из Set для заголовка
        const firstHeaderText = [...this.contentSet][0];
        const h1Text = document.createTextNode(firstHeaderText);
        h1.appendChild(h1Text);
        // Применяем CSS свойства (по ТЗ: его CSS свойств)
        h1.style.textTransform = 'uppercase';
        h1.style.letterSpacing = '2px';
        container.appendChild(h1);

        // Создаем нумерованный список (ol) для авто (не менее 3 элементов)
        const ol = document.createElement('ol');
        ol.id = 'car-list';
        
        let count = 0;
        for (let [key, carName] of this.carsMap) {
            if (count >= 3) break; // Сначала выводим только 3
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(carName));
            ol.appendChild(li);
            count++;
        }
        container.appendChild(ol);

        // Создаем 2 параграфа с описанием (из Set)
        let pCount = 0;
        for (let text of this.contentSet) {
            if (text.startsWith("Производитель")) continue; // Пропускаем заголовки
            if (pCount >= 2) break;

            const p = document.createElement('p');
            p.id = `para-${pCount + 1}`;
            p.appendChild(document.createTextNode(text));
            container.appendChild(p);
            pCount++;
        }

        this.updatePositionDropdown();
    }

    updatePositionDropdown() {
        const list = document.getElementById('car-list');
        const select = document.getElementById('insertPositionSelect');
        if (!list || !select) return;

        const count = list.children.length;
        select.innerHTML = '';
        
        for (let i = 1; i <= count + 1; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `Позиция ${i}`;
            select.appendChild(opt);
        }
    }
}

// Дочерний класс (по ТЗ: класс-наследник с методами вставки)
class DynamicAutoShop extends AutoShop {
    constructor(...args) {
        super(...args);
    }

    // Вставка нового названия автомобиля в выбранное место
    insertCarAtPosition(carKey, position) {
        if (!this.carsMap.has(parseInt(carKey))) return;
        
        const carName = this.carsMap.get(parseInt(carKey));
        const list = document.getElementById('car-list');
        const items = list.querySelectorAll('li');
        
        // Создаем элемент списка
        const newLi = document.createElement('li');
        newLi.textContent = carName;
        newLi.className = 'new-item'; // Класс с анимацией
        
        // Использование adjacent-методов
        if (items.length === 0 || position > items.length) {
            // В конец
            list.insertAdjacentElement('beforeend', newLi);
        } else {
            // Перед указанной позицией (1-indexed)
            items[position - 1].insertAdjacentElement('beforebegin', newLi);
        }
        
        this.updatePositionDropdown();
    }

    // Изменение текста заголовка
    changeHeaderText(contentIndex) {
        const textArray = [...this.contentSet];
        const newText = textArray[contentIndex];
        
        const h1 = document.getElementById('main-header');
        if (h1 && newText) {
            h1.textContent = newText;
            h1.classList.remove('flash');
            // Триггер анимации
            void h1.offsetWidth;
            h1.classList.add('flash');
        }
    }

    // Вставка нового параграфа (выше или ниже 2 существующих)
    insertParagraph(contentIndex, targetId, positionMode) {
        const textArray = [...this.contentSet];
        const newText = textArray[contentIndex];
        const targetElement = document.getElementById(targetId);
        
        if (targetElement && newText) {
            // Использование insertAdjacentHTML
            const htmlToInsert = `<p class="new-item">${newText}</p>`;
            
            if (positionMode === 'above') {
                targetElement.insertAdjacentHTML('beforebegin', htmlToInsert);
            } else if (positionMode === 'below') {
                targetElement.insertAdjacentHTML('afterend', htmlToInsert);
            }
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляр дочернего класса (используем 3-й конструктор)
    const shop = new DynamicAutoShop("Грибной Автосалон", "Mushroom");
    
    // Демонстрация метода добавления свойств
    shop.addExtraProperty("Director", "Mooshroom Cow");
    
    // Отрисовка
    shop.populateDropdowns();
    shop.renderInitialDOM();

    // Привязка обработчиков событий к кнопкам
    
    // 1. Вставить авто
    document.getElementById('btnInsertCar').addEventListener('click', () => {
        const carKey = document.getElementById('newCarSelect').value;
        const pos = parseInt(document.getElementById('insertPositionSelect').value);
        shop.insertCarAtPosition(carKey, pos);
    });

    // 2. Изменить заголовок
    document.getElementById('btnChangeHeader').addEventListener('click', () => {
        const textIndex = parseInt(document.getElementById('newHeaderSelect').value);
        shop.changeHeaderText(textIndex);
    });

    // 3. Вставить параграф
    document.getElementById('btnInsertPara').addEventListener('click', () => {
        const textIndex = parseInt(document.getElementById('newParaSelect').value);
        const targetId = document.getElementById('paraTargetSelect').value;
        const positionMode = document.getElementById('paraPosSelect').value;
        shop.insertParagraph(textIndex, targetId, positionMode);
    });
});
