"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const ws_1 = __importDefault(require("ws"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send({ status: "online", message: "Please connect using the websocket to download!" });
});
app.get('/ws', (req, res) => {
    res.setHeader('Upgrade', 'websocket');
    res.setHeader('Connection', 'Upgrade');
    res.status(101).send(); // Upgrade the connection to WebSocket
});
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
wss.on('connection', (wssc) => {
    console.log('>>> Client connected');
    wssc.on('message', (message) => {
        console.log('Received message => ' + message);
        const videoUrl = JSON.parse(message).url;
        const metadata = { type: 'status', message: "Connection has been established! Now downloading...", videoUrl: videoUrl };
        wssc.send(JSON.stringify(metadata));
        downloadAndStreamVideo(videoUrl, wssc);
    });
    wssc.on('close', () => {
        // Clean up WebSocket resources
    });
});
server.listen(port, () => { console.log(">>> App online"); });
async function downloadAndStreamVideo(videoUrl, wsc) {
    try {
        const info = await ytdl_core_1.default.getInfo(videoUrl);
        const videoTitle = info.videoDetails.title;
        const totalBytes = info.formats.reduce((acc, format) => {
            const contentLength = format.contentLength;
            return contentLength ? acc + parseInt(contentLength) : acc;
        }, 0);
        // Send video title and size to connected WebSocket client
        const metadata = { type: 'metadata', title: videoTitle, size: totalBytes };
        wsc.send(JSON.stringify(metadata));
        // Download the YouTube video and send chunks through the WebSocket
        (0, ytdl_core_1.default)(videoUrl, { quality: 'highest' }).on('data', (chunk) => {
            const message = { type: 'chunk', data: chunk };
            wsc.send(JSON.stringify(message));
        }).on('end', () => {
            const message = { type: 'end' };
            wsc.send(JSON.stringify(message));
            wsc.close();
            console.log(">>> Video download complete");
        });
    }
    catch (error) {
        console.error('Error:', error);
        wsc.close();
    }
}
//# sourceMappingURL=index.js.map