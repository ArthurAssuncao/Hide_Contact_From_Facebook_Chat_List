// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//http://stackoverflow.com/questions/265984/how-to-redefine-css-classes-with-javascript

console.log("Extensao Hide Contact From Facebook Chat List");

var seletor_painel_chat_inicio = "li[data-id='";
var seletor_painel_chat_fim = "']"
var str_contatos_bloqueados = 'contatos_bloqueados';

setStyleRule = function(selector, rule) {
    var stylesheet = document.styleSheets[(document.styleSheets.length - 1)];
    if(stylesheet.addRule) {
        stylesheet.addRule(selector, rule);
    } 
    else if(stylesheet.insertRule) {
        stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
    }
};

function escoder_contato(contato, insert){
    console.log("Escondendo contato: " + JSON.stringify(contato));
    var regra_css = ''+
        'display:none;'
    ;
    var seletor = seletor_painel_chat_inicio + contato["id"] + seletor_painel_chat_fim;
    setStyleRule(seletor, regra_css);
    //salva no storage
    if(insert){
        var storage = chrome.storage.local;
        storage.get(str_contatos_bloqueados, function(r){
            var contatos = r[str_contatos_bloqueados];
            contatos[contato["id"]] = contato;
            var obj = {};
            obj[str_contatos_bloqueados] = contatos;
            storage.set(obj);
        });
    }
}

//document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
window.addEventListener ("load", fireContentLoadedEvent, false);

function update_lista(lista){
    var lista_contatos = {};
    if(lista != null){
        for (var i=0;i<lista.childNodes.length;i++) {
            var item = lista.childNodes[i];
            //console.log(item.nodeName);
            if (item.nodeName == "LI") {
                var id_contato = item.getAttribute("data-id");
                var nome_contato = item.childNodes[0].childNodes[0].childNodes[2].childNodes[0].innerHTML;
                var img = item.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].getAttribute("src");
                var contato = {"id": id_contato, "nome": nome_contato, "img": img};
                item.setAttribute("draggable", "true");
                item.ondragstart = function(event){
                    console.log("Abrir lixeira");
                    document.getElementById("hide_contact_lixeira").style.display = "block";
                    event.target.style.opacity = "0.5";
                    item = event.target;
                    var id_contato = item.getAttribute("data-id");
                    var nome_contato = item.childNodes[0].childNodes[0].childNodes[2].childNodes[0].innerHTML;
                    var img = item.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].getAttribute("src");
                    event.dataTransfer.effectAllowed = "move";
                    var contato = {"id": id_contato, "nome": nome_contato, "img": img};
                    event.dataTransfer.setData("contato", JSON.stringify(contato));
                    return true;
                }
                item.ondragend = function(event){
                    console.log("Fechar lixeira");
                    document.getElementById("hide_contact_lixeira").style.display = "none";
                    event.target.style.opacity = "1";
                }
            }
            lista_contatos[id_contato] = contato;
        }
        console.log(lista_contatos);
    }
    return true;
}

