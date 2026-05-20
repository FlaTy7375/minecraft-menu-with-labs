document.addEventListener('DOMContentLoaded', () => {
    // 1. Хранение данных с применением Map и Set
    const slidesMap = new Map([
        [0, { src: '/images/slider_ad1.png', text: 'Minecraft Labs Inc. - Ваше будущее уже здесь. Штаб-квартира.' }],
        [1, { src: '/images/slider_ad2.png', text: 'Инновации - Голографический верстак с красной пылью.' }],
        [2, { src: '/images/slider_ad3.png', text: 'Исследования - Изучение парящего алмазного блока.' }],
        [3, { src: '/images/slider_ad4.png', text: 'Автоматизация - Бесконечная фабрика золотых слитков.' }],
        [4, { src: '/images/slider_ad5.png', text: 'Серверная - Аметистовые кристаллы питают наши базы данных.' }],
        [5, { src: '/images/slider_ad6.png', text: 'Логистика - Телепортационный хаб с командными блоками.' }],
        [6, { src: '/images/slider_ad7.png', text: 'Энергетика - Звезда Незера как бесконечный источник энергии.' }]
    ]);

    const messagesSet = new Set([
        'Ожидание запуска...',
        'Подготовка к показу (Трансгрессия в Край)...',
        'Показ приостановлен.'
    ]);

    // DOM Элементы
    const imgElement = document.getElementById('slider-image');
    const capElement = document.getElementById('slider-caption');
    const inputStartDelay = document.getElementById('inputStartDelay');
    const inputDelay = document.getElementById('inputDelay');
    const overlay = document.getElementById('fullscreen-overlay');
    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const btnRestart = document.getElementById('btnRestart');

    // Состояние
    let currentIndex = 0;
    let timerId = null;
    let isPlaying = false;

    // Инициализация
    const messagesArray = Array.from(messagesSet); // Использование встроенного метода
    capElement.textContent = messagesArray[0];
    const initialSlide = slidesMap.get(0);
    imgElement.src = initialSlide.src;

    // Callback-функция, которая будет выполняться отложенно (setTimeout)
    const showNextSlide = () => {
        if (!isPlaying) return;

        if (currentIndex >= slidesMap.size) {
            // Конец показа: вывести сообщение на весь экран
            isPlaying = false;
            overlay.classList.remove('hidden');
            capElement.textContent = "Показ завершен";
            return;
        }

        const data = slidesMap.get(currentIndex);
        const currentSlideNumber = currentIndex + 1; // Захватываем текущий номер для асинхронного таймаута
        
        // Плавная смена слайда (CSS transition)
        imgElement.style.opacity = 0;
        
        setTimeout(() => {
            imgElement.src = data.src;
            capElement.textContent = `[Слайд ${currentSlideNumber}/${slidesMap.size}] ${data.text}`;
            imgElement.style.opacity = 1;
        }, 400); // Время на затухание

        currentIndex++;

        // Считываем временной промежуток между картинками, заданный пользователем
        const intervalDelay = parseInt(inputDelay.value) || 2000;
        
        // Рекурсивный отложенный вызов (deloy callback)
        timerId = setTimeout(showNextSlide, intervalDelay);
    };

    // Запуск/возобновление слайдера
    const startSlider = () => {
        if (isPlaying) return; // Защита от двойного старта
        
        // Временной промежуток перед началом демонстрации
        const startDelay = parseInt(inputStartDelay.value) || 1000;
        
        capElement.textContent = messagesArray[1]; // Подготовка...
        isPlaying = true;

        // Отложенное выполнение запуска (setTimeout(func, delay))
        setTimeout(() => {
            // Если мы уже дошли до конца, начинаем сначала
            if (currentIndex >= slidesMap.size) {
                currentIndex = 0;
            }
            showNextSlide();
        }, startDelay);
    };

    // Остановка показа
    const stopSlider = () => {
        if (!isPlaying) return;
        isPlaying = false;
        
        if (timerId !== null) {
            clearTimeout(timerId); // Отменяем запланированный коллбек
            timerId = null;
        }
        
        capElement.textContent = messagesArray[2]; // Показ приостановлен
        imgElement.style.opacity = 1;
    };

    // Привязка событий
    btnStart.addEventListener('click', startSlider);
    btnStop.addEventListener('click', stopSlider);
    btnRestart.addEventListener('click', () => {
        // Скрыть оверлей и запустить заново
        overlay.classList.add('hidden');
        currentIndex = 0;
        isPlaying = false; // Сбрасываем статус, чтобы startSlider отработал
        startSlider();
    });
});
