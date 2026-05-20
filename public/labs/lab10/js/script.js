// Использование jQuery для работы с DHTML и AJAX
$(document).ready(function() {
    
    // Глобальные переменные для хранения текущих данных
    let currentRawData = null;
    let currentSortedData = null;

    // Инициализация инвентаря
    initInventory();

    // Обработка чекбоксов (Формат выводимых чисел)
    // Чтобы работал как радиокнопка
    $('.fmt-checkbox').on('change', function() {
        if ($(this).is(':checked')) {
            $('.fmt-checkbox').not(this).prop('checked', false);
        }
        // Перерисовываем таблицы при изменении формата
        if (currentRawData) renderTable('#rawTableContainer', currentRawData);
        if (currentSortedData) renderTable('#sortedTableContainer', currentSortedData);
    });

    // Функция для получения нужного количества знаков после запятой
    function getDecimals() {
        const checkedBox = $('.fmt-checkbox:checked');
        if (checkedBox.length > 0) {
            return parseInt(checkedBox.val());
        }
        return null; // без форматирования
    }

    // Кнопка: Сгенерировать массив (Запрос к Node.js)
    $('#btnGenerate').click(function() {
        const btn = $(this);
        btn.text('Генерация...').prop('disabled', true);
        
        // jQuery AJAX GET запрос
        $.ajax({
            url: 'http://localhost:3010/api/generate',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                currentRawData = data;
                currentSortedData = null; // сбрасываем сортировку
                $('#sortedTableContainer').html('<div class="placeholder">Ожидание сортировки...</div>');
                renderTable('#rawTableContainer', data);
            },
            error: function(xhr, status, error) {
                alert('Ошибка сервера: Убедитесь, что сервер Node.js для Лабы 10 запущен (node public/labs/lab10/server.js)');
            },
            complete: function() {
                btn.text('Сгенерировать кристаллы').prop('disabled', false);
            }
        });
    });

    // Функция запроса сортировки у сервера
    function requestSort(order) {
        if (!currentRawData) {
            alert('Сначала сгенерируйте массив!');
            return;
        }

        const btn = order === 'asc' ? $('#btnSortAsc') : $('#btnSortDesc');
        const originalText = btn.text();
        btn.text('Ожидание...').prop('disabled', true);

        // По ТЗ: "считав результат из соответствующего файла". Это делает сервер!
        $.ajax({
            url: `http://localhost:3010/api/sort?order=${order}`,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                currentSortedData = data;
                renderTable('#sortedTableContainer', data);
            },
            error: function() {
                alert('Ошибка сортировки на сервере.');
            },
            complete: function() {
                btn.text(originalText).prop('disabled', false);
            }
        });
    }

    $('#btnSortAsc').click(function() { requestSort('asc'); });
    $('#btnSortDesc').click(function() { requestSort('desc'); });

    // DHTML функция для построения 10x10 таблицы
    function renderTable(containerSelector, arrayData) {
        const container = $(containerSelector);
        container.empty();

        const decimals = getDecimals();
        const $table = $('<table></table>');
        
        let index = 0;
        for (let r = 0; r < 10; r++) {
            const $tr = $('<tr></tr>');
            for (let c = 0; c < 10; c++) {
                const $td = $('<td></td>');
                let val = arrayData[index];
                
                // Применение форматирования, если чекбокс отмечен
                if (decimals !== null) {
                    val = val.toFixed(decimals);
                } else {
                    // обрезаем до 6 знаков для красоты, если ничего не выбрано, чтобы не ломать верстку
                    val = Math.round(val * 10000) / 10000;
                }
                
                $td.text(val);
                $tr.append($td);
                index++;
            }
            $table.append($tr);
        }
        
        container.append($table);
    }

    // Инициализация инвентаря
    function initInventory() {
        const WORLDS = [
            { id: 'default', img: '/images/dirt.webp', label: 'Обычный мир (Лаба 1)' },
            { id: 'desert',  img: '/images/desert.png', label: 'Пустыня (Лаба 2)' },
            { id: 'snow',    img: '/images/snow.png', label: 'Снежный мир (Лаба 3)' },
            { id: 'jungle',  img: '/images/лианы.webp', label: 'Джунгли (Лаба 4)' },
            { id: 'ocean',   img: '/images/fish.webp', label: 'Океан (Лаба 5)' },
            { id: 'mushroom',img: '/images/mushroom.png', label: 'Грибной (Лаба 6)' },
            { id: 'nether',  img: '/images/obsidian.webp', label: 'Незер (Лаба 7)' },
            { id: 'end',     img: '/images/end.webp', label: 'Край (Лаба 8)' },
            { id: 'deep_dark', img: '/images/sculk.png', label: 'Древний город (Лаба 9)' },
            { id: 'amethyst', img: '/images/amethyst.png', label: 'Аметистовая жеода (Лаба 10 - Текущая)' }
        ];

        const $grid = $('#inventoryGrid');
        
        WORLDS.forEach(w => {
            const $slot = $('<div></div>').addClass('inv-slot').attr('title', w.label);
            const $img = $('<img>').attr('src', w.img);
            $slot.append($img);
            
            $slot.on('click', function() {
                if (w.id === 'amethyst') {
                    $('#inventoryModal').addClass('hidden');
                } else if (w.id === 'deep_dark') {
                    window.location.href = '/labs/lab9/html/index.html';
                } else {
                    window.location.href = `/?world=${w.id}`;
                }
            });
            
            $grid.append($slot);
        });

        $('#btnOpenInventory').click(function() {
            $('#inventoryModal').removeClass('hidden');
        });

        $('#btnCloseInventory').click(function() {
            $('#inventoryModal').addClass('hidden');
        });
    }
});
