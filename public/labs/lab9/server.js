import http from 'http';

const PORT = 3009;

// Создаем Node.js сервер
const server = http.createServer((req, res) => {
    // Включаем CORS для обеспечения связи между клиентом (React/Vite на порту 5173/3000) и этим API сервером
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка Preflight-запросов (CORS)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Маршрутизация (API endpoint для получения данных)
    if (req.url === '/api/data' && req.method === 'GET') {
        // Бизнес-логика на стороне сервера: 
        // Создание массива из 100 элементов (случайные значения от 1 до 17)
        const arr = [];
        for (let i = 0; i < 100; i++) {
            arr.push(Math.floor(Math.random() * 17) + 1);
        }
        
        // Отправка данных клиенту в формате JSON
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(arr));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Маршрут не найден. Используйте GET /api/data');
    }
});

server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`[Lab 9] Сервер успешно запущен на порту ${PORT}`);
    console.log(`[Lab 9] API доступно по адресу: http://localhost:${PORT}/api/data`);
    console.log(`[Lab 9] Теперь вы можете нажать кнопку в клиенте!`);
    console.log(`===================================================`);
});
//node public/labs/lab9/server.js