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

//=>para o upload de arquivos.
const multer = require("multer"); 
const path = require("path");
const fs = require("fs");

// Verifica e cria a pasta uploads se não existir
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

//=>PDFKit — para gerar arquivos PDF.
const PDFDocument = require("pdfkit");

//para  não gerar arquivos tão grandes 
const doc = new PDFDocument({size: 'A4'});


//=>csv-parser — para ler arquivos CSV.
const csvParser = require("csv-parser"); 

//=>xlsx — para ler e manipular arquivos Excel (.xls, .xlsx).
const xlsx = require("xlsx");

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

con.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        process.exit(1); // Se houver erro, o servidor não inicia
    } else {
        console.log("Conectado ao banco de dados!");
    }
});

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
    const{nome, equipe, supervisao, id_sorteio, via_qr} = req.body;
        if(!nome || !equipe || !supervisao || !id_sorteio || !via_qr){
            return res.status(400).send({msg: "Campos obrigatórios do participante não preenchidos!"});
            }
            const sql = "insert into participante (nome, equipe, supervisao, sorteio_id, via_qr)values(?, ?, ?, ?, ?)";
            con.query(sql, [nome, equipe, supervisao, id_sorteio, via_qr],(error,result)=>{
            if(error) return res.status(500).send({erro: "Erro ao cadastrar participante", detalhes: error});
                //(500) => erro de servidor.
                res.status(201).send({msg: "Participante cadastrado com sucesso", id: result.insertId});
                //(201) => cadastrado com sucesso.
            });
        });
                
app.put("/participante/:id",(req,res)=>{
    const{nome, equipe, supervisao, id_sorteio, via_qr} = req.body;
    const{id} = req.params;
    //verifica se todos os campos existentes na tabela participante foram preenchidos. 
        if(!nome || !equipe || !supervisao || !id_sorteio || !via_qr){
            return res.status(400).send({ msg: "Campos obrigatórios do participante não preenchidos!"});
            }
            //atualização dos dados já existentes no banco de dados. 
            const sql = "update participante set nome = ?, equipe = ?, supervisao = ?, id_sorteio = ?, via_qr = ? where id = ?";
            con.query(sql, [nome, equipe, supervisao, id_sorteio, via_qr, id],(error,result)=>{
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
        res.status(200).send({msg: 'Sorteio apagado', id: req.params.id}) 
        //a porta (204) foi mudada para a porta (200) 
        //porque a porta 204 apaga o sorteio, mas não retorna informações
        //e a porta 200 apaga o sorteio e retorna com uuma resposta.
        
    });
});

//criar novas 4 rotas para mobile, entra elas, a rota arquivo, para o pdf que seja possivel fazer o upload do PDF
//onde não pode ser enviada como texto.

//cadastrar usuario, adicionar uma rota pra que o participante possa se 
//apagar do sorteio e listar sorteio.

//ROTAS PARA MOBILE

//Configuração do multer
const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null, "uploads/"); //Certifica de que a pasta uploads/ existe
    },
    filename: function (req,file,cb){
        cb(null, Date.now() + path.extname(file.originalname)); //nome único com extensão original
    }
});

//filtro de tipos de arquivos aceitos (CSV, XLSX, e XLS)
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const tiposAceitos = /csv|xlsx|xls/;
        const extname = tiposAceitos.test(path.extname(file.originalname).toLowerCase());
        const mimetype = tiposAceitos.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Apenas arquivos .csv ou Excel são permitidos!"));
        }
    }
});

//função para gerar o PDF com o resultado do sorteio
function gerarPdfDoSorteio(sorteioResultados,res){
    const doc = new PDFDocument();
    const pdfPath = "uploads/resultados_sorteio.pdf";
    doc.pipe(fs.createWriteStream(pdfPath));

    //adiciona título do PDF
    doc.fontSize(16).text("Resultados do Sorteio", {align: "center"});
    doc.moveDown();

    //adiciona os resultados do sorteio
    sorteioResultados.forEach((resultado,index) => {
        doc.text(`${index + 1}. ${JSON.stringify(resultado)}`);
    });

    //finaliza o PDF
    doc.end();

    //retorna o PDF gerado
    doc.on('finish', () => {
        res.status(200).send({ msg: "PDF gerado com sucesso!!", arquivo: pdfPath});
    });
}

