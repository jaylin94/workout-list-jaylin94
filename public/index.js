const myTable = document.getElementById("myTable");
const newEntryBtn = document.getElementById("newEntryBtn");

function createRow() {
  let newRow = document.createElement("tr");
  return newRow;
}

function createData() {
  let newData = document.createElement("td");
  return newData;
}

function createInput() {
  let newInput = document.createElement("input");
  newInput.setAttribute("type", "text");
  return newInput;
}

function appendRow(rowCount) {
  myTable.children[1].appendChild(createRow());
  myTable.children[1].children[rowCount].style.border = "1px solid white";
  for(let i = 0; i < 5; i++) {
    myTable.children[1].children[rowCount].appendChild(createData());
    myTable.children[1].children[rowCount].children[i].style.border = "1px solid white";
    myTable.children[1].children[rowCount].children[i].style.textAlign = "center";
  }
}

function createBtn(name, id, rowCount) {
  let newBtn = document.createElement("input");
  newBtn.setAttribute("type", "submit");
  newBtn.setAttribute("value", name);
  if(name === "Edit") {
    newBtn.setAttribute("id", (name + id));
    addEditAction(newBtn, id, rowCount);
  }
  else if(name === "Delete"){
    newBtn.setAttribute("id", (name + id));
    addDeleteAction(newBtn, id);
  }
  return newBtn;
}

function addDeleteAction(delBtn, id) {
  delBtn.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    let req = new XMLHttpRequest();
    let payload = {};
    payload.row = id;
    payload.request = "deleteEntry";
    req.open("POST", "/", true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(payload));
    req.addEventListener("loadend", function() {
      setTimeout(getTable(), 8000);
    });
  });
}

function addEditAction(editBtn, id, rowCount) {
  editBtn.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    let req = new XMLHttpRequest();
    let payload = {
      id: id,
      request: "select"
    };
    req.open("POST", "/", true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(payload));
    req.addEventListener("loadend", function() {
      let response = JSON.parse(req.response);
      let tempDel = myTable.children[1].children[rowCount].children[6];
      myTable.children[1].children[rowCount].children[0].innerHTML = `<input type='text' placeholder='${response[0].name}' value='${response[0].name}' \>`;
      myTable.children[1].children[rowCount].children[1].innerHTML = `<input type='number' placeholder='${response[0].reps}' value='${response[0].reps}' \>`;
      myTable.children[1].children[rowCount].children[2].innerHTML = `<input type='number' placeholder='${response[0].weight}' value='${response[0].weight}' \>`;
      myTable.children[1].children[rowCount].children[3].innerHTML = `<input type='date' placeholder='${response[0].date}' value='${response[0].date}' \>`;
      myTable.children[1].children[rowCount].children[4].innerHTML = `<select placeholder='${response[0].lbs}' value='${response[0].lbs}'><option value='1'>Pounds</option><option value='0'>Kilograms</option></select>`;
      myTable.children[1].children[rowCount].removeChild(myTable.children[1].children[rowCount].children[5]);
      myTable.children[1].children[rowCount].removeChild(myTable.children[1].children[rowCount].children[5]);
      let saveBtn = document.createElement("input");
      saveBtn.setAttribute("type", "submit");
      saveBtn.setAttribute("value", "Save");
      addSaveAction(saveBtn, id, rowCount, response);
      myTable.children[1].children[rowCount].appendChild(saveBtn);
      myTable.children[1].children[rowCount].appendChild(tempDel);
    });
  });
}

function addSaveAction(saveBtn, id, rowCount, response) {
  saveBtn.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    let req = new XMLHttpRequest();
    let payload = {
      name: myTable.children[1].children[rowCount].children[0].children[0].value,
      reps: myTable.children[1].children[rowCount].children[1].children[0].value,
      weight: myTable.children[1].children[rowCount].children[2].children[0].value,
      date: myTable.children[1].children[rowCount].children[3].children[0].value,
      lbs: myTable.children[1].children[rowCount].children[4].children[0].value,
      id: id,
      request: "editEntry"
    };
    if(payload.name === "") {
      console.log("Name is required.");
    }
    else {
      req.open("POST", "/", true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(JSON.stringify(payload));
      req.addEventListener("loadend", function() {
        setTimeout(getTable(), 8000);
      });
    }
  });
}

function updateTable(id, name, reps, weight, date, lbs, rowCount) {
  appendRow(rowCount);
  myTable.children[1].children[rowCount].children[0].textContent = name;
  myTable.children[1].children[rowCount].children[1].textContent = reps;
  myTable.children[1].children[rowCount].children[2].textContent = weight;
  myTable.children[1].children[rowCount].children[3].textContent = date;
  myTable.children[1].children[rowCount].children[4].textContent = lbs;
  myTable.children[1].children[rowCount].appendChild(createBtn("Edit", id, rowCount));
  myTable.children[1].children[rowCount].appendChild(createBtn("Delete", id, rowCount));
}

function getTable() {
  let rowCount = 0;
  while(myTable.children[1].firstChild) {
    myTable.children[1].removeChild(myTable.children[1].firstChild);
  }
  let req = new XMLHttpRequest();
  let payload = {
    request: "results"
  };
  req.open("GET", "/result", true);
  // req.set("Content-Type", "application/json");
  // req.send(JSON.stringify(payload));
  req.send();
  req.addEventListener("loadend", function() {
    if(req.status >= 200 && req.status < 400) {
      let response = JSON.parse(req.response);
      for(let i = 0; i < response.length; i++) {
        updateTable(response[i].id, response[i].name, response[i].reps,
          response[i].weight, response[i].date, response[i].lbs, rowCount);
          rowCount++;
      }
    }
  });
}

newEntryBtn.addEventListener("click", function(event) {
  event.preventDefault();
  event.stopPropagation();
  let req = new XMLHttpRequest();
  let payload = {
    name: document.getElementById("newName").value,
    reps: Number(document.getElementById("newReps").value),
    weight: Number(document.getElementById("newWeight").value),
    date: document.getElementById("newDate").value,
    lbs: Number(document.getElementById("newLbs").value),
    request: "newEntry"
  };
  if(payload.name === "") {
    console.log("Name is required.");
  }
  else {
    req.open("POST", "/", true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(payload));
    req.addEventListener("loadend", function() {
      setTimeout(getTable(), 8000);
    });
  }

});

setTimeout(getTable(), 8000);
