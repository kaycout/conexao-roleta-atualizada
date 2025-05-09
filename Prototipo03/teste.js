// function atualizada(id, nome, equipe, supervisao, id_sorteio, via_qr) {
//     if (confirm("Você deseja inserir este participante?")) {
//         document.getElementById("form").style.display = "block";

//         document.getElementById("txtnome").value = nome;
//         document.getElementById("txtequipe").value = equipe;
//         document.getElementById("txtsupervisao").value = supervisao;
//         document.getElementById("txtid_sorteio").value = id_sorteio;
//         document.getElementById("txtvia_qr").value = via_qr;

//         document.getElementById("txtsenha").style.display = "none";
//         document.getElementById("btn-cadastrar").style.display = "none";

//         const btn_sortear = document.createElement("button");
//         btn_sortear.innerHTML = "Sortear";
//         btn_sortear.setAttribute("id", "btn-sortear");
//         btn_sortear.setAttribute("onclick", `executar_sortear(${id})`);
//         document.getElementById("form").appendChild(btn_sortear);
//     }
// }

// function executar_sortear(id) {
//     alert(id);
// }

// function excluir(id) {
//     if (confirm("Você deseja apagar este participante?")) {
//         fetch(`http://127.0.0.1:3000/apagar/${id}`, {
//             method: "DELETE",
//             headers: {
//                 "accept": "application/json",
//                 "content-type": "application/json"
//             }
//         })
//         .then(response => response.json())
//         .then(dados => {
//             alert("Participante apagado!");
//             document.location.reload();
//         })
//         .catch(erro => console.error(erro));
//     }
// }

// function carregar() {
//     const container = document.getElementById("container");

//     fetch("http://127.0.0.1:3000/listar")
//         .then(res => res.json())
//         .then(dados => {
//             let saida = "";
//             dados.msg.map(part => {
//                 saida += `
//                 <div class="participante">
//                     <p>Id: ${part.id}</p>
//                     <h2>Nome: ${part.nome}</h2>
//                     <h3>Equipe: ${part.equipe}</h3>
//                     <h4>Supervisão: ${part.supervisao}</h4>
//                     <h5>ID Sorteio: ${part.id_sorteio}</h5>
//                     <h6>Via QR: ${part.via_qr}</h6>
//                     <button onclick="atualizada(${part.id}, '${part.nome}', '${part.equipe}', '${part.supervisao}', '${part.id_sorteio}', '${part.via_qr}')" id="atualizada" style="display: none;">Atualizar</button>
//                     <button onclick="excluir(${part.id})" id="excluir" style="display: none;">Apagar</button>
//                 </div>`;
//             });
//             container.innerHTML = saida;
//         });
// }

// function participante() {

//     const listaparticipantes=[]
//     listaparticipantes.push("Edilson")
//     listaparticipantes.push("Kay")

//     const form_nome = document.getElementById("txtnome");
//     const form_equipe = document.getElementById("txtequipe");
//     const form_supervisao = document.getElementById("txtsupervisao");
//     const form_id_sorteio = document.getElementById("txtid_sorteio");
//     const form_via_qr = document.getElementById("txtvia_qr");

//     document.body.node

//     fetch("http://127.0.0.1:3000/participante", {
//         method: "POST",
//         headers: {
//             "accept": "application/json",
//             "content-type": "application/json"
//         },
//         body: JSON.stringify({
//             nome: listaparticipantes
//             // equipe: form_equipe.value,
//             // supervisao: form_supervisao.value,
//             // id_sorteio: form_id_sorteio.value,
//             // via_qr: form_via_qr.value
//         })
//     })
//     .then(res => res.json())
//     .then(dados => {
//         alert(dados.msg);
//         document.location.reload();
//     })
//     .catch(error => console.log(`Erro ao executar a API: ${error}`));
// }

// const cad = document.getElementById("cadastro");
// cad.onclick = () => {
//     document.getElementById("form").style.display = "block";
// };

// const btnlogin = document.getElementById("login");
// btnlogin.onclick = () => {
//     document.getElementsByClassName("sombra")[0].style.top = "0px";
// };


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

        // Evitar criar botão duplicado
        if (!document.getElementById("btn-sortear")) {
            const btn_sortear = document.createElement("button");
            btn_sortear.innerHTML = "Sortear";
            btn_sortear.setAttribute("id", "btn-sortear");
            btn_sortear.setAttribute("onclick", `executar_sortear(${id})`);
            form.appendChild(btn_sortear);
        }
    }
}

function executar_sortear(id) {
    alert(id);
}

function excluir(id) {
    if (confirm("Você deseja apagar este participante?")) {
        fetch(`http://127.0.0.1:3000/apagar/${id}`, {
            method: "DELETE",
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            }
        })
        .then(response => response.json())
        .then(dados => {
            alert("Participante apagado!");
            carregar(); //atualiza participante apagado sem precisar atualizar a página inteira
        })
        .catch(erro => console.error(erro));
    }
}

function carregar() {
    const container = document.getElementById("container");

    fetch("http://127.0.0.1:3000/listar")
        .then(res => res.json())
        .then(dados => {
            let saida = "";
            dados.msg.map(part => {
                saida += `
                <div class="participante">
                    <p>Id: ${part.id}</p>
                    <h2>Nome: ${part.nome}</h2>
                    <h3>Equipe: ${part.equipe}</h3>
                    <h4>Supervisão: ${part.supervisao}</h4>
                    <h5>ID Sorteio: ${part.id_sorteio}</h5>
                    <h6>Via QR: ${part.via_qr}</h6>
                    <button onclick="atualizada(${part.id}, '${part.nome}', '${part.equipe}', '${part.supervisao}', '${part.id_sorteio}', '${part.via_qr}')" id="atualizada">Atualizar</button>
                    <button onclick="excluir(${part.id})" id="excluir">Apagar</button>
                </div>`;
            });
            container.innerHTML = saida;
        });
}

function participante() {

    const listaparticipantes=[]
    listaparticipantes.push("Edilson")
    listaparticipantes.push("Kay")

    const form_nome = document.getElementById("txtnome");
    const form_equipe = document.getElementById("txtequipe");
    const form_supervisao = document.getElementById("txtsupervisao");
    const form_id_sorteio = document.getElementById("txtid_sorteio");
    const form_via_qr = document.getElementById("txtvia_qr");

    // verifica a validação
    if (!form_nome.value || !form_equipe.value || !form_supervisao.value) {
        alert("Preencha todos os campos!");
        return;
    }

    fetch("http://127.0.0.1:3000/participante", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json"
        },
        body: JSON.stringify({
            nome: listarparticipantes,
            // equipe: form_equipe.value,
            // supervisao: form_supervisao.value,
            // id_sorteio: form_id_sorteio.value,
            // via_qr: form_via_qr.value
        })
    })
    .then(res => res.json())
    .then(dados => {
        alert(dados.msg);
        carregar(); // Atualiza lista sem precisar carregar a  página
    })
    .catch(error => console.log(`Erro ao executar a API: ${error}`));
}

const cad = document.getElementById("cadastro");
cad.onclick = () => {
    document.getElementById("form").style.display = "block";
};

const btnlogin = document.getElementById("login");
btnlogin.onclick = () => {
    document.getElementsByClassName("sombra")[0].style.top = "0px";
};

// Chama carregar() ao abrir a página
window.onload = carregar;
