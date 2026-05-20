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
});
