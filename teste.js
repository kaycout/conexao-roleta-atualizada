//função para pegar os participantes e exibir na lista
function carregarParticipantes() {
    fetch("http://localhost:3000/participante")
      .then(response => response.json())
      .then(data => {
        const participantesList = document.getElementById('participantes-list');
        participantesList.innerHTML = ''; //limpa a lista antes de preencher
        data.participante.forEach(participante => {
          const listItem = document.createElement('li');
          listItem.textContent = `${participante.nome} - ${participante.equipe}`;
          participantesList.appendChild(listItem);
        });
      })
      .catch(error => {
        console.error("Erro ao buscar participantes:", error);
      });
  }
  
  //função para cadastrar um novo participante
  function cadastrarParticipante() {
    const novoParticipante = {
      nome: document.getElementById("nome").value,
      equipe: document.getElementById("equipe").value,
      supervisao: document.getElementById("supervisao").value,
      id_sorteio: document.getElementById("id_sorteio").value,
      via_qr: document.getElementById("via_qr").value,
    };
  
    fetch("http://localhost:3000/participante", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //define que o corpo da requisição será em JSON
      },
      body: JSON.stringify(novoParticipante), //envia os dados do participante como JSON
    })
      .then(response => response.json())
      .then(data => {
        alert("Participante cadastrado com sucesso!");
        carregarParticipantes(); //atualiza a lista de participantes
      })
      .catch(error => {
        console.error("Erro ao cadastrar participante:", error);
      });
  }
  
  //carregar os participantes quando a página for carregada
  window.onload = carregarParticipantes;
  