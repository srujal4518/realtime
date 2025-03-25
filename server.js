const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const translate = require("google-translate-api-x");
const Sentiment = require("sentiment");

const sentiment = new Sentiment();
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
        if (!text.trim()) return;

        try {
            // Perform translation
            const translation = await translate(text, { from, to });

            // Perform sentiment analysis
            const sentimentResult = sentiment.analyze(text);
            let mood = "Neutral 😐";

            if (sentimentResult.score > 1) {
                mood = "Happy 😊";
            } else if (sentimentResult.score < -1) {
                mood = "Sad 😞";
            }

            // Emit translation and mood analysis
            socket.emit("translated", { translatedText: translation.text, mood });

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
