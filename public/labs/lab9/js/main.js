import { generateRandomArray, getSortedArray, getMaxElementInfo } from './arrayModule.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnGenerate = document.getElementById('btnGenerate');
    const tableContainer = document.getElementById('tableContainer');
    const sortedList = document.getElementById('sortedList');
    const maxElementSpan = document.getElementById('maxElement');

    btnGenerate.addEventListener('click', async () => {
        btnGenerate.textContent = 'Установка связи с сервером...';
        btnGenerate.disabled = true;

        try {
            // 1. Клиент-серверное взаимодействие: запрос к Node.js серверу
            const response = await fetch('http://localhost:3009/api/data');
            if (!response.ok) {
                throw new Error('Ответ сервера не OK');
            }
            // Получаем сгенерированный сервером массив (100 элементов от 1 до 17)
            const rawArray = await response.json();
            
            // 2. Поиск максимума (бизнес-логика из модуля)
            const { maxVal, index: maxIndex } = getMaxElementInfo(rawArray);
            
            // 3. Отдельный вывод максимального элемента на странице
            maxElementSpan.textContent = maxVal;
            
            // 4. Отрисовка элементов массива в таблице 10х10 через DHTML
            renderTable(rawArray, maxIndex);
            
            // 5. Сортировка массива по возрастанию (бизнес-логика из модуля)
            const sortedArr = getSortedArray(rawArray);
            
            // 6. Вывод отсортированного массива
            renderSortedList(sortedArr);
            
            btnGenerate.textContent = 'Сканировать область (сгенерировать массив)';
        } catch (err) {
            console.error(err);
            alert('Ошибка подключения к серверу Node.js!\n\nУбедитесь, что вы запустили сервер командой:\nnode public/labs/lab9/server.js');
            btnGenerate.textContent = 'Ошибка! Повторить сканирование?';
        } finally {
            btnGenerate.disabled = false;
        }
    });

    /**
     * Создает DOM таблицу 10x10 и заполняет её элементами массива
     * @param {Array<number>} arr 
     * @param {number} maxIndex 
     */
    function renderTable(arr, maxIndex) {
        tableContainer.innerHTML = ''; // Очистка плейсхолдера или старой таблицы
        
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        
        let arrIndex = 0;
        for (let row = 0; row < 10; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 10; col++) {
                const td = document.createElement('td');
                const val = arr[arrIndex];
                td.textContent = val;
                
                // Подсветка первого максимального элемента (креативное оформление)
                if (arrIndex === maxIndex) {
                    td.classList.add('max-cell');
                    td.title = "Внимание: Максимальный скалк-сигнал!";
                }
                
                tr.appendChild(td);
                arrIndex++;
            }
            tbody.appendChild(tr);
        }
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

    /**
     * Отрисовка списка отсортированных элементов с кастомными маркерами
     * @param {Array<number>} arr 
     */
    function renderSortedList(arr) {
        sortedList.innerHTML = ''; // Очистка
        
        arr.forEach((val, i) => {
            const li = document.createElement('li');
            li.textContent = `Индекс [${i}]: Уровень сигнала ${val}`;
            sortedList.appendChild(li);
        });
    }

    // Логика инвентаря для быстрого перехода к другим мирам
    const btnOpenInventory = document.getElementById('btnOpenInventory');
    const btnCloseInventory = document.getElementById('btnCloseInventory');
    const inventoryModal = document.getElementById('inventoryModal');
    const inventoryGrid = document.getElementById('inventoryGrid');

    const WORLDS = [
        { id: 'default', img: '/images/dirt.webp', label: 'Обычный мир (Лаба 1)' },
        { id: 'desert',  img: '/images/desert.png', label: 'Пустыня (Лаба 2)' },
        { id: 'snow',    img: '/images/snow.png', label: 'Снежный мир (Лаба 3)' },
        { id: 'jungle',  img: '/images/лианы.webp', label: 'Джунгли (Лаба 4)' },
        { id: 'ocean',   img: '/images/fish.webp', label: 'Океан (Лаба 5)' },
        { id: 'mushroom',img: '/images/mushroom.png', label: 'Грибной (Лаба 6)' },
        { id: 'nether',  img: '/images/obsidian.webp', label: 'Незер (Лаба 7)' },
        { id: 'end',     img: '/images/end.webp', label: 'Край (Лаба 8)' },
        { id: 'deep_dark', img: '/images/sculk.png', label: 'Древний город (Лаба 9 - Текущая)' },
        { id: 'amethyst', img: '/images/amethyst.png', label: 'Аметистовая жеода (Лаба 10)' },
    ];

    WORLDS.forEach(w => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.title = w.label;
        
        const img = document.createElement('img');
        img.src = w.img;
        slot.appendChild(img);
        
        slot.addEventListener('click', () => {
            if (w.id === 'deep_dark') {
                inventoryModal.classList.add('hidden'); // Мы уже здесь
            } else if (w.id === 'amethyst') {
                window.location.href = '/labs/lab10/html/index.html';
            } else {
                // Перенаправляем обратно в React-приложение (в корень) и передаем параметр
                window.location.href = `/?world=${w.id}`;
            }
        });
        
        inventoryGrid.appendChild(slot);
    });

    btnOpenInventory.addEventListener('click', () => {
        inventoryModal.classList.remove('hidden');
    });

    btnCloseInventory.addEventListener('click', () => {
        inventoryModal.classList.add('hidden');
    });
});
