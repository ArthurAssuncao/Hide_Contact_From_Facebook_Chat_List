//background

var str_contatos_bloqueados = 'contatos_bloqueados';

chrome.runtime.onInstalled.addListener(function() {
    var storage = chrome.storage.local;
    storage.get(str_contatos_bloqueados, function(r){
        var contatos = r[str_contatos_bloqueados];
        if(typeof contatos === 'undefined'){
            obj = {};
            obj[str_contatos_bloqueados] = {};
            storage.set(obj);
        }
    });
});

chrome.runtime.onStartup.addListener(function() {
    
});

function mostrar_contato(id_contato){
    chrome.tabs.query({}, function(tabs){
        var msg = {tipo: "mostrar_contato", id_contato: id_contato};
        for (var i=0; i<tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, msg, function(response) {
                //console.log(response);
            });
        }
    });
}