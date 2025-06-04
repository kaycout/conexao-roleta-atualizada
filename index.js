
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

//=>para o upload de arquivos.
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const QRCode = require('qrcode');

//verifica e cria a pasta uploads se não existir
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

//=>PDFKit — para gerar arquivos PDF.
const PDFDocument = require("pdfkit");


//para não gerar arquivos tão grandes 
const doc = new PDFDocument({ size: 'A4' });


//=>csv-parser — para ler arquivos CSV.
const csvParser = require("csv-parser");

//=>xlsx — para ler e manipular arquivos Excel (.xls, .xlsx).
const xlsx = require("xlsx");

const con = mysql.createConnection({
    host: "localhost",
    port: 3307,
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
app.get("/listar_participante", (req, res) => {
    const consultas = [
        new Promise((resolve, reject) => { //se trata de uma promessa, e ela verifica se está tudo certo  
            //no banco de dados, e, com o reject é retornado uma resposta.
            con.query("select * from participante", (error, result) => {
                if (error) reject({ participante: error });
                else resolve({ participante: result });
            });
        }),
        new Promise((resolve, reject) => {
            con.query("Select * from sorteio", (error, result) => {
                if (error) reject({ sorteio: error });
                else resolve({ sorteio: result });
            });
        }),
        new Promise((resolve, reject) => {
            con.query("Select * from empresa", (error, result) => {
                if (error) reject({ empresa: error });
                else resolve({ empresa: result });
            });
        })
    ];

    Promise.all(consultas)
        //o Promise.all recebe as promises (consultas ao banco)
        //e ele aguarda todas serem resolvidas com sucesso
        //e então retorna os resultados.
        //caso aconteça de qualquer uma das promises falhar, o .catch é acionado.
        .then(resultados => {
            const dadosCompletos = Object.assign({}, ...resultados);
            res.status(200).send(dadosCompletos); //entrega os dados com sucesso.
        })
        .catch(error => {
            res.status(500).send({ //se erro na consulta, retorna com (500) erro interno. 
                erro: "Erro ao buscar dados",
                detalhes: error
            });
        });
});

app.get("/participante/roleta/:id_sorteio", (req, res) => {
    const { id_sorteio } = req.params;

    //consulta o sorteio e a empresa
    const sqlSorteio = `
        SELECT s.id AS id_sorteio, s.nome_responsavel, s.email_responsavel, s.senha_responsavel, s.data_criacao, s.status, s.finalizado, e.nome AS nome_empresa
        FROM sorteio s
        JOIN empresa e ON s.id_empresa = e.id
        WHERE s.id = ?
    `;

    con.query(sqlSorteio, [id_sorteio], (errSorteio, resultadoSorteio) => {
        if (errSorteio) {
            return res.status(500).send({ erro: "Erro ao buscar sorteio, tente novamente.", detalhes: errSorteio });
        }

        if (resultadoSorteio.length === 0) {
            return res.status(404).send({ msg: "Sorteio não encontrado." });
        }

        // Consulta os participantes
        const sqlParticipantes = `
            SELECT id, nome, equipe, supervisao, via_qr
            FROM participante
            WHERE id_sorteio = ?
        `;

        con.query(sqlParticipantes, [id_sorteio], (errPart, resultadoPart) => {
            if (errPart) {
                return res.status(500).send({ erro: "Erro ao buscar participantes.", detalhes: errPart });
            }

            res.send({
                sorteio: resultadoSorteio[0],
                participantes: resultadoPart
            });
        });
    });
});

app.post("/participante", (req, res) => {
    let participantes = req.body;

    // Se for objeto único, transforma em array
    if (!Array.isArray(participantes)) {
        participantes = [participantes];
    }

    if (participantes.length === 0) {
        return res.status(400).send({ msg: "Requisição deve conter ao menos um participante." });
    }

    const valores = [];

    for (let i = 0; i < participantes.length; i++) {
        const { nome, equipe, supervisao, id_sorteio, via_qr } = participantes[i];

        if (!nome || !equipe || !supervisao || !id_sorteio) {
            return res.status(400).send({ msg: `Participante na posição ${i} está com dados obrigatórios faltando.` });
        }

        valores.push([
            nome,
            equipe,
            supervisao,
            id_sorteio,
            typeof via_qr === "undefined" ? false : via_qr
        ]);
    }

    const sql = "INSERT INTO participante (nome, equipe, supervisao, id_sorteio, via_qr) VALUES ?";
    con.query(sql, [valores], (error, result) => {
        if (error) {
            return res.status(500).send({ erro: "Erro ao cadastrar participantes", detalhes: error });
        }

        res.status(201).send({
            msg: participantes.length > 1
                ? "Participantes cadastrados com sucesso!"
                : "Participante cadastrado com sucesso!",
            inseridos: result.affectedRows
        });
    });
});

app.put("/participante/:id", (req, res) => {
    const id = req.params.id;
    let { nome, equipe, supervisao, via_qr, id_sorteio } = req.body;

    //define um valor padrão se via_qr não for enviado
    if (typeof via_qr === "undefined") {
        via_qr = false;
    }

    //verificação apenas dos campos obrigatórios
    if (!nome || !equipe || !supervisao || !id_sorteio) {
        return res.status(400).send({ msg: "Campos obrigatórios do participante não preenchidos!" });
        //(400) => erro de requisição do participante por dados incompletos.
    }

    //atualização dos dados já existentes no banco de dados.
    const updateQuery = `
        update participante 
        set nome = ?, equipe = ?, supervisao = ?, via_qr = ?, id_sorteio = ? 
        where id_participante = ?
    `;
    con.query(updateQuery, [nome, equipe, supervisao, via_qr, id_sorteio, id], (err, result) => {
        if (err) return res.status(500).send({ erro: "Erro ao atualizar participante", detalhes: err });
        //(500) => erro de servidor.

        if (result.affectedRows === 0) {
            return res.status(404).send({ msg: "Participante não encontrado" });
            //(404) => participante não encontrado.
        }

        res.status(200).send({ msg: "Participante atualizado com sucesso!" });
        //(200) =>participante atualizado com sucesso.
    });
});

app.delete("/participante/:id", (req, res) => {
    const { id } = req.params;
    const sql = "delete from participante where id_participante = ?";

    con.query(sql, [id], (error, result) => {
        if (error) return res.status(500).send({ erro: "Erro ao apagar participante", detalhes: error });
        //(500) => participante não apagado.

        res.status(200).send({ msg: "Participante apagado com sucesso", id });
        //(200) =>participante apagado com sucesso.
    });
});

//ROTAS DA EMPRESA
app.get('/empresa/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const sql = "SELECT * FROM empresa WHERE id_empresa = ?";

    con.query(sql, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ erro: "Erro ao buscar empresa", detalhes: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }

        res.json(results[0]);
    });
});


