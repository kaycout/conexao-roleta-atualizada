//Projeto: API da Roleta de Equipes.
//Descrição: Backend desenvolvido com Node.js, Express e MySQL para gerenciar dados de participantes, empresas e sorteios.

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

//verifica e cria a pasta uploads se não existir
if (!fs.existsSync("uploads")){
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

app.post("/participante",(req, res)=>{
    console.log(req.body);
    
    let {nomes, equipes, supervisoes, id_sorteios, via_qr} = req.body;
    
    //define valor padrão para via_qr se não for enviado
    if (typeof via_qr === "undefined"){
        via_qr = [];
    }
    
    //verificação dos campos obrigatórios (arrays não podem estar vazios)
    if (!nomes || !equipes || !supervisoes || !id_sorteios || nomes.length === 0 || equipes.length === 0 || supervisoes.length === 0 || id_sorteios.length === 0) {
        return res.status(400).send({ msg: "Campos obrigatórios do participante não preenchidos!" });
    }
    
    //verifica se todas as arrays têm o mesmo tamanho
    if (nomes.length !== equipes.length || nomes.length !== supervisoes.length || nomes.length !== id_sorteios.length || nomes.length !== via_qr.length) {
        return res.status(400).send({ msg: "As arrays devem ter o mesmo comprimento!" });
    }
    
    //montagem da query dinâmica
    let insertQuery = "insert into participante (nome, equipe, supervisao, id_sorteio, via_qr)values";
    let values = [];
    let params = [];
    
    for (let i = 0; i < nomes.length; i++){
        values.push(`(?, ?, ?, ?, ?)`);
        params.push(nomes[i], equipes[i], supervisoes[i], id_sorteios[i], via_qr[i]);
    }
    
    insertQuery += values.join(", ");
    
    con.query(insertQuery, params, (error, result)=>{
    if (error){
        return res.status(500).send({ erro: "Erro ao cadastrar participantes", detalhes: error});
    }
    res.status(201).send({ msg: `${result.affectedRows} participantes cadastrados com sucesso!`, id_inicial: result.insertId });
        });
    });
        
app.put("/participante/:id",(req,res)=>{
    const id = req.params.id;
    let {nome, equipe, supervisao, via_qr, id_sorteio} = req.body;

    //define um valor padrão se via_qr não for enviado
    if(typeof via_qr === "undefined"){
        via_qr = false;
    }

    //verificação apenas dos campos obrigatórios
    if (!nome || !equipe || !supervisao || !id_sorteio){
        return res.status(400).send({ msg: "Campos obrigatórios do participante não preenchidos!"});
        //(400) => erro de requisição do participante por dados incompletos.
    }

    //atualização dos dados já existentes no banco de dados.
    const updateQuery = `
        update participante 
        set nome = ?, equipe = ?, supervisao = ?, via_qr = ?, id_sorteio = ? 
        where id_participante = ?
    `;
    con.query(updateQuery, [nome, equipe, supervisao, via_qr, id_sorteio, id], (err,result)=>{
        if(err) return res.status(500).send({ erro: "Erro ao atualizar participante", detalhes: err});
        //(500) => erro de servidor.

        if(result.affectedRows === 0){
            return res.status(404).send({ msg: "Participante não encontrado"});
            //(404) => participante não encontrado.
        }

        res.status(200).send({ msg: "Participante atualizado com sucesso!"});
        //(200) =>participante atualizado com sucesso.
    });
});

app.delete("/participante/:id",(req, res)=>{
    const {id} = req.params;
    const sql = "delete from participante where id_participante = ?";

    con.query(sql, [id], (error,result)=>{
        if (error) return res.status(500).send({ erro: "Erro ao apagar participante", detalhes: error});
           //(500) => participante não apagado.

        res.status(200).send({ msg: "Participante apagado com sucesso", id});
         //(200) =>participante apagado com sucesso.
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

app.put("/empresa/:id",(req,res)=>{
    const id = req.params.id;
    const {nome, empreendimento, data_sorteio, periodo} = req.body;

    //verifica se os campos obrigatórios estão preenchidos
    if(!nome || !empreendimento || !data_sorteio || !periodo){
        return res.status(400).send({ msg: "Campos obrigatórios da empresa não preenchidos!"});
    }

    //atualiza os dados da empresa com base no id_empresa
    const sql = `
        update empresa 
        set nome = ?, empreendimento = ?, data_sorteio = ?, periodo = ?
        where id_empresa = ?
    `;

    con.query(sql, [nome, empreendimento, data_sorteio, periodo, id], (err,result)=>{
        if(err) return res.status(500).send({ erro: "Erro ao atualizar empresa", detalhes: err});

        if(result.affectedRows === 0){
            return res.status(404).send({ msg: "Empresa não encontrada"});
            //se empresa não encontrada, retorna com erro de usuário => 404.
        }
        res.status(200).send({ msg: "Empresa atualizada com sucesso!"});
        //se uma empresa que já existe no banco de dados for atualizada com sucesso, 
        //retorna com (200) => empresa atualizada no banco de dados com sucesso.
        //req.params.id => mostra o id da empresa que foi atualizada. 
    });
});
           
app.delete("/empresa/:id",(req,res)=>{
    const {id} = req.params;
    const sql = "delete from empresa where id_empresa = ?";

    con.query(sql, [id], (error,result)=>{
        if (error) return res.status(500).send({ erro: "Erro ao tentar apagar empresa", detalhes: error});
           //(500) => empresa não apagado.

        res.status(200).send({ msg: "Sucesso ao apagar empresa", id});
         //(200) =>empresa apagada com sucesso.
    });
});

//ROTAS DO SORTEIO

app.post("/cadastrar/sorteio",(req,res)=>{
    con.query("insert into sorteio set ?", req.body,(error,result)=>{
        if(error) return res.status(500).send({ erro: `Erro ao cadastrar sorteio: ${error}`});
        res.status(201).send({ msg: "Sorteio cadastrado com sucesso!", payload: result});
        //(201) => sorteio cadastrado com sucesso. 
    });
});

// Rota para atualizar um sorteio existente no banco de dados
app.put("/sorteio/:id",(req,res)=>{
    //pega o ID do sorteio pela URL
    const id = req.params.id;

    //desestrutura os campos do corpo da requisição
    const {nome_responsavel, email_responsavel, senha_responsavel, data_criacao, status} = req.body;

    // verificação básica dos campos obrigatórios
    if(!nome_responsavel || !email_responsavel || !senha_responsavel || !data_criacao || !status){
        return res.status(400).send({ msg: "Campos obrigatórios do sorteio não preenchidos!"});
    }

    //query SQL para atualizar o sorteio no banco
    const sql = `
        update sorteio
        set nome_responsavel = ?, email_responsavel = ?, senha_responsavel = ?, data_criacao = ?, status = ?
        where id = ?
    `;

    //executa a query no banco de dados
    con.query(sql, [nome_responsavel, email_responsavel, senha_responsavel, data_criacao, status, id], (err,result)=>{
        if(err){
            //erro interno do servidor ao tentar atualizar
            return res.status(500).send({ erro: "Erro ao atualizar sorteio, tente novamente", detalhes: err});
        }

        if (result.affectedRows === 0){
            // sorteio não encontrado para atualizar
            return res.status(404).send({ msg: "Sorteio não encontrado"});
            //se sorteio não encontrado, ele responde com erro => (404).
        }

        //sucesso na atualização
        res.status(200).send({ msg: "Sorteio atualizado com sucesso!"});
    });
});


app.delete("/sorteio/:id",(req,res)=>{
const {id} = req.params;
const sql = "delete from sorteio where id = ?";
        
         con.query(sql, [id], (error,result)=>{
        if (error) return res.status(500).send({ erro: "Erro ao tentar apagar sorteio", detalhes: error});
        //(500) => empresa não apagado.
        
        res.status(200).send({ msg: "Sucesso ao apagar sorteio!", id});
        //(200) =>empresa apagada com sucesso.
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
    fileFilter: (req,file,cb)=>{
        const tiposAceitos = /csv|xlsx|xls/;
        const extname = tiposAceitos.test(path.extname(file.originalname).toLowerCase());
        const mimetype = tiposAceitos.test(file.mimetype);

        if (extname && mimetype){
            return cb(null, true);
        } else {
            cb(new Error("Apenas arquivos .csv ou Excel são permitidos!"));
        }
    }
});

//função para gerar o PDF com o resultado do sorteio
function gerarPdfDoSorteio(sorteioResultados,res){
    const pdfPath = path.join(__dirname, "uploads", "resultados_sorteio.pdf");
    
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    //adiciona título do PDF
    doc.fontSize(16).text("Resultados do Sorteio",{align: "center"});
    doc.moveDown();

    //adiciona os resultados do sorteio
    sorteioResultados.forEach((resultado,index)=>{
        doc.text(`${index + 1}. ${JSON.stringify(resultado)}`);
    });

    //finaliza o PDF
    doc.end();

    //responde apenas depois que o PDF terminar de salvar
    writeStream.on('finish',()=>{
        res.status(200).send({
            msg: "PDF gerado com sucesso!!",
            arquivo: "uploads/resultados_sorteio.pdf"
        });
    });

    writeStream.on('error',(err)=>{
        res.status(500).send({ erro: "Erro ao gerar PDF", detalhes: err});
    });
}

//Função para simular o sorteio e gerar o PDF
function realizarSorteio(id_sorteio,res){
    //simulando os resultados do sorteio
    const sorteioResultados = [
        { equipe: "Equipe Marcos", sorteio: Math.random()},
        { equipe: "Equipe Kay", sorteio: Math.random()},
        { equipe: "Equipe Lais", sorteio: Math.random()}
    ];

    //gerar o PDF com os resultados do sorteio
    gerarPdfDoSorteio(sorteioResultados,res);
}

//Rota para MOBILE realizar o sorteio e gerar o PDF
app.post("/realizar-sorteio/:id_sorteio", async(req, res)=>{
    const id_sorteio = req.params.id_sorteio;
  
    try{
    //busca todos os participantes desse sorteio
    const [participantes] = await connection.execute(
    "select * from participantes where id_sorteio = ?",
        [id_sorteio]
    );
  
    if
      (participantes.length === 0){
        return res.status(404).json({ mensagem: "Nenhum participante encontrado para este sorteio."});
    }
  
    //embaralha os participantes
    const embaralhado = participantes.sort(() => Math.random() - 0.5);
  
    //atualiza a ordem de cada participante no banco de dados
    for (let i = 0; i < embaralhado.length; i++){
    await connection.execute(
    "update participantes set ordem = ? where id = ?",
        [i + 1, embaralhado[i].id]
        );
    }
  
    res.status(200).json({ mensagem: "Sorteio realizado com sucesso!"});
    } catch (error) {
    console.error("Erro ao realizar sorteio:", error);
    res.status(500).json({ mensagem: "Erro interno ao realizar sorteio."});
    }
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

//Rota para listar todos os participantes do MOBILE
app.get("/listar/participante_mobile", (req, res)=>{
    const sql = "select * from participante_mobile";
    con.query(sql, (error,result)=>{
        if (error) {
            return res.status(500).send({erro: "Participantes.não encontrados", detalhes: error});
        }
        res.status(200).send(result);
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
        const sql = "insert into participante_mobile(nome, email, senha) values (?, ?, ?)";
        con.query(sql, [nome, email, senhaCriptografada], (error, result) => {
            if (error) return res.status(500).send({ erro: "Erro ao cadastrar participante.", detalhes: error});
            res.status(201).send({ msg: "Participante cadastrado com sucesso!", id: result.insertId});
        });
    } catch (err){
        res.status(500).send({ erro: "Erro na criptografia da senha", detalhes: err});
    }
});

app.delete("/remover/participante_mobile/:id", (req, res)=>{
    const {id} = req.params;
    const sql = "delete from participante_mobile where id_participante_mobile = ?";
    con.query(sql, [id], (error, result)=>{
        if(error) return res.status(500).send({ erro: "Erro ao remover participante", detalhes: error});
        if(result.affectedRows === 0){
            return res.status(404).send({ msg: "Participante não encontrado"});
        }
        res.status(200).send({ msg: "Participante removido com sucesso!"});
    });
});

app.get("/listar/sorteio",(req, res)=>{
    const sql = `
    select s.id AS id_sorteio, s.nome_responsavel, s.status, s.data_criacao,
    e.nome AS empresa_nome, e.data_sorteio, e.periodo
    from sorteio s
    join empresa e ON s.id_empresa = e.id_empresa
    order by s.data_criacao DESC;
    `;

    con.query(sql,(error,result)=>{
        if (error) return res.status(500).send({ erro: "Erro ao listar sorteios", detalhes: error});
        res.status(200).send(result);
    });
});


app.post('/api/endpoint',(req, res)=>{
    const formData = req.body;
    //aqui faz a lógica para salvar os dados no banco de dados ou realizar o que for necessário
    res.status(200).send({ message: 'Dados recebidos com sucesso!'});
 });

//inicializar servidor
app.listen(3000,
    ()=>console.log("Servidor Online em http://127.0.0.1:3000"));


//criar uma nova condição para que o sistema gere um novo pdf ao clicar novamente no botao
//sortear. E também confirmar o novo sorteio. O antigo pdf deve ser deletado do banco de dados. 