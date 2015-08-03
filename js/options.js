var str_contatos_bloqueados = 'contatos_bloqueados';

function remover_contato(event){
  var storage = chrome.storage.local;
  storage.get(str_contatos_bloqueados, function(r){
    var contatos = r[str_contatos_bloqueados];
    var id_contato = event.target.getAttribute("data-idcontato");
    console.log("remover contato: " + contatos[id_contato]["nome"]);
    delete contatos[id_contato];
    console.log(contatos);
    obj = {};
    obj[str_contatos_bloqueados] = contatos;
    storage.set(obj);
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
  });
  
}

function save_options() {
  // var div_contatos = document.getElementById('contatos').value;
  // var likesColor = document.getElementById('like').checked;
  // chrome.storage.local.set({
  //   favoriteColor: color,
  //   likesColor: likesColor
  // }, function() {
  //   // Update status to let user know options were saved.
  //   var status = document.getElementById('status');
  //   status.textContent = 'Opçoes salvas com sucesso.';
  //   setTimeout(function() {
  //     status.textContent = '';
  //   }, 750);
  // });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(str_contatos_bloqueados, function(r){
        var contatos = r[str_contatos_bloqueados];
        var lista = document.getElementById("lista_contatos");
        for(id in contatos){
          console.log(id);
          if(contatos[id]["img"] === 'undefined'){
            var img = "";
          }
          else{
            var img = contatos[id]["img"];
          }
          var li_contato = document.createElement("LI");
          var li_contato_img = document.createElement("IMG");
          var li_contato_span_texto = document.createElement("SPAN");
          var li_contato_text = document.createTextNode(contatos[id]["nome"]);
          var li_contato_botao_rm = document.createElement("BUTTON");
          var li_contato_botao_rm_text = document.createTextNode("Mostrar contato");
          var li_contato_check_bloquear = document.createElement("INPUT");

          li_contato_check_bloquear.setAttribute("type", 'checkbox');
          li_contato_check_bloquear.setAttribute("name", 'checkbox_bloquear_perfil_' + id);
          li_contato_check_bloquear.setAttribute("data-on-text", "Perfil Bloqueado");
          li_contato_check_bloquear.setAttribute("data-label-text", "Bloquear Perfil");
          li_contato_check_bloquear.setAttribute("data-id", id);
          if(contatos[id]["bloquear_perfil"]){
            li_contato_check_bloquear.setAttribute("checked", contatos[id]["bloquear_perfil"]);
          }

          li_contato_botao_rm.addEventListener('click', remover_contato);
          li_contato_botao_rm.setAttribute("data-idcontato", id);
          li_contato_botao_rm.setAttribute("class", "btn btn-danger botao_mostrar_contato");

          li_contato.setAttribute("id", id);
          li_contato.setAttribute("class", "list-group-item");

          li_contato_img.setAttribute("width", "36px");
          li_contato_img.setAttribute("height", "36px");
          li_contato_img.setAttribute("src", img);
          li_contato_img.setAttribute("class", "pull-left");

          li_contato_span_texto.setAttribute("class", "texto col-md-2");

          li_contato_check_bloquear.setAttribute("class", "bootstrap-switch-handle-on bootstrap-switch-primary");

          li_contato.appendChild(li_contato_img);
          li_contato.appendChild(li_contato_span_texto);
          li_contato_span_texto.appendChild(li_contato_text);
          li_contato_botao_rm.appendChild(li_contato_botao_rm_text);
          li_contato.appendChild(li_contato_check_bloquear);
          li_contato.appendChild(li_contato_botao_rm);
          lista.appendChild(li_contato);

          $("[name='checkbox_bloquear_perfil_" + id + "']").bootstrapSwitch();
          $('input[name="checkbox_bloquear_perfil_' + id + '"]').on('switchChange.bootstrapSwitch', function(event, state) {
            var storage = chrome.storage.local;
            storage.get(str_contatos_bloqueados, function(r){
              var contatos = r[str_contatos_bloqueados];
              console.log(state);
              var id = event.target.getAttribute("data-id");
              contatos[id]["bloquear_perfil"] = state;
              obj = {};
              obj[str_contatos_bloqueados] = contatos;
              storage.set(obj);
            });
          });
        }
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
//document.getElementById('save').addEventListener('click', save_options);