app.post("/cadastrar/empresa", (req, res) => {
    const { nome, empreendimento, data_sorteio, periodo } = req.body;

    if (!nome || !empreendimento || !data_sorteio || !periodo) {
        return res.status(400).send({ erro: "Campos obrigatórios não preenchidos" });
    }

    const empresa = { nome, empreendimento, data_sorteio, periodo };

    con.query("INSERT INTO empresa SET ?", empresa, (error, result) => {
        if (error) {
            console.error("Erro ao cadastrar empresa:", error);
            return res.status(500).send({ erro: `Erro ao cadastrar empresa: ${error.sqlMessage}` });
        }
        res.status(201).send({ msg: "Empresa cadastrada", payload: result });
    });
});


app.put("/empresa/:id", (req, res) => {
    const id = req.params.id;
    const { nome, empreendimento, data_sorteio, periodo } = req.body;

    //verifica se os campos obrigatórios estão preenchidos
    if (!nome || !empreendimento || !data_sorteio || !periodo) {
        return res.status(400).send({ msg: "Campos obrigatórios da empresa não preenchidos!" });
    }

    //atualiza os dados da empresa com base no id_empresa
    const sql = `
        update empresa 
        set nome = ?, empreendimento = ?, data_sorteio = ?, periodo = ?
        id_empresa = ?
    `;

    con.query(sql, [nome, empreendimento, data_sorteio, periodo, id], (err, result) => {
        if (err) return res.status(500).send({ erro: "Erro ao atualizar empresa", detalhes: err });

        if (result.affectedRows === 0) {
            return res.status(404).send({ msg: "Empresa não encontrada" });
            //se empresa não encontrada, retorna com erro de usuário => 404.
        }
        res.status(200).send({ msg: "Empresa atualizada com sucesso!" });
        //se uma empresa que já existe no banco de dados for atualizada com sucesso, 
        //retorna com (200) => empresa atualizada no banco de dados com sucesso.
        //req.params.id => mostra o id da empresa que foi atualizada. 
    });
});

