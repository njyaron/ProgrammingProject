function getID() {
	//jQuery.get("sign_up")
	//var id = prompt("Write ID:");
	//return parseInt(id);
	myID = 0;
	return myID;
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

function blurBoard() {
	$("#boardTable").addClass("blurred");
}

function changeTurnDesign() {
	$("#boardTable").toggleClass("blurred");
}

function boardRowCol(row, col) {
	return $('#boardTable').children().children().eq(row).children().eq(col).text();
}

function getWinner() {
	//check rows
	for(var i = 0; i < 3; i++) {
		if (boardRowCol(i,0) != "" && boardRowCol(i,0)==boardRowCol(i,1) && boardRowCol(i,1)==boardRowCol(i,2)) {
			return boardRowCol(i,0);
		}
	}
	//check cols
	for(var i = 0; i < 3;
		 i++) {
		if (boardRowCol(0,i) != "" && boardRowCol(0,i)==boardRowCol(1,i) && boardRowCol(1,i)==boardRowCol(2,i)) {
			return boardRowCol(0,1);
		}
	}
	//check main diagonal
	if (boardRowCol(0,0) != "" && boardRowCol(0,0)==boardRowCol(1,1) && boardRowCol(1,1)==boardRowCol(2,2)) {
		return boardRowCol(0,0);
	}
	//check secondary diagonal
	if (boardRowCol(2,0) != "" && boardRowCol(2,0)==boardRowCol(1,1) && boardRowCol(1,1)==boardRowCol(0,2)) {
		return boardRowCol(2,0);
	}
	//then no winner
	return "";
}

function remakePage() {
	$("#getName").hide();
	registerToServer();
}

function handleWin() {
	var winner = getWinner();
	if (winner) {
		blurBoard();
		gameEnded = true;
		$("#endGame").slideDown();
		$("#endGameText").text(winner + " Won!");
	}
}


function waitForMove() {
	if (gotMove) {
		//make move on screen
		var cell = $('#boardTable').children().children().eq(moveRow-1).children().eq(moveCol-1);
		//TODO: check validity of input and maybe reject
		$(cell).text("O");
		changeTurnDesign();
		//check win
		handleWin();
		isMyTurn = true;
	}
	else {
		setTimeout(function(){
			waitForMove();
		}, 300);
	}
}

function sendMoveToServer(cell) {
	//TODO: send data to server
}

function cellPressed(cell) {
	if (isMyTurn && $(cell).text() == "") {
		$(cell).text("X");
		isMyTurn = false;
		changeTurnDesign();
		sendMoveToServer(cell);
		handleWin();
		//Temporary:
		gotMove = false;
		waitForMove();
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
	$("myNameTitle").text(userName);
	$("opNameTitle").text(opponentName);
}

function saveName() {
	//sign name and hide "getName" div
	userName = $("#name").val();
	$("#getName").hide();
}

function registerToServer() {
	//get id from server
	id = getID(userName);

	//get opponent id+name from server
	opponentChanged = false;
	$("#waitingSlide").show();
	$("#waitingSlide").slideDown();
	waitForOpponent(0);
}

function register() {
	saveName();
	registerToServer();
}

function startGame() {
	gameEnded = false;
	$("#myNameTitle").text(userName);
	$("#opNameTitle").text(opponentName);
	if (myID == 0) { //I'm first
		isMyTurn = true;
	} else {
		isMyTurn = false;
		changeTurnDesign();
	}
}
