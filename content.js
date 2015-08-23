// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//http://stackoverflow.com/questions/265984/how-to-redefine-css-classes-with-javascript

console.log("Extensao Hide Contact From Facebook Chat List");

var seletor_painel_chat_inicio = "li[data-id='";
var seletor_painel_chat_fim = "']"
var str_contatos_bloqueados = 'contatos_bloqueados';
var regra_css_esconder_contato = ''+
        'display:none;'
;
var regra_css_mostrar_contato = ''+
        'display:block;'
;
var regra_css_esconder_contato_status = ''+
        'background-position: -26px -296px; height: 11px;'
;
var regra_css_mostrar_contato_status = ''+
        'background-position: -26px -318px; height: 7px;'
;

//bloqueia a pagina caso seja de um contato oculto e marcado para bloquear
//<meta property="al:android:url" content="fb://profile/id_contato" />
function bloquear_pagina(){
    var metas = document.getElementsByTagName('meta');
    var deve_bloquear = false;
    for (i = 0; i < metas.length; i++) {
        id_pagina = null;
        if (metas[i].getAttribute("content") != null && metas[i].getAttribute("content").indexOf("fb://profile/") != -1) {
            var str = metas[i].getAttribute("content");
            id_pagina = str.substr(str.indexOf("fb://profile/") + "fb://profile/".length, str.length);
            //console.log(id_pagina);
            break;
        }

    }
    if(id_pagina != null){
        var storage = chrome.storage.local;
        storage.get(str_contatos_bloqueados, function(r){
            var contatos = r[str_contatos_bloqueados];
            if(contatos[id_pagina] != 'undefined' && contatos[id_pagina]["bloquear_perfil"] != 'undefined'){
                deve_bloquear = contatos[id_pagina]["bloquear_perfil"];
                if(id_pagina != null && deve_bloquear){
                    var url_contato_bloqueado = chrome.extension.getURL("contato_bloqueado.html");
                    //console.log("Redircionando para: " + url_contato_bloqueado);
                    //chrome.extension.sendMessage({redirect: url_contato_bloqueado});
                    location.href = url_contato_bloqueado;
                }
            }
        });
    }
}



function remover_stylesheet_rule(selector, rule){
    var stylesheet = document.styleSheets[(document.styleSheets.length - 1)];
    var rules = stylesheet.rules;
    // apaga regras iguais
    for(var i=0; i < rules.length; i++){
        if(rules[i].selectorText == selector){
            stylesheet.deleteRule(i);
        }
    }
}

set_style_rule = function(selector, rule) {
    var stylesheet = document.styleSheets[(document.styleSheets.length - 1)];
    // apaga regras iguais
    remover_stylesheet_rule(selector, rule);
    if(stylesheet.addRule) {
        stylesheet.addRule(selector, rule);
    } 
    else if(stylesheet.insertRule) {
        stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
    }
};