app.delete("/empresa/:id", (req, res) => {
    const { id } = req.params;
    const sql = "delete from empresa where id_empresa = ?";

    con.query(sql, [id], (error, result) => {
        if (error) return res.status(500).send({ erro: "Erro ao tentar apagar empresa", detalhes: error });
        //(500) => empresa não apagado.

        res.status(200).send({ msg: "Sucesso ao apagar empresa", id });
        //(200) =>empresa apagada com sucesso.
    });
});

//ROTAS DO SORTEIO
app.post("/cadastrar/sorteio", (req, res) => {
  console.log("Dados recebidos:", req.body);

  const { empresa, empreendimento, data, periodo } = req.body;

  if (!empresa || !empreendimento || !data || !periodo) {
  return res.status(400).send("Faltando algum campo obrigatório");
}
  const sql = 'INSERT INTO sorteio (empresa, empreendimento, data, periodo) VALUES (?, ?, ?, ?)';
  const valores = [empresa, empreendimento, data, periodo];

  con.query(sql, valores, (err, result) => {
    if (err) {
      console.error('Erro ao inserir sorteio:', err);
      return res.status(500).json({ erro: 'Erro ao criar sorteio', detalhe: err.sqlMessage || err.message });
    }

    const idSorteio = result.insertId;
    res.status(201).json({ id: idSorteio, msg: "Sorteio criado com sucesso!" });
  });
});

// Rota para atualizar um sorteio existente no banco de dados
app.put("/sorteio/:id", (req, res) => {
    //pega o ID do sorteio pela URL
    const id = req.params.id;

    //desestrutura os campos do corpo da requisição
    const { nome_responsavel, email_responsavel, senha_responsavel, data_criacao, status } = req.body;

    // verificação básica dos campos obrigatórios
    if (!nome_responsavel || !email_responsavel || !senha_responsavel || !data_criacao || !status) {
        return res.status(400).send({ msg: "Campos obrigatórios do sorteio não preenchidos!" });
    }

    //query SQL para atualizar o sorteio no banco
    const sql = `
        update sorteio
        set nome_responsavel = ?, email_responsavel = ?, senha_responsavel = ?, data_criacao = ?, status = ?
        where id = ?
    `;

    //executa a query no banco de dados
    con.query(sql, [nome_responsavel, email_responsavel, senha_responsavel, data_criacao, status, id], (err, result) => {
        if (err) {
            //erro interno do servidor ao tentar atualizar
            return res.status(500).send({ erro: "Erro ao atualizar sorteio, tente novamente", detalhes: err });
        }

        if (result.affectedRows === 0) {
            // sorteio não encontrado para atualizar
            return res.status(404).send({ msg: "Sorteio não encontrado" });
            //se sorteio não encontrado, ele responde com erro => (404).
        }

        //sucesso na atualização
        res.status(200).send({ msg: "Sorteio atualizado com sucesso!" });
    });
});

