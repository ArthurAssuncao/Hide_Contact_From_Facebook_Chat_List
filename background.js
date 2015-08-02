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