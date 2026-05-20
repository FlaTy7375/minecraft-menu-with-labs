document.addEventListener('DOMContentLoaded', () => {
    // 1. Использование Map для хранения товаров
    const itemsMap = new Map();
    const itemsCount = 30; // Требование: не менее 30 цен
    for (let i = 1; i <= itemsCount; i++) {
        itemsMap.set(i, `Товар ${i} (Nether)`);
    }

    // 2. Использование Set для хранения дат (по горизонтали)
    const datesSet = new Set(['День 1', 'День 2', 'День 3', 'День 4', 'День 5']);

    // 3. Создать массив цен на товар (сгенерировать рандомно)
    const basePrices = [];
    for (let i = 0; i < itemsCount; i++) {
        basePrices.push(Math.floor(Math.random() * 900) + 100);
    }

    // Инициализация выпадающих списков интерфейса
    const initSelects = () => {
        const dateSelect = document.getElementById('dateSelect');
        let dayIdx = 0;
        datesSet.forEach(dateStr => {
            const opt = document.createElement('option');
            opt.value = dayIdx; // index from 0
            opt.textContent = dateStr;
            dateSelect.appendChild(opt);
            dayIdx++;
        });

        const itemSelect = document.getElementById('itemSelect');
        itemsMap.forEach((name, id) => {
            const opt = document.createElement('option');
            opt.value = id - 1; // index from 0
            opt.textContent = name;
            itemSelect.appendChild(opt);
        });
    };

    // 4. Функция замыкания (Closure) для пересчета цен
    // Замыкает в себе коэффициент (coef) и тип действия (isIncrease)
    const createPriceCalculator = (coef, isIncrease) => {
        return (basePrice, daysElapsed) => {
            // Формула сложного процента: Цена * (1 +/- coef) ^ дни
            const factor = isIncrease ? (1 + parseFloat(coef)) : (1 - parseFloat(coef));
            // Округляем до 2 знаков
            return (basePrice * Math.pow(factor, daysElapsed)).toFixed(2);
        };
    };

    // 5. Функция DHTML, которая будет использоваться с помощью методов call/apply
    // Ожидает, что this = элемент tbody
    const renderTableCell = function(rowIndex, colIndex, price, highlight = false) {
        const row = this.children[rowIndex];
        if (row) {
            let cell = row.children[colIndex + 1]; // +1 т.к. 0-й индекс это название товара
            if (!cell) {
                cell = document.createElement('td');
                row.appendChild(cell);
            }
            cell.textContent = price;
            
            if (highlight) {
                cell.classList.remove('highlight');
                void cell.offsetWidth; // Триггер рефлоу для перезапуска анимации
                cell.classList.add('highlight');
            }
        }
    };

    // Получение текущих настроек пользователя
    const getCalculator = () => {
        const coef = document.getElementById('coefSelect').value;
        const isIncrease = document.querySelector('input[name="actionType"]:checked').value === 'increase';
        return createPriceCalculator(coef, isIncrease);
    };

    // Отрисовка базовой структуры таблицы
    const initTable = () => {
        const head = document.getElementById('tableHead');
        const body = document.getElementById('priceBody');

        // Заголовки
        head.innerHTML = '<th>Товар \\ Дата</th>';
        datesSet.forEach(date => {
            const th = document.createElement('th');
            th.textContent = date;
            head.appendChild(th);
        });

        // Строки
        body.innerHTML = '';
        itemsMap.forEach((name, id) => {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            tdName.textContent = name;
            tr.appendChild(tdName);
            body.appendChild(tr);
        });

        // Заполнение начальными ценами с использованием apply
        recalcAllTable(false);
    };

    // Пересчет всей таблицы (по умолчанию)
    const recalcAllTable = (highlight = true) => {
        const tbody = document.getElementById('priceBody');
        const calcPrice = getCalculator();

        // Использование стрелочных функций и методов массива ES6
        basePrices.forEach((basePrice, rowIndex) => {
            let colIndex = 0;
            datesSet.forEach(() => {
                const newPrice = calcPrice(basePrice, colIndex);
                // Требование: применение метода apply/call
                renderTableCell.call(tbody, rowIndex, colIndex, newPrice, highlight);
                colIndex++;
            });
        });
    };

    // Пересчет только по выбранной дате (по вертикали колонки)
    const recalcByDate = () => {
        const dateIndex = parseInt(document.getElementById('dateSelect').value);
        const tbody = document.getElementById('priceBody');
        const calcPrice = getCalculator();

        basePrices.forEach((basePrice, rowIndex) => {
            const newPrice = calcPrice(basePrice, dateIndex);
            // Требование: применение метода apply
            renderTableCell.apply(tbody, [rowIndex, dateIndex, newPrice, true]);
        });
    };

    // Пересчет по горизонтали (по типу товара)
    const recalcByItem = () => {
        const itemIndex = parseInt(document.getElementById('itemSelect').value);
        const tbody = document.getElementById('priceBody');
        const calcPrice = getCalculator();
        const basePrice = basePrices[itemIndex];

        let colIndex = 0;
        datesSet.forEach(() => {
            const newPrice = calcPrice(basePrice, colIndex);
            // Использование метода bind
            const renderBound = renderTableCell.bind(tbody, itemIndex, colIndex, newPrice, true);
            renderBound();
            colIndex++;
        });
    };

    // Привязка обработчиков (функции обратного вызова)
    document.getElementById('btnRecalcDate').addEventListener('click', recalcByDate);
    document.getElementById('btnRecalcItem').addEventListener('click', recalcByItem);
    document.getElementById('btnRecalcAll').addEventListener('click', () => recalcAllTable(true));

    // Инициализация
    initSelects();
    initTable();
});
