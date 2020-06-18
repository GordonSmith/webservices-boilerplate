import express from "express";
import Docker from "dockerode";

const app = express();
const port = 3000;

const docker = new Docker();

const sesionState: { [sessionID: string]: { serverID: string, status: string } } = {};

const status = (sessionID) => ({ sessionID, status: sesionState[sessionID] || "unknown" });

let sessionIdx = 0;

//  Routes  ---
app.get("/servers", (_req, res) => {
    docker.listImages((err, images) => {
        res.json(images);
    });
});

app.get("/status", (req, res) => {
    res.send(sesionState);
});

app.get("/start", (req, res) => {
    const sessionID = `s-${++sessionIdx}`;
    sesionState[sessionID] = {
        serverID: req.query.serverID as string,
        status: "starting"
    }
    res.json(status(sessionID));
});

app.get("/stop", (req: any, res) => {
    if (sesionState[req.query.sessionID]) {
        sesionState[req.query.sessionID].status = "stopping";
    }
    res.json(status(req?.query?.sessionID));
});

//  Default Handling  ---
app.use((_req, res, _next) => {
    res.status(404).send(`\
    <h1>Unknown API call</h1>
    <h2>Usage:</h2>
    <ul>
    <li><a href="/servers">servers</a></li>
    <li><a href="/status">status</a></li>
    <li><a href="/start?serverID=server-1">start?serverID=server-1</a></li>
    <li><a href="/stop?sessionID=s-1">stop?sessionID=s-1</a></li>
    <ul>
`)
});

//  Error Handling  ---
app.use((err, _req, res, _next) => {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

//  Start Server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

