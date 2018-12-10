document.addEventListener('DOMContentLoaded', function() {
  $("#urltoignore").keyup(function(event){
    if(event.keyCode == 13){
        $("#addtoignore").click();
    }
});

  document.getElementById("addtoignore").onclick = function(){
    addToIgnore(document.getElementById("urltoignore").value);
    document.getElementById("urltoignore").value = "";
  };

  document.getElementById("playpause").addEventListener('change', function(){
    console.log("getting called")
    if (this.checked) {
      chrome.storage.sync.set({"playpause":true});
    }else{
      chrome.storage.sync.set({"playpause":false});
    }
  })

  loadtable()
  playPause()

});

function addToIgnore(value) {
    chrome.storage.sync.get("ignoreList", function(list){
      mylist = $.map(list["ignoreList"], function(el) { return el });
      mylist.push(value)
      chrome.storage.sync.set({"ignoreList":mylist}, function(){
        loadtable();
      });
    });
}

function removeFromIgnore(value){
  chrome.storage.sync.get("ignoreList", function(list){
    mylist = $.map(list["ignoreList"], function(el) { return el });

    if(mylist.indexOf(value) > -1 ){
      mylist.splice(mylist.indexOf(value) , 1)
    }
    else{
      return;
    }
    chrome.storage.sync.set({"ignoreList":mylist}, function(){
      loadtable();
    });
  });
}

function cleartable(){
  var table = document.getElementById("table");
  table.innerHTML = "  <table  id=\"table\" class=\"table\"><thead><tr><th>#</th><th>URL</th><th>Delete</th></tr></thead><tbody></tbody></table>";
}

function loadtable(){

  var table = document.getElementById("table");
  id = 0;
  cleartable();
  chrome.storage.sync.get("ignoreList", function(item){

    array = Array.from(item["ignoreList"])
    array.forEach(function(subitem){
      var row = table.insertRow(1+id++);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      cell1.innerHTML = id;
      cell2.innerHTML = subitem;
      cell3.innerHTML = "<button id=\"delete"+id+"\" value=\""+subitem+"\" type=\"button\" class=\"btn btn-danger\">Delete</button>";
    })
  getElementsStartsWithId("delete").forEach(function(item){
    item.onclick = function(){
      removeFromIgnore(item.value)
    }
  });
  });
}


function playPause() {
  item = document.getElementById("playpause")
  chrome.storage.sync.get("playpause", function(value){
    console.log(value)
    if (value.playpause) {
      item.checked = true;
    }else{
      item.checked = false;
    }
  })
}

function getElementsStartsWithId( id ) {
  var children = document.body.getElementsByTagName('*');
  var elements = [], child;
  for (var i = 0, length = children.length; i < length; i++) {
    child = children[i];
    if (child.id.substr(0, id.length) == id)
      elements.push(child);
  }
  return elements;
}
