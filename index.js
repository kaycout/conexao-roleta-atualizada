// Projeto: API da Roleta de Equipes.
// Descrição: Backend desenvolvido com Node.js, Express e MySQL para gerenciar dados de participantes, empresas e sorteios.

//será importada a biblioteca do node modules chamada "EXPRESS"
// para criar nosso servidor backend da roleta.
const express = require("express");

//importar a biblioteca do mysql
const mysql = require("mysql2");

//importar a biblioteca do cors
const cors = require("cors");

//importar a biblioteca do bcrypt
//para a criptografia de senha.
const bcrypt = require("bcrypt");

const con = mysql.createConnection({
    host: "localhost",
    port:3307,
    user: "root",
    password: "",
    database: "roletadb" // conectando o banco de dados.
});

//agora vamos instanciar o express para utilizar as rotas.
//get => para listar.
//post => para enviar dados para o banco.
//put => atualiza os dados do banco.
//delete => apaga os dados do banco.

const app = express(); //criaçao do app, ele controla tudo no servidor, responsável por organizar
//o que entra ou o que sai, o que quer, o que vai e o que responder.

//carrega a função que manipula e permite ler, gravar, atualizar, deletar, enviar e receber
//os dados em formato json.
app.use(express.json());

//ativa o modo cors
app.use(cors()); //responsavel por permitir ou bloquear acesso de outros domínios, ou seja quando 
//houver tentativa de acessar a API do servidor, o cors controla se é permitido ou não. 
//Exemplo: Se minha API estiver rodando em http://localhost:3000 e deseja acessar a partir de um site 
//que está em http://localhost:5173, o cors() precisa estar ativado, senão por medidas de segurança
//o navegador irá bloquear.

//ROTA DOS PARTICIPANTES

//rota para listar todos os dados dos participantes, sorteio e empresa.
app.get("/participante",(req,res)=>{
    const consultas = [
        new Promise((resolve, reject)=>{ //se trata de uma promessa, e ela verifica se está tudo certo  
            //no banco de dados, e, com o reject é retornado uma resposta.
            con.query("select * from participante", (error,result)=>{
                if(error) reject({ participante: error});
                else resolve({ participante: result});
            });
        }),
        new Promise((resolve, reject) => {
            con.query("Select * from sorteio", (error,result)=>{
                if(error) reject({ sorteio: error});
                else resolve({ sorteio: result});
            });
        }),
        new Promise((resolve, reject) => {
            con.query("Select * from empresa", (error,result)=>{
                if(error) reject({ empresa: error});
                else resolve({ empresa: result});
            });
        })
    ];

    Promise.all(consultas)
    //o Promise.all recebe as promises (consultas ao banco)
    //e ele aguarda todas serem resolvidas com sucesso
    //e então retorna os resultados.
    //caso aconteça de qualquer uma das promises falhar, o .catch é acionado.
        .then(resultados=>{
            const dadosCompletos = Object.assign({}, ...resultados);
            res.status(200).send(dadosCompletos); //entrega os dados com sucesso.
        })
        .catch(error=>{
            res.status(500).send({ //se erro na consulta, retorna com (500) erro interno. 
                erro: "Erro ao buscar dados",
                detalhes: error
            });
        });

});

app.post("/participante",(req,res)=>{
    const{nome, equipe, supervisao, sorteio_id, via_qr} = req.body;
        if(!nome || !equipe || !supervisao || !sorteio_id || !via_qr){
            return res.status(400).send({msg: "Campos obrigatórios do participante não preenchidos!"});
            }
            const sql = "insert into participante (nome, equipe, supervisao, sorteio_id, via_qr)values(?, ?, ?, ?, ?)";
            con.query(sql, [nome, equipe, supervisao, sorteio_id, via_qr],(error,result)=>{
            if(error) return res.status(500).send({erro: "Erro ao cadastrar participante", detalhes: error});
                //(500) => erro de servidor.
                res.status(201).send({msg: "Participante cadastrado com sucesso", id: result.insertId});
                //(201) => cadastrado com sucesso.
            });
        });
                
