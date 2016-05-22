function getID() {
	//jQuery.get("sign_up")
	//var id = prompt("Write ID:");
	//return parseInt(id);
	return 0;
}

function gotOpponent() {
	return opponentChanged;
}

function waitForOpponent(idx) {
	//Try to get opponent
	if (gotOpponent()) {
		//set global value
		opponentId = 1;
		opponentName = "enemy";
		//Hide waitingSlide
		//$("#waitingSlide").css("visibility", "hidden");
		$("#waitingSlide").slideUp();
		loadBoard();
		startGame();
	}
	else {
		var txt = "waiting for opponent" + ".".repeat(idx);
		$("#waitingSlide").text(txt);
		setTimeout(function(){
			waitForOpponent( (idx+1) % 4 );
		}, 1000);
	}
}

function isMyTurn() {

}

function blurBoard() {
	$("boardTable").addClass("blurred");
}

function cellPressed(cell) {
	if (isMyTurn() && cell.value == "") {

	}
}

function createTable(){
	var tbl = document.createElement('table');
	var tableSize = 3;
  for(var i = 0; i < tableSize; i++){
    var tr = tbl.insertRow();
    for(var j = 0; j < tableSize; j++){
      var td = tr.insertCell();
			td.onclick = "cellPressed(this);"
    }
  }
	return tbl;
}

function loadBoard() {
	//var tbl = createTable();
	//tbl.id = "boardTable";
	//$("#boardTableDiv").append(tbl);
	$("#board").slideDown();
}

function register() {
	//sign name and hide "getName" div
	userName = $("name").val();
	$("#getName").hide();

	//get id from server
	id = getID(userName);

	//get opponent id+name from server
	opponentChanged = false;
	$("#waitingSlide").show();
	$("#waitingSlide").slideDown();
	waitForOpponent(0);
}

function startGame() {
	//Say that a match was found and start game

}
