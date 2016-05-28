function parseOpponent(result) {
	if (result["HasEnemy"]) {
		hasOpponent = true;
		opponentName = result["OpponentName"];
		playerNumber = Number(result["playerNumber"]);
		//Hide waitingSlide
		$("#waitingSlide").slideUp();
		startGame();
	} else {
		hasOpponent = false;
	}
}

function askForOpponent() {
	hasOpponent = false;
	$.post('AskForOp', {'UserID': myID}, parseOpponent);
	waitForOpponent(0);
}

function waitForOpponent(idx) {
	//Try to get opponent
	if (!hasOpponent) {
		//SERVER: send name and get if has matched enemy+enemy id
		$.post('GetOp', {'UserID': myID}, parseOpponent);
		//display waiting on screen
		var txt = "waiting for opponent" + ".".repeat(idx);
		$("#waitingSlide").text(txt);
		setTimeout(function(){
			waitForOpponent( (idx+1) % 4 );
		}, 700);
	}
}

function blurBoard() {
	$("#boardTable").addClass("blurred");
}

function changeTurn() {
	isMyTurn = !isMyTurn;
	moveID++;
	$("#boardTable").toggleClass("blurred");
	//check win
	handleWin();
}

function boardRowCol(row, col) {
	return $('#boardTable').children().children().eq(row).children().eq(col).text();
}

function getWinnerSymbol() {
	//check rows
	for(var i = 0; i < 3; i++) {
		if (boardRowCol(i,0) != "" && boardRowCol(i,0)==boardRowCol(i,1) && boardRowCol(i,1)==boardRowCol(i,2)) {
			return boardRowCol(i,0);
		}
	}
	//check cols
	for(var i = 0; i < 3; i++) {
		if (boardRowCol(0,i) != "" && boardRowCol(0,i)==boardRowCol(1,i) && boardRowCol(1,i)==boardRowCol(2,i)) {
			return boardRowCol(0,i);
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

function getWinner() {
	var winnerSymbol = getWinnerSymbol();
	if (winnerSymbol == "X") {
		return userName;
	}
	if (winnerSymbol == "O") {
		return opponentName;
	}
	return "";
}

function replayGame() {
	$("#endGame").slideUp();
	//SERVER: reload the entire board from the server
	$.get('GetBoard', function(result) {
		var htmlBoard = $(result);
		$("#board").replaceWith(htmlBoard);
		registerToServer();
	})
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

function getMove() {
	$.post('GetMove', {'UserID': myID}, function(result) {
		if (result["MoveID"] == moveID) {
			var moveRow = result["Row"];
			var moveCol = result["Col"];
			//make move on screen
			var cell = $('#boardTable').children().children().eq(moveRow).children().eq(moveCol);
			//TODO: check validity of input and maybe reject
			$(cell).text("O");
			changeTurn();
		} else {
			setTimeout(getMove, 700);
		}
	});
}

function sendMoveToServer(cell) {
	//SERVER:send move - send creds and move+move idx
	var col = cell.cellIndex;
	var row = cell.parentNode.rowIndex;
	$.post('SendMove', {'UserID': myID, 'Row': row, 'Col': col, 'MoveID': moveID});
}

function cellPressed(cell) {
	if (isMyTurn && $(cell).text() == "") {
		$(cell).text("X");
		sendMoveToServer(cell);
		changeTurn();
		getMove();
	}
}

function loadBoard() {
	$("#board").slideDown();
	$("#myNameTitle").text(userName);
	$("#opNameTitle").text(opponentName);
}

function saveName() {
	//sign name and hide "getName" div
	userName = $("#userNameInput").val();
	$("#getName").hide();
}

function registerToServer() {
	//get id from server
	//SERVER: send name and get credentials (to send every time)
	$.post('Register',{'UserName': userName}, function(result){
		myID = result['UserID'];
		//get opponent id+name from server
		opponentChanged = false;
		$("#waitingSlide").show();
		$("#waitingSlide").slideDown();
		askForOpponent();
	})
}

function register() {
	saveName();
	registerToServer();
}

function startGame() {
	gameEnded = false;
	moveID = 1;
	loadBoard();
	if (playerNumber == 1) { //I'm first
		isMyTurn = true;
	} else {
		isMyTurn = false;
		blurBoard();
		getMove();
	}
}

//TODO: SERVER: when exiting the window, inform the server
