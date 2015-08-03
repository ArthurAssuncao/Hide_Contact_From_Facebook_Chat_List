function goBack() {
    window.history.back();
}

var botao = document.getElementById("botao_voltar");
botao.addEventListener("click", goBack, false);