app.put("/participante/:id",(req,res)=>{
    const{nome, equipe, supervisao, sorteio_id, via_qr} = req.body;
    const{id} = req.params;
    //verifica se todos os campos existentes na tabela participante foram preenchidos. 
        if(!nome || !equipe || !supervisao || !sorteio_id || !via_qr){
            return res.status(400).send({ msg: "Campos obrigatórios do participante não preenchidos!"});
            }
            //atualização dos dados já existentes no banco de dados. 
            const sql = "update participante set nome = ?, equipe = ?, supervisao = ?, sorteio_id = ?, via_qr = ? where id = ?";
            con.query(sql, [nome, equipe, supervisao, sorteio_id, via_qr, id],(error,result)=>{
            if(error) return res.status(500).send({erro: "Erro ao atualizar participante", detalhes: error});
            //(500) => erro de servidor.
            res.status(200).send({msg: "Participante atualizado com sucesso!", id});
            //(200) => atualizado com sucesso.
            });
        });  
        
app.delete("/participante/:id",(req,res)=>{
    const{id} = req.params;
    const sql = "delete from participante where id = ?";
        con.query(sql, [id],(error,result)=>{
            if(error) return res.status(500).send({erro: "Erro ao apagar participante", detalhes: error});
            //(500) => erro de servidor.
            res.status(200).send({msg: "Participante apagado com sucesso", id});
            //(200) => apagado com sucesso.
        });
    });

//ROTAS DA EMPRESA
app.post("/cadastrar/empresa",(req,res)=>{
    con.query("insert into empresa set ?", req.body,(error,result)=>{
        if(error) return res.status(500).send({ erro: `Erro ao cadastrar empresa: ${error}`});
        res.status(201).send({ msg: "Empresa cadastrada", payload: result});
        //se criado com sucesso, retorna com (201) => nova empresa cadastrada no banco de dados.
    });
});

app.put("/atualizar/empresa/:id",(req,res)=>{
    con.query("update empresa set ? where id = ?", [req.body, req.params.id],(error,result)=>{
        if(error) return res.status(500).send({ erro: `Erro ao atualizar empresa: ${error}`});
        res.status(200).send({ msg: "Empresa atualizada", id: req.params.id});
        //se uma empresa que já existe no banco  de dados for atualizada com sucesso, 
        //retorna com (200) => empresa atualizada no banco de dados com sucesso.
        //req.params.id => mostra o id da empresa que foi atualizada.
        
        
    });
});

app.delete("/apagar/empresa/:id",(req,res)=>{
    con.query("delete from empresa where id = ?",req.params.id,(error,result)=>{
        if(error) return res.status(500).send({ erro: `Erro ao apagar empresa: ${error}`});
        res.status(204).send(); //se apagado com sucesso, retorna com (204) => operacação
        //bem sucedida sem conteúdo para ser retornado.
    });
});

//ROTAS DO SORTEIO

app.post("/cadastrar/sorteio",(req,res)=>{
    con.query("insert into sorteio set ?", req.body,(error,result)=>{
        if(error) return res.status(500).send({ erro: `Erro ao cadastrar sorteio: ${error}`});
        res.status(201).send({ msg: "Sorteio cadastrado", payload: result});
        //(201) => novo sorteio cadastrado. 
    });
});

app.put("/atualizar/sorteio/:id",(req,res)=>{
    con.query("update sorteio set ? where id = ?",[req.body, req.params.id], (error,result)=>{
        if(error) return res.status(500).send({ erro: `Erro ao atualizar sorteio: ${error}`});
        res.status(200).send({ msg: "Sorteio atualizado", id: req.params.id});
        //(200) => sorteio atualizado.
    });
});

app.delete("/apagar/sorteio/:id",(req,res)=>{
    con.query("delete from sorteio where id = ?",req.params.id,(error,result) =>{
        if(error) return res.status(500).send({ erro: `Erro ao apagar sorteio: ${error}`});
        res.status(200).send({msg: 'Sorteio apagado',id:req.params.id}) 
        //a porta (204) foi mudada para a porta (200) 
        //porque a porta 204 apaga o sorteio, mas não retorna informações
        //e a porta 200 apaga o sorteio e retorna com uuma resposta.
        
    });
});

//inicializar servidor
app.listen(3000,
    ()=>console.log("Servidor Online em http://127.0.0.1:3000"));
