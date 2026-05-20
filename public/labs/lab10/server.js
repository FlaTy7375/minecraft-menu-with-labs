import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3010;

// Утилита для генерации массива дробных чисел от 1 до 17
function generateFloatArray() {
    const arr = [];
    for (let i = 0; i < 100; i++) {
        // Случайное дробное число от 1 до 17
        const val = Math.random() * 16 + 1;
        arr.push(val);
    }
    return arr;
}

const server = http.createServer((req, res) => {
    // Настройки CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/api/generate' && req.method === 'GET') {
        // Генерация данных "до обработки"
        const arr = generateFloatArray();
        const rawFilePath = path.join(__dirname, 'data_raw.json');
        
        // Запись в файл (fs)
        fs.writeFileSync(rawFilePath, JSON.stringify(arr), 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(arr));
        
    } else if (url.pathname === '/api/sort' && req.method === 'GET') {
        const order = url.searchParams.get('order'); // 'asc' или 'desc'
        const rawFilePath = path.join(__dirname, 'data_raw.json');
        
        if (!fs.existsSync(rawFilePath)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Сначала необходимо сгенерировать массив (файл не найден)' }));
            return;
        }

        // Считываем результат из файла (по ТЗ)
        const rawDataStr = fs.readFileSync(rawFilePath, 'utf8');
        const arr = JSON.parse(rawDataStr);
        
        // Обработка (сортировка)
        if (order === 'desc') {
            arr.sort((a, b) => b - a);
        } else {
            arr.sort((a, b) => a - b);
        }
        
        // Запись результата в соответствующий файл "после обработки"
        const sortedFilePath = path.join(__dirname, `data_${order}.json`);
        fs.writeFileSync(sortedFilePath, JSON.stringify(arr), 'utf8');
        
        // Чтение результата из соответствующего файла и отправка (строго по ТЗ: "считав результат из соответствующего файла")
        const sortedDataStr = fs.readFileSync(sortedFilePath, 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(sortedDataStr);
        
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`[Lab 10] Сервер Node.js (с модулем fs) запущен на порту ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`GET http://localhost:${PORT}/api/generate`);
    console.log(`GET http://localhost:${PORT}/api/sort?order=asc|desc`);
    console.log(`===================================================`);
});
//node public/labs/lab10/server.js