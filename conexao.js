
// Elementos
const container = document.getElementById("container");
const cad = document.getElementById("cadastro");
cad.onclick = () => {
  document.getElementById("form").style.display = "block";
};

//participantes
function carregarParticipantes() {
  fetch("http://127.0.0.1:3000/listar_participante")
    .then(res => res.json())
    .then(dados => {
      let saida = "";
      dados.msg.map(list_part=> {
        saida += `
          <div class="participante">
            <p>Id: ${list_part.id}</p>
            <h2>Nome: ${list_part.nome}</h2>
            <h3>Equipe: ${list_part.equipe}</h3>
            <h4>Supervisão: ${list_part.supervisao}</h4>
            <h5>Id_sorteio: ${list_part.id_sorteio}</h5>
            <h6>Via_qr: ${list_part.via_qr}</h6>
          </div>`;
      });
      container.innerHTML = saida;
    });
}

function cadastrarParticipante() {
  const nome = document.getElementById("txtnome").value;
  const equipe = document.getElementById("txtequipe").value;
  const supervisao = document.getElementById("txtsupervisao").value;
  const id_sorteio = document.getElementById("txtid_sorteio").value;
  const via_qr = document.getElementById("txtvia_qr").value;

  fetch("http://127.0.0.1:3000/participante", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, equipe, supervisao, id_sorteio, via_qr })
  })
    .then(res => res.json())
    .then(dados => {
      alert(dados.msg);
      document.location.reload();
    })
    .catch(error => console.log(`Erro ao executar a API: ${error}`));
}

// participantes mobile
function carregarParticipantesMobile() {
  fetch("http://127.0.0.1:3000/listarparticipante_mobile")
    .then(res => res.json())
    .then(dados => {
      let saida = "";
      dados.msg.map(part => {
        saida += `
          <div class="participante_mobile">
            <p>Id: ${part.id}</p>
            <h2>Nome: ${part.nome}</h2>
            <h3>Email: ${part.email}</h3>
            <h4>Senha: ${part.senha}</h4>
          </div>`;
      });
      container.innerHTML = saida;
    });
}

function cadastrarParticipanteMobile() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !senha) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  fetch("http://127.0.0.1:3000/cadastrar_participante_mobile", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, email, senha })
  })
    .then(res => res.json())
    .then(dados => {
      alert(dados.msg);
      document.location.reload();
    })
    .catch(error => console.log(`Erro ao executar a API: ${error}`));
}

// ===== EMPRESAS =====
function carregarEmpresas() {
  fetch("http://127.0.0.1:3000/listar_empresa")
    .then(res => res.json())
    .then(dados => {
      let saida = "";
      dados.msg.map(empr => {
        saida += `
          <div class="empresa">
            <p>Id: ${empr.id}</p>
            <h2>Nome: ${empr.nome}</h2>
            <h3>Empreendimento: ${empr.empreendimento}</h3>
            <h4>Data do sorteio: ${empr.data_sorteio}</h4>
            <h5>Período: ${empr.periodo}</h5>
          </div>`;
      });
      container.innerHTML = saida;
    });
}

function cadastrarEmpresa() {
  const nome = document.getElementById("nome").value;
  const empreendimento = document.getElementById("empreendimento").value;
  const data_sorteio = document.getElementById("data_sorteio").value;
  const periodo = document.getElementById("periodo").value;

  if (!nome || !empreendimento || !data_sorteio || !periodo) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  fetch("http://127.0.0.1:3000/cadastrar/empresa", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, empreendimento, data_sorteio, periodo })
  })
    .then(res => res.json())
    .then(dados => {
      alert(dados.msg);
      document.location.reload();
    })
    .catch(error => console.log(`Erro ao executar a API: ${error}`));
}

// sorteios
function carregarSorteios() {
  fetch("http://127.0.0.1:3000/listar_sorteio")
    .then(res => res.json())
    .then(dados => {
      let saida = "";
      dados.msg.map(sort => {
        saida += `
          <div class="sorteio">
            <p>Id: ${sort.id}</p>
            <h2>Nome do responsável: ${sort.nome_responsavel}</h2>
            <h3>Email: ${sort.email_responsavel}</h3>
            <h4>Senha: ${sort.senha_responsavel}</h4>
            <h5>Data do sorteio: ${sort.data_criacao}</h5>
            <h5>Status: ${sort.status}</h5>
            <h5>Finalizado: ${sort.finalizado}</h5>
          </div>`;
      });
      container.innerHTML = saida;
    });
}

function realizarSorteio() {
  const nome_responsavel = document.getElementById("nome").value;
  const email_responsavel = document.getElementById("email_responsavel").value;
  const senha_responsavel = document.getElementById("senha_responsavel").value;
  const data_criacao = document.getElementById("data_criacao").value;
  const status = document.getElementById("status").value;
  const finalizado = document.getElementById("finalizado").value;

  if (!nome_responsavel || !email_responsavel || !senha_responsavel || !data_criacao || !status || !finalizado) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  fetch("http://127.0.0.1:3000/realizar_sorteio", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome_responsavel,
      email_responsavel,
      senha_responsavel,
      data_criacao,
      status,
      finalizado
    })
  })
    .then(res => res.json())
    .then(dados => {
      alert(dados.msg);
      document.location.reload();
    })
    .catch(error => console.log(`Erro ao executar a API: ${error}`));
}
function criarRoleta() {
  const empresa = document.getElementById("empresa").value;
  const empreendimento = document.getElementById("empreendimento").value;
  const data = document.getElementById("data").value;
  const periodo = document.getElementById("periodo").value;

  console.log({ empresa, empreendimento, data, periodo });

  fetch("http://localhost:3000/cadastrar/sorteio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ empresa, empreendimento, data, periodo })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Resposta do servidor:", data);
  })
  .catch(err => {
    console.error("Erro ao criar sorteio:", err);
  });
}