function fireContentLoadedEvent () {
    console.log("fireContentLoadedEvent");

    var storage = chrome.storage.local;
    storage.get(str_contatos_bloqueados, function(r){
        var contatos = r[str_contatos_bloqueados];
        for(id in contatos){
            escoder_contato(contatos[id], false);
        }
    });

    var lixeira = document.createElement('div');
    var lixeira_texto = document.createElement('span');
    lixeira_texto.innerHTML = 'Arraste para aqui o contato que voce quer ocultar';
    lixeira.appendChild(lixeira_texto);
    lixeira.setAttribute("id", "hide_contact_lixeira");
    lixeira.style.cssText = 'display:none;position:fixed;left:40%;top:40%;width:20%;height:20%;opacity:0.8;z-index:1000;background:#fff;border:3px dashed #7790b5;line-height:100px;';
    lixeira_texto.style.cssText = 'opacity:1;color:#7790b5;text-align: center;vertical-align: middle;font-size:16px;display: inline-block;line-height: normal;';
    lixeira.ondragover = function(ev){
        console.log("dragOver()");
        ev.dataTransfer.dropEffect = 'move'; //da um feedback pro usuario, no caso, o mouse muda para indicar que é uma movimentacao, none, move, copy ou link
        // Por padrao arquivos e elementos não podem ser soltos em outros elementos, entao tem q tirar a acao padrao
        ev.preventDefault(); //evita que o objeto volte para o seu lugar, evita que chame apenas o dragEnd e não chame o drop.
        return false;
    }
    lixeira.ondrop = function(ev){
        console.log("dragDrop()");
        ev.preventDefault();
        var contato = JSON.parse(ev.dataTransfer.getData("contato"));
        console.log(contato);
        escoder_contato(contato, true);

        return false;
    }

    document.body.insertBefore(lixeira, document.body.firstChild);

    var side_bar = document.getElementsByClassName("fbChatSidebar")[0];
    
    if(typeof side_bar === 'undefined'){
        console.log("Nao foi possivel adicionar o evento a sidebar");
    }
    else{
        console.log(side_bar);
        side_bar.onmouseenter = function(){
        //function pegar_lista_chat(){
            console.log("atualizando lista do chat");
            var listas = document.getElementsByTagName("ul");
            var lista_ordenada = null;
            var lista_mais_amigos = null;
            //acha a q tem .o.$ordered_list
            //more_online_friends
            for (var i = 0, len = listas.length; i < len; i++ ) {
                if(listas[i].getAttribute("data-reactid") != null && listas[i].getAttribute("data-reactid").indexOf("$ordered_list") != -1){
                    lista_ordenada = listas[i];
                }
                else if(listas[i].getAttribute("data-reactid") != null && listas[i].getAttribute("data-reactid").indexOf("$more_online_friends") != -1){
                    lista_mais_amigos = listas[i];
                }
                if(lista_ordenada != null && lista_mais_amigos != null){
                    break;
                }
            }
            update_lista(lista_ordenada);
            update_lista(lista_mais_amigos);
        }
    }
} //funcao executada ao fim da pagina carregar

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(clickedEl);
//     if(request.tipo == 'elemento'){
//         var lista_chat = pegar_lista_chat();
//         var id_contato = clickedEl.getAttribute("data-reactid");
//         sendResponse({result: "ok", value: lista_chat[id_contato]});
//     }
//     else{
//         sendResponse({result: "ok"});
//     }
//   }
// );

// var alarmClock = {

//     onHandler : function(e) {
//         chrome.alarms.create("Hide_Contact_From_Facebook_Chat_List", {delayInMinutes: 0.1, periodInMinutes: 5} );
//         window.close();
//     },

//     offHandler : function(e) {
//         chrome.alarms.clear("Hide_Contact_From_Facebook_Chat_List");
//         window.close();
//     },

//     setup: function() {
//         var a = document.getElementById('alarmOn');
//         a.addEventListener('click',  alarmClock.onHandler );
//         var a = document.getElementById('alarmOff');
//         a.addEventListener('click',  alarmClock.offHandler );
//     }
// };

// document.addEventListener('DOMContentLoaded', function () {
//     alarmClock.setup();
// });

// chrome.alarms.onAlarm.addListener(function(alarm) {
//   alert("Beep");
// });

/* Listen for messages */
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(request);
//     if(request.tipo == "fundo"){
//         set_fundo_global(request.img);
//     }
//     else if(request.tipo == "fundo_remover"){
//         remove_fundo_global();
//     }
//     sendResponse({result: "ok"});
//   });

// var storage = chrome.storage.local;
// storage.get(bg_global, function(r){
//     img = r[bg_global];
//     console.log("Carregar background: " + img);
//     if(img && img != "undefined"){
//       set_fundo_global(img);
//     }
// });