//Função para simular o sorteio e gerar o PDF
function realizarSorteio(id_sorteio,res){
    //simulando os resultados do sorteio
    const sorteioResultados = [
        { equipe: "Equipe Marcos", sorteio: Math.random() },
        { equipe: "Equipe Kay", sorteio: Math.random() },
        { equipe: "Equipe Lais", sorteio: Math.random() }
    ];

    //gerar o PDF com os resultados do sorteio
    gerarPdfDoSorteio(sorteioResultados,res);
}

//Rota para MOBILE realizar o sorteio e gerar o PDF
app.post("/realizar-sorteio/:id_sorteio",(req,res)=>{
    const id_sorteio = req.params.id_sorteio;

    //chama a função de realizar o sorteio e gerar o PDF
    realizarSorteio(id_sorteio, res);
});

//rota de upload do arquivo PDF gerado
app.post("/upload/arquivo/:id_sorteio", upload.single("arquivo"),(req,res)=>{
    const id_sorteio = req.params.id_sorteio;
    const nome_arquivo = req.file?.filename;

    if (!nome_arquivo) {
        return res.status(400).send({ erro: "Arquivo não enviado." });
    }

    const arquivoCaminho = path.join(__dirname, "uploads", nome_arquivo);

    //aqui é realizado o processo de salvar o arquivo no banco ou outros passos necessários
    const sql = "insert into arquivos(id_sorteio, nome_arquivo) values (?, ?)";
    con.query(sql, [id_sorteio, nome_arquivo], (error, result) => {
        if (error) return res.status(500).send({ erro: "Erro ao salvar o arquivo.", detalhes: error});
        res.status(201).send({ msg: "Arquivo enviado com sucesso!", arquivo: nome_arquivo});
    });
});

//Rota para cadastrar usuário no MOBILE

app.post("/cadastrar/participante_mobile", async(req, res)=>{ //async transforma a função para lidar com ações assíncronas (que demoram). 
    //ou seja, trata-se de uma função paciente com os resultados 
    const {nome, email, senha} = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).send({ msg: "Campos obrigatórios não preenchidos." });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        //await espera o resultado antes de continuar pro próximo passo.
        const sql = "insert into usuario (nome, email, senha) values (?, ?, ?)";
        con.query(sql, [nome, email, senhaCriptografada], (error, result) => {
            if (error) return res.status(500).send({ erro: "Erro ao cadastrar usuário.", detalhes: error});
            res.status(201).send({ msg: "Usuário cadastrado com sucesso!", id: result.insertId});
        });
    } catch (err){
        res.status(500).send({ erro: "Erro na criptografia da senha", detalhes: err});
    }
});

app.delete("/remover/participante_mobile/:id", (req, res)=>{
    const {id} = req.params;
    const sql = "delete from participante_mobile where id = ?";
    con.query(sql, [id], (error, result) => {
        if(error) return res.status(500).send({ erro: "Erro ao remover participante", detalhes: error});
        if(result.affectedRows === 0) {
            return res.status(404).send({ msg: "Participante não encontrado"});
        }
        res.status(200).send({ msg: "Participante removido com sucesso!", id});
    });
});

app.get("/listar/sorteio",(req, res)=>{
    const sql = `
        select s.id AS id_sorteio, s.nome_responsavel, s.status, s.data_criacao,
               e.nome AS empresa_nome, e.data_sorteio, e.periodo
        FROM sorteio s
        JOIN empresa e ON s.empresa_id = e.id
        ORDER BY s.data_criacao DESC
    `;

    con.query(sql,(error,result)=>{
        if (error) return res.status(500).send({ erro: "Erro ao listar sorteios", detalhes: error});
        res.status(200).send(result);
    });
});


//inicializar servidor
app.listen(3000,
    ()=>console.log("Servidor Online em http://127.0.0.1:3000"));


