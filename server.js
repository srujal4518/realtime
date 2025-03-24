const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const translate = require("google-translate-api-x");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("translate", async ({ text, from, to }) => {
        if (!text) return;
        try {
            const translation = await translate(text, { from, to });
            socket.emit("translated", { translatedText: translation.text });
        } catch (error) {
            console.error("Translation error:", error);
            socket.emit("error", { message: "Translation failed" });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(5000, () => {
    console.log("Server running on http://127.0.0.1:5000");
});
