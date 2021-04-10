const express = require("express");
const https = require("https");
const fs = require("fs");

const socketio = require("socket.io");

const { spawn, exec } = require("child_process");

const port = 443;

const index = fs.readFileSync("./client/index.html").toString();
const script = fs.readFileSync("./client/script.js").toString();
const style = fs.readFileSync("./client/style.css").toString();


var processes = []
var io;

const app = express();
app.get("/", (req, res) => {
    res.send(index);
});
app.get("/script.js", (req, res) => {
    res.send(script);
});
app.get("/style.css", (req, res) => {
    res.send(style);
});

app.get("/process/new", (req, res) => {

    if (req.query.name && req.query.cmd) {
        if (processes.find((process) => (process.name === req.query.name))) {
            res.send(JSON.stringify({
                success: false,
            }));
            return;
        }
        res.send(JSON.stringify({
            success: true,
            name: req.query.name,
        }));

        const bruh = "echo cunt".match(/".+"|[^\s]+/g);

        const command = spawn(bruh.shift(), bruh);
        const i = processes.length;
        processes.push({
            name: req.query.name,
            current_command: req.query.cmd,
            idle: false,
            stdout: "",
            stderr: "",
        });
        command.stdout.on("data", (data) => {
            processes[i].stdout += data;
            io.emit(`stdout-add`, { process: req.query.name, add: data });
        });
        command.stderr.on("data", (data) => {
            processes[i].stderr += data;
        });
        command.on("error", (error) => {
            console.log("Error: ", error);
        })
        command.on("close", (code) => {
            console.log(processes[i].stdout, "\nCode: ", code);
        })

        io.emit("process-list-update", processes);
        return;
    }
    req.send(JSON.stringify({ success: false }));
});

app.get("/stop", (req, res) => {
    res.send(JSON.stringify({ success: true }));
    console.log("stopping");
    process.kill(process.pid, "SIGTERM");
});

app.get("/process/view", (req, res) => {
    if (req.query.process) {
        const found = processes.find((process) => process.name === req.query.process);
        if (found)
            res.send(JSON.stringify({ success: true, stdout: found.stdout }));
        else
            res.send(JSON.stringify({ success: false }));
    } else {
        res.send(JSON.stringify({ processes: processes }));
    }
});

app.post("/update/client", (req, res) => {
    if (req.body.script)
        fs.writeFileSync("./client/script.js", req.body.script);
});

const server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)

    io = socketio(server);

    io.on("connection", (socket) => {

    });
});