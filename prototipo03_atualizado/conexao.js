function atualizada(id, nome, equipe, supervisao, id_sorteio, via_qr) {
    if (confirm("Você deseja inserir este participante?")) {
        const form = document.getElementById("form");
        form.style.display = "block";

        document.getElementById("txtnome").value = nome;
        document.getElementById("txtequipe").value = equipe;
        document.getElementById("txtsupervisao").value = supervisao;
        document.getElementById("txtid_sorteio").value = id_sorteio;
        document.getElementById("txtvia_qr").value = via_qr;

        document.getElementById("txtsenha").style.display = "none";
        document.getElementById("btn-cadastrar").style.display = "none";

        //evita criar botão duplicado
        if (!document.getElementById("btn-sortear")) {
            const btn_sortear = document.createElement("button");
            btn_sortear.innerHTML = "Sortear";
            btn_sortear.setAttribute("id", "btn-sortear");

            //passando todas as informações para a função executar_sortear
            btn_sortear.setAttribute("onclick", `executar_sortear(${id}, '${nome}', '${equipe}', '${supervisao}', '${id_sorteio}', '${via_qr}')`);
            form.appendChild(btn_sortear);
        }
    }
}

function executar_sortear(id, nome, equipe, supervisao, id_sorteio, via_qr) {
    alert(
        `id: ${id}\nNome: ${nome}\nEquipe: ${equipe}\nSupervisão: ${supervisao}\nID Sorteio: ${id_sorteio}\nVia QR: ${via_qr}`
    );

    //adicionando a lógica real do sorteio
}

let idSorteio=0

function participante() {
    const form_nome = document.getElementById("txtnome");
    const form_equipe = document.getElementById("txtequipe");
    const form_supervisao = document.getElementById("txtsupervisao");
    const form_id_sorteio = document.getElementById("txtid_sorteio");
    const form_via_qr = document.getElementById("txtvia_qr");

    // //validação
    // if (!form_nome.value || !form_equipe.value || !form_supervisao.value) {
    //     alert("Preencha todos os campos!");
    //     return;
    // }

    fetch("http://localhost:3000/participante", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json"
        },
        body: JSON.stringify({
            // nome: form_nome.value,
            // equipe: form_equipe.value,
            // supervisao: form_supervisao.value,
            // id_sorteio: form_id_sorteio.value,
            participantes: listaParticipantes,
            via_qr: form_via_qr.value,

        })
    })
        .then(res => {
            //verificação de resposta
            if (!res.ok) {
                throw new Error(`Erro HTTP: ${res.status}`);
            }
             res.json();
        })
        .then(dados => {
            alert(dados.msg);
            idSorteio=dados.payload.insertId;
            carregar(); //atualiza lista
        })
        .catch(error => {
            //mensagem de erro
            console.error("Erro ao cadastrar participante:", error);
            alert("Erro ao cadastrar participante. Verifique se o backend está rodando e se a rota /participante existe.");
        });
}

//chama carregar() ao abrir a página
window.onload = carregar;

function carregar() {
    const container = document.getElementById("listaOriginal");

    fetch("http://127.0.0.1:3000/participante")  //mantendo a rota /participante
        .then(res => {
            if (!res.ok) {
                throw new Error(`Erro HTTP: ${res.status}`);
            }
            return res.json();
        })
        .then(dados => {
            if (!dados.msg || dados.msg.length === 0) {
                container.innerHTML = "<p>Nenhum participante encontrado.</p>";
                return;
            }

            let saida = "";
            dados.msg.forEach(part =>{
                saida += `
                <tr class="participante">
                    <td>${part.id}</td>
                    <td>${part.nome}</td>
                    <td>${part.equipe}</td>
                    <td>${part.supervisao}</td>
                    <td><button onclick="excluir(${part.id})">Apagar</button></td>
                </tr>`;
            });
            container.innerHTML = saida;  //preenche a tabela com os participantes
        })
        .catch(err => {
            console.error("Erro ao carregar participantes:", err);
            alert("Erro ao carregar participantes. Verifique se o backend está rodando e se a rota /participante está configurada.");
        });
}

function criarRoleta() {
    // Pegando os valores dos campos do formulário
    const form_nome_responsavel = document.getElementById("nome_responsavel");
    const form_email_responsavel = document.getElementById("email_responsavel");
    const form_senha_responsavel = document.getElementById("senha_responsavel");
    const form_data_criacao = document.getElementById("data_criacao");
    const form_status = document.getElementById("status");
    const form_finalizado = document.getElementById("finalizado");
    const form_empresa = document.getElementById("empresa");
    const form_empreendimento = document.getElementById("empreendimento");
    const form_data_sorteio = document.getElementById("data_sorteio");
    const form_periodo = document.getElementById("periodo");

    // Enviando os dados para o backend via POST
    fetch("http://localhost:3000/cadastrar/sorteio", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json"
        },
        body: JSON.stringify({
            nome_responsavel: form_nome_responsavel.value,
            email_responsavel: form_email_responsavel.value,
            senha_responsavel: form_senha_responsavel.value,
            data_criacao: form_data_criacao.value,
            status: form_status.value,
            finalizado: form_finalizado.value,
            empresa: form_empresa.value,
            empreendimento: form_empreendimento.value,
            data_sorteio: form_data_sorteio.value,
            periodo: form_periodo.value
            // participantes: listaParticipantes,
            // via_qr: form_via_qr.value
        })
    })
    .then(res => {
        //verifica a resposta
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        res.json(); //converte a resposta para JSON
    })
    .then(dados => {
        //exibe a mensagem retornada pelo backend
        alert(dados.msg);

        //salva o id do sorteio criado
        const idSorteio = dados.payload.insertId;

        //atualiza a interface ou carrega outros dados
        carregar(); //função que recarrega a lista de sorteios, por exemplo

        //gerar um QR code pegandp o id do sorteio:
        // Exemplo:
        // gerarQRCode(`http://localhost:3000/sorteio/${idSorteio}`);
    })
    .catch(error=>{
        console.error("Erro ao cadastrar sorteio:", error);
        alert("Erro ao cadastrar sorteio. Verifique se o backend está rodando e se a rota /cadastrar/sorteio existe.");
    });
}

function excluir(id) {
    if (confirm("Você deseja apagar este participante?")) {
        fetch(`http://127.0.0.1:3000/participante/${id}`, {
            method: "DELETE",
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(dados => {
                // Exibindo o nome do participante excluído, caso ele venha no JSON de resposta
                alert(`Participante com ID ${id} apagado com sucesso!`);
                carregar(); // Atualiza a lista de participantes sem recarregar a página
            })
            .catch(erro => {
                console.error("Erro ao apagar:", erro);
                alert("Erro ao apagar participante. Verifique o backend.");
            });
    }
}