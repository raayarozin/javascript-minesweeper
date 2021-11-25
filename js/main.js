'use strict'
var gBoard;

const MINE = '💥'
const FLAG = '▶'



const gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0
}

var globalTimer;
var neverClicked;

var gLevel = {
	SIZE: 4,
	MINES: 2
};

function init() {
	gBoard = buildBoard();
	setGameStatus("Press to start");
	neverClicked = true;
	renderBoard(gBoard);
}
function startTimer(){
	return setInterval(function() {
		gGame.secsPassed++;
		document.getElementById("timer").innerText = gGame.secsPassed;
	}, 1000)
}

function resetTimer(){
	clearInterval(globalTimer);
	gGame.secsPassed = 0;
	document.getElementById("timer").innerText = "";
}
function startPlaying(){
	gGame.isOn = true;
	setGameStatus("Playing!")
	globalTimer = startTimer()
}

function reset(){
	init();
	resetTimer();
	neverClicked = true;
	gGame.isOn = false;
	gGame.markedCount = 0;
	gGame.shownCount = 0;
}
function setGameStatus(text){
	document.getElementById("status").innerText = text;
}
function checkWin(board){
	if(gGame.markedCount === gLevel.MINES && gGame.shownCount === (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) {
		setGameStatus("WON!")
		resetTimer();
	}
}

function buildBoard(){
	//get Level
	var level = document.getElementById("levels").value;
	switch(level){
		case "Beginner":
			gLevel.SIZE = 4;
			gLevel.MINES = 2;
			break;
		case "Medium":
			gLevel.SIZE = 8;
			gLevel.MINES = 12;
			break;
		case "Expert":
			gLevel.SIZE = 12;
			gLevel.MINES = 30;
			break;
	}
	var board = createMat(gLevel.SIZE, gLevel.SIZE);
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = createCell();
			board[i][j] = cell;
		}
	}
	randomizeMines(board);
	setMinesNegsCount(board);
	return board;
}

function randomizeLocationInMat(){
	var row = Math.floor(Math.random() * gLevel.SIZE);
	var column = Math.floor(Math.random() * gLevel.SIZE);
	return {row: row, column:column};
}

function checkIfNeighborIsMine(i,j, cell, board){
	if(i >= 0 && i < gLevel.SIZE && j >= 0 && j < gLevel.SIZE && board[i][j].isCellMine) {
		cell.minesAroundCount++;
	}
}

function calcNeighborMines(i, j, board){
	checkIfNeighborIsMine(i-1,j-1, board[i][j], board);
	checkIfNeighborIsMine(i-1,j, board[i][j], board);
	checkIfNeighborIsMine(i-1,j+1, board[i][j],board);
	checkIfNeighborIsMine(i,j+1, board[i][j],board);
	checkIfNeighborIsMine(i+1,j+1, board[i][j],board);
	checkIfNeighborIsMine(i+1,j, board[i][j],board);
	checkIfNeighborIsMine(i+1,j-1, board[i][j],board);
	checkIfNeighborIsMine(i,j-1, board[i][j],board);
}

function revelCellIfPossible(i,j){
	if(i >= 0 && i < gLevel.SIZE && j >= 0 && j < gLevel.SIZE){
		if(!gBoard[i][j].isCellShown && !gBoard[i][j].isCellMarked){
			gBoard[i][j].isCellShown = true;
			gGame.shownCount++;
			var elCell = document.getElementById(`${i}-${j}`);
			renderCell(elCell, gBoard, i, j);
		}
	}
}

function expandShown(board, i, j){
	revelCellIfPossible(i-1,j-1);
	revelCellIfPossible(i-1,j);
	revelCellIfPossible(i-1,j+1);
	revelCellIfPossible(i,j+1);
	revelCellIfPossible(i+1,j+1);
	revelCellIfPossible(i+1,j);
	revelCellIfPossible(i+1,j-1);
	revelCellIfPossible(i,j-1);
}

function setMinesNegsCount(board){
	for(var i = 0; i<board.length; i++){
		for(var j=0; j<board[0].length; j++){
			calcNeighborMines(i, j, board);
		}
	}
}
function randomizeMines(board){
	var amountOfMines = gLevel.MINES;
	var mineLocation;
	var mineAlreadyExistsFlag = true
	for(var i = 0; i<amountOfMines; i++){
		do{
			mineLocation = randomizeLocationInMat();
			if(!board[mineLocation.row][mineLocation.column].isCellMine){
				mineAlreadyExistsFlag = false;
			}
		}
		while(mineAlreadyExistsFlag);
		board[mineLocation.row][mineLocation.column].isCellMine = true;
	}
}
function createCell() {
	return { minesAroundCount: 0, isCellShown: false, isCellMarked: false, isCellMine: false};

}
function showAllMines() {
	for(var i = 0; i<gBoard.length; i++){
		for(var j = 0; j<gBoard[0].length; j++){
			if(gBoard[i][j].isCellMine){
				gBoard[i][j].isCellShown = true;
			}
		}
	}
}
function reveal(row, col){
	if(gBoard[row][col].isCellMine){
		gGame.isOn = false;
		showAllMines();
		setGameStatus("LOST!");
		clearInterval(globalTimer);

	}
	else if(!gBoard[row][col].isCellMarked) {
		if(gBoard[row][col].minesAroundCount === 0){
			expandShown(gBoard, row, col)
		}
		gBoard[row][col].isCellShown = true;
		gGame.shownCount++;
	}
}

function flag(elCell){
	if(!elCell.isCellShown) {
		elCell.isCellMarked = !elCell.isCellMarked;
		if (elCell.isCellMarked) {
			gGame.markedCount++;
		} else {
			gGame.markedCount--;
		}
	}
}

function cellClicked(elCell, i, j){
	if(neverClicked){
		neverClicked = false;
		startPlaying();
	}
	if(gGame.isOn) {
		switch (elCell.button) {
			case 0:
				reveal(i, j);
				break;
			case 2:
				flag(gBoard[i][j]);
				break;
		}
		renderCell(elCell.target, gBoard, i, j);
		checkWin(gBoard);
	}

}

function getCellText(board, i, j){
	var text = "";
	if(board[i][j].isCellMine && board[i][j].isCellShown){
		text = MINE;
	}
	else if(board[i][j].isCellMarked){
		text = FLAG;
	}
	else if(board[i][j].isCellShown && board[i][j].minesAroundCount !== 0){
		text = board[i][j].minesAroundCount;
	}
	return text;
}
function renderCell(elCell, board, i, j){
	var text = getCellText(board, i, j)
	elCell.innerText = text;

	if(board[i][j].isCellShown)
	{
		elCell.style.backgroundColor = "#d3d3d3";
	}
}

function renderBoard(board) {
	var strHTML = '<table border="0"><tbody>';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>';
		for (var j = 0; j < board[0].length; j++) {
			var cellText = getCellText(board, i, j);
			var className = `cell cell-${i}-${j}`;
			strHTML += '<td id="'+`${i}-${j}`+'" class="' + className + '"' +`, onmousedown="cellClicked(event ,${i}, ${j})">` + cellText// + cell.isCellMine + ", " + cell.isCellShown + ", " + cell.isCellMarked;
			strHTML += '</td>';
		}
		strHTML += '</tr>';
	}
	strHTML += '</tbody></table>';
	var elContainer = document.querySelector('.container');
	elContainer.innerHTML = strHTML;
}