app.delete("/sorteio/:id", (req, res) => {
    const { id } = req.params;
    const sql = "delete from sorteio where id = ?";

    con.query(sql, [id], (error, result) => {
        if (error) return res.status(500).send({ erro: "Erro ao tentar apagar sorteio", detalhes: error });
        //(500) => empresa não apagado.

        res.status(200).send({ msg: "Sucesso ao apagar sorteio!", id });
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
    destination: function (req, file, cb) {
        cb(null, "uploads/"); //Certifica de que a pasta uploads/ existe
    },
    filename: function (req, file, cb) {
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

//Rota para MOBILE realizar o sorteio e gerar o PDF
app.get('/realizar_sorteio/:id', (req, res) => {
  const id = req.params.id;
  // Simulação de retorno
  const resultado = [
    { nome: "Participante", ordem: 1 },
    { nome: "Outro", ordem: 2 }
  ];
  res.json({ resultado });
});

//criar uma nova condição para que o sistema gere um novo pdf ao clicar novamente no botao
//sortear. E também confirmar o novo sorteio. O antigo pdf deve ser deletado do banco de dados.

//Função para simular o sorteio e gerar o PDF
function realizarSorteio(id_sorteio, res) {
    const sorteioResultados = [
        { equipe: "Equipe Marcos", sorteio: Math.random() },
        { equipe: "Equipe Kay", sorteio: Math.random() },
        { equipe: "Equipe Lais", sorteio: Math.random() }
    ];

    gerarPdfDoSorteio(sorteioResultados, res, id_sorteio);

    // Depois de finalizar o sorteio, envia o status para o front
    res.json({ finalizado: true, resultados: sorteioResultados });
}

//função para gerar o PDF com o resultado do sorteio
function gerarPdfDoSorteio(sorteioResultados, res, id_sorteio) {
    const nomeArquivo = `resultados_sorteio_${id_sorteio}.pdf`;
    const pdfPath = path.join(__dirname, "uploads", nomeArquivo);

    // Deleta o PDF antigo, se existir
    fs.unlink(pdfPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).send({ erro: "Erro ao deletar PDF antigo", detalhes: err });
        }

        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // Título centralizado
        doc.fontSize(20).font('Helvetica-Bold').text("Resultado do Sorteio", { align: "center" });
        doc.moveDown();

        sorteioResultados.forEach((resultado, index) => {
            const { nome, posicao, empresa, data_sorteio, id_sorteio } = resultado;

            doc
                .fontSize(14).fillColor('#333').font('Helvetica-Bold')
                .text(`Participante ${index + 1}`, { underline: true })
                .moveDown(0.5);

            doc
                .fontSize(12).font('Helvetica-Bold').fillColor('#000')
                .text(`Nome do Participante: ${nome}`)
                .text(`ID do Sorteio: ${id_sorteio}`)
                .text(`Posição Sorteada: ${posicao}`)
                .text(`Empresa: ${empresa}`)
                .text(`Data do Sorteio: ${data_sorteio}`)
                .moveDown(1);

            doc
                .fontSize(11).font('Helvetica-Oblique').fillColor('#555')
                .text("Obrigado por participar!", { align: 'left' })
                .moveDown(2);
        });

        doc.end();

        writeStream.on('finish', () => {
            if (!res.headersSent) {
                res.status(200).json({ mensagem: 'PDF gerado com sucesso' });
            }
        });

        writeStream.on('error', (err) => {
            if (!res.headersSent) {
                res.status(500).send({ erro: "Erro ao gerar PDF", detalhes: err });
            }
        });
    });
}

app.get("/listar/sorteio", (req, res) => {
    const sql = `
    select s.id AS id_sorteio, s.nome_responsavel, s.status, s.data_criacao,
    e.nome AS empresa_nome, e.data_sorteio, e.periodo
    from sorteio s
    join empresa e ON s.id_empresa = e.id_empresa
    order by s.data_criacao DESC;
    `;

    con.query(sql, (error, result) => {
        if (error) return res.status(500).send({ erro: "Erro ao listar sorteios", detalhes: error });
        res.status(200).send(result);
    });
});

//rota de upload do arquivo PDF gerado
app.post("/upload/arquivo/:id", upload.single("arquivo"), (req, res) => {
    const id_sorteio = req.params.id_sorteio;
    const nome_arquivo = req.file?.filename;

    if (!nome_arquivo) {
        return res.status(400).send({ erro: "Arquivo não enviado." });
    }

    const arquivoCaminho = path.join(__dirname, "uploads", nome_arquivo);

    //aqui é realizado o processo de salvar o arquivo no banco ou outros passos necessários
    const sql = "insert into arquivos(id_sorteio, nome_arquivo) values (?, ?)";
    con.query(sql, [id_sorteio, nome_arquivo], (error, result) => {
        if (error) return res.status(500).send({ erro: "Erro ao salvar o arquivo.", detalhes: error });
        res.status(201).send({ msg: "Arquivo enviado com sucesso!", arquivo: nome_arquivo });
    });
});

//Rota para listar todos os participantes do MOBILE
app.get("/listar_participante_mobile", (req, res) => {
    const sql = "select * from participante_mobile";
    con.query(sql, (error, result) => {
        if (error) {
            return res.status(500).send({ erro: "Participantes não encontrados", detalhes: error });
        }
        res.status(200).send(result);
    });
});

//Rota para cadastrar usuário no MOBILE

app.post("/cadastrar_participante_mobile", async (req, res) => {
    const { nome, equipe, supervisao } = req.body;

    // Verificação dos campos obrigatórios
    if (!nome || !equipe || !supervisao) {
        return res.status(400).send({ msg: "Campos obrigatórios não preenchidos." });
    }

    try {
        const sql = "INSERT INTO participante_mobile (nome, equipe, supervisao) VALUES (?, ?, ?)";
        con.query(sql, [nome, equipe, supervisao], (error, result) => {
            if (error) {
                return res.status(500).send({
                    erro: "Erro ao cadastrar participante.",
                    detalhes: error.sqlMessage || error
                });
            }

            res.status(201).send({
                msg: "Participante cadastrado com sucesso!",
                id: result.insertId
            });
        });
    } catch (err) {
        res.status(500).send({
            erro: "Erro no cadastro.",
            detalhes: err.message || err
        });
    }
});


app.delete("/remover/participante_mobile/:id", (req, res) => {
    const { id } = req.params;
    const sql = "delete from participante_mobile where id_participante_mobile = ?";
    con.query(sql, [id], (error, result) => {
        if (error) return res.status(500).send({ erro: "Erro ao remover participante", detalhes: error });
        if (result.affectedRows === 0) {
            return res.status(404).send({ msg: "Participante não encontrado" });
        }
        res.status(200).send({ msg: "Participante removido com sucesso!" });
    });
});

// Rota para cadastrar QR Code
app.post("/cadastrar/Qrcode", async (req, res) => {
  const { codigo, descricao } = req.body;

  if (!codigo) {
    return res.status(400).json({ message: 'O campo "codigo" é obrigatório.' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO qrcodes (codigo, descricao) VALUES (?, ?)',
      [codigo, descricao || null]
    );

    res.status(201).json({ message: 'QR Code cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('Erro ao cadastrar QR Code:', error);
    res.status(500).json({ message: 'Erro interno ao cadastrar QR Code.' });
  }
});

app.use("/mobile.03.atualizado/html", express.static(path.join(__dirname, "mobile.03.atualizado/html")));

//inicializar servidor

const PORT = 3000;
const IP = '192.168.15.7';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://${IP}:${PORT}`);
});