function esconder_contato(contato, insert){
    //console.log("Escondendo contato: " + JSON.stringify(contato));
    var seletor = seletor_painel_chat_inicio + contato["id"] + seletor_painel_chat_fim;
    set_style_rule(seletor, regra_css_esconder_contato);
    var seletor_status = seletor_painel_chat_inicio + contato["id"] + seletor_painel_chat_fim + ' i';
    set_style_rule(seletor_status, regra_css_esconder_contato_status);
    var seletor_status_search = 'ul[id="typeahead_list_u_0_1o"] a[href="/messages/' + contato["id"] + '"] i';
    set_style_rule(seletor_status_search, regra_css_esconder_contato_status);
    
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

function esconder_contatos(){
    var storage = chrome.storage.local;
    storage.get(str_contatos_bloqueados, function(r){
        var contatos = r[str_contatos_bloqueados];
        for(id in contatos){
            esconder_contato(contatos[id], false);
        }
    });
}


function bloquear_abertura_janela_chat(){
    var storage = chrome.storage.local;
    storage.get(str_contatos_bloqueados, function(r){
        var janelas = document.getElementsByClassName('fbNubGroup');
        janelas = janelas[janelas.length-1];
        for (var i=0;i<janelas.childNodes.length;i++) {
            var janela = janelas.childNodes[i];
            var janela_name = janela.getElementsByClassName("titlebarText")[0];
            var janela_fechar = janela.getElementsByClassName("close")[0];
            var nome_contato = janela_name.childNodes[0].childNodes[0].innerText;
            // console.log(tag_span.innerText);
            // console.log(tag_span.innerHTML);
            // console.log(tag_span.textContent);
            
            var contatos = r[str_contatos_bloqueados];
            for(id in contatos){
                console.log(nome_contato + ' - ' + contatos[id]['nome']);
                if(nome_contato == contatos[id]['nome'] && (contatos[id]['bloquear_chat_window'] != 'undefined' && contatos[id]['bloquear_chat_window']) ){
                    //janela.remove();
                    // console.log("removendo: " + contatos[id]['nome']);
                    janela_fechar.click();
                }
            }
            
        }
    });
}

function updater_janelas_chat(){
    var observer_janelas_chat = new MutationObserver(function(mutations) {
        //console.log("Houve mudança nas janelas do chat");
        bloquear_abertura_janela_chat();
    });

    var janelas_chat = document.getElementsByClassName('fbNubGroup');
    janelas_chat = janelas_chat[janelas_chat.length-1];
    observer_janelas_chat.observe(janelas_chat, { childList: true, subtree: true });
    // O correto seria usar um codigo semelhante ao abaixo, porem ele nao percebe a mudanca do innerHTML.
    // http://w3c-test.org/dom/nodes/MutationObserver-inner-outer.html
    // for (var i=0;i<janelas_chat.childNodes.length;i++) {
    //     var janela = janelas_chat.childNodes[i];
    //     var janela_name = janela.getElementsByClassName("titlebarText")[0];
    //     observer_janelas_chat.observe(janela_name, { childList: true, subtree: true, characterData: true });
    // }
}

function update_lista(lista){
    var lista_contatos = {};
    if(lista != null){
        var observer = new MutationObserver(function(mutations) {
            //console.log("Houve mudança na lista do chat");
            esconder_contatos();
        });
        observer.observe(lista, { childList: true });
        for (var i=0;i<lista.childNodes.length;i++) {
            var item = lista.childNodes[i];
            //console.log(item.nodeName);
            if (item.nodeName == "LI") {
                var id_contato = item.getAttribute("data-id");
                var nome_contato = item.childNodes[0].childNodes[0].childNodes[2].childNodes[0].innerHTML;
                //var status_contato = item.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[1];
                var img = item.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].getAttribute("src");
                var contato = {"id": id_contato, "nome": nome_contato, "img": img, "bloquear_perfil": false};
                item.setAttribute("draggable", "true");
                item.ondragstart = function(event){
                    //console.log("Abrir lixeira");
                    document.getElementById("hide_contact_lixeira").style.display = "block";
                    event.target.style.opacity = "0.5";
                    item = event.target;
                    var id_contato = item.getAttribute("data-id");
                    var nome_contato = item.childNodes[0].childNodes[0].childNodes[2].childNodes[0].innerHTML;
                    //var status_contato = item.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[1];
                    var img = item.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].getAttribute("src");
                    event.dataTransfer.effectAllowed = "move";
                    var contato = {"id": id_contato, "nome": nome_contato, "img": img, "bloquear_perfil": false};
                    event.dataTransfer.setData("contato", JSON.stringify(contato));
                    return true;
                }
                item.ondragend = function(event){
                    //console.log("Fechar lixeira");
                    document.getElementById("hide_contact_lixeira").style.display = "none";
                    event.target.style.opacity = "1";
                }
            }
            lista_contatos[id_contato] = contato;
        }
        //console.log(lista_contatos);
    }
    return true;
}

function fireContentLoadedEvent () {
    //console.log("fireContentLoadedEvent");

    esconder_contatos();

    bloquear_abertura_janela_chat();
    updater_janelas_chat();

    var lixeira = document.createElement('div');
    var lixeira_texto = document.createElement('span');
    lixeira_texto.innerHTML = 'Arraste para aqui o contato que voce quer ocultar';
    lixeira.appendChild(lixeira_texto);
    lixeira.setAttribute("id", "hide_contact_lixeira");
    lixeira.style.cssText = 'display:none;position:fixed;left:40%;top:40%;width:20%;height:20%;opacity:0.8;z-index:1000;background:#fff;border:3px dashed #7790b5;line-height:100px;';
    lixeira_texto.style.cssText = 'opacity:1;color:#7790b5;text-align: center;vertical-align: middle;font-size:16px;display: inline-block;line-height: normal;';
    lixeira.ondragover = function(ev){
        //console.log("dragOver()");
        ev.dataTransfer.dropEffect = 'move'; //da um feedback pro usuario, no caso, o mouse muda para indicar que é uma movimentacao, none, move, copy ou link
        // Por padrao arquivos e elementos não podem ser soltos em outros elementos, entao tem q tirar a acao padrao
        ev.preventDefault(); //evita que o objeto volte para o seu lugar, evita que chame apenas o dragEnd e não chame o drop.
        return false;
    }
    lixeira.ondrop = function(ev){
        //console.log("dragDrop()");
        ev.preventDefault();
        var contato = JSON.parse(ev.dataTransfer.getData("contato"));
        //console.log(contato);
        esconder_contato(contato, true);

        return false;
    }

    document.body.insertBefore(lixeira, document.body.firstChild);

    var side_bar = document.getElementsByClassName("fbChatSidebar")[0];
    
    if(typeof side_bar === 'undefined'){
        console.log("Nao foi possivel adicionar o evento a sidebar");
    }
    else{
        //console.log(side_bar);
        side_bar.onmouseenter = function(){
        //function pegar_lista_chat(){
            //console.log("atualizando lista do chat");
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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        //console.log(request);
        if (request.tipo == "mostrar_contato"){
            var id_contato = request.id_contato;
            //console.log("mostrar contato: " + id_contato);
            var seletor = seletor_painel_chat_inicio + id_contato + seletor_painel_chat_fim;
            set_style_rule(seletor, regra_css_mostrar_contato);
            remover_stylesheet_rule(seletor, null);
        }
        sendResponse({result: "ok"});
    }
);

document.addEventListener('DOMContentLoaded', bloquear_pagina, false);
window.addEventListener ("load", fireContentLoadedEvent, false);