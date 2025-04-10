//será importada a biblioteca do node modules chamada "EXPRESS"
// para criar nosso servidor backend da roleta.
const express = require("express");
const app = express();
const mysql = require("mysql2");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "roletadb" // nome do banco
});

app.use(express.json());

/* ROTA DOS PARTICIPANTES */

// Rota para listar todos os dados de participante, sorteio e empresa
app.get("/participante", (req, res) => {
    const consultas = [
        new Promise((resolve, reject) => {
            con.query("SELECT * FROM participante", (err, result) => {
                if (err) reject({ participante: err });
                else resolve({ participante: result });
            });
        }),
        new Promise((resolve, reject) => {
            con.query("SELECT * FROM sorteio", (err, result) => {
                if (err) reject({ sorteio: err });
                else resolve({ sorteio: result });
            });
        }),
        new Promise((resolve, reject) => {
            con.query("SELECT * FROM empresa", (err, result) => {
                if (err) reject({ empresa: err });
                else resolve({ empresa: result });
            });
        })
    ];

    Promise.all(consultas)
        .then(resultados => {
            const dadosCompletos = Object.assign({}, ...resultados);
            res.status(200).send(dadosCompletos);
        })
        .catch(error => {
            res.status(500).send({
                erro: "Erro ao buscar dados",
                detalhes: error
            });
        });
});

/* ROTAS DA EMPRESA */

app.post("/cadastrar/empresa", (req, res) => {
    con.query("INSERT INTO empresa SET ?", req.body, (error, result) => {
        if (error) return res.status(500).send({ erro: `Erro ao cadastrar: ${error}` });
        res.status(201).send({ msg: "Empresa cadastrada", payload: result });
    });
});

app.put("/atualizar/empresa/:id", (req, res) => {
    con.query("UPDATE empresa SET ? WHERE id = ?", [req.body, req.params.id], (error, result) => {
        if (error) return res.status(500).send({ erro: `Erro ao atualizar: ${error}` });
        res.status(200).send({ msg: "Empresa atualizada", id: req.params.id });
    });
});

app.delete("/apagar/empresa/:id", (req, res) => {
    con.query("DELETE FROM empresa WHERE id = ?", req.params.id, (error, result) => {
        if (error) return res.status(500).send({ erro: `Erro ao deletar: ${error}` });
        res.status(204).send();
    });
});

/* ROTAS DO SORTEIO */

app.post("/cadastrar/sorteio", (req, res) => {
    con.query("INSERT INTO sorteio SET ?", req.body, (error, result) => {
        if (error) return res.status(500).send({ erro: `Erro ao cadastrar: ${error}` });
        res.status(201).send({ msg: "Sorteio cadastrado", payload: result });
    });
});

app.put("/atualizar/sorteio/:id", (req, res) => {
    con.query("UPDATE sorteio SET ? WHERE id = ?", [req.body, req.params.id], (error, result) => {
        if (error) return res.status(500).send({ erro: `Erro ao atualizar: ${error}` });
        res.status(200).send({ msg: "Sorteio atualizado", id: req.params.id });
    });
});

app.delete("/apagar/sorteio/:id", (req, res) => {
    con.query("DELETE FROM sorteio WHERE id = ?", req.params.id, (error, result) => {
        if (error) return res.status(500).send({ erro: `Erro ao deletar: ${error}` });
        res.status(204).send();
    });
});

// Start do servidor
app.listen(3000, () => console.log("Servidor Online em http://127.0.0.1:3000"));
