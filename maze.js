// Canvas and context used to draw maze
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Cell available neigbours
const CELL_NEIGHBOURS = {
	"TOP" : [-1, 0],
	"BOTTOM" : [1, 0],
	"LEFT" : [0, -1],
	"RIGHT" : [0, 1],
};

// Size of maze
let cellSize = 32;
let rows = 0;
let columns = 0;

class Cell {
	constructor(row, col){
    this.row = row;
    this.col = col;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
	  };
	}
}

// Adjust maze size based on the window size
function adjustMazeSize(){
	rows = 12;
	canvas.height = rows * cellSize;
	
	if(window.innerWidth<=320){
		columns = 6;
		rows = 10;
	}
	else if(window.innerWidth<600){
		columns = 12;
	}
	else{
		columns = 20;
	}
	canvas.width = columns * cellSize;
}

// Generates grid of cells
function generateGrid(rows, columns){
	let newGrid = [];
	for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < columns; c++) {
        let cell = new Cell(r, c, null);
        row.push(cell);
      }
      newGrid.push(row);
    }
	return newGrid;
}

// Randomly select the first cell
function getRandomFirstCell(grid, rows, columns){
	let row = Math.floor(Math.random() * rows);
	let column = Math.floor(Math.random() * columns);
	return grid[row][column];
}

// Get unvisited neighbours as available directions to go
function getNeighbours(grid, cell, rows, columns){
	let neighbours = [];
	
	// Top neighbour
	if(cell.row-1>=0 && grid[cell.row-1][cell.col].visited==false){
		neighbours.push("TOP");
	}
	
	// Bottom neighbour
	if(cell.row+1<rows && grid[cell.row+1][cell.col].visited==false){
		neighbours.push("BOTTOM");
	}
	
	// Left neighbour
	if(cell.col-1>=0 && grid[cell.row][cell.col-1].visited==false){
		neighbours.push("LEFT");
	}
	
	// Right neighbour
	if(cell.col+1<columns && grid[cell.row][cell.col+1].visited==false){
		neighbours.push("RIGHT");
	}
	
	return neighbours;
}

// Randomly select neighbour direction to go
function getRandomNeighbour(neighbours){
	let neighbour = Math.floor(Math.random() * neighbours.length);
	return neighbours[neighbour];
}

// Convert neighbour direction to the next cell
function getNextCell(grid, curCell, neighbour){
	let position = CELL_NEIGHBOURS[neighbour];
	return grid[curCell.row+position[0]][curCell.col+position[1]]
}

// Remove walls between current cell and next cell
function removeWallsBetweenCells(curCell, nextCell, nextCellStr){
	switch(nextCellStr){
		case "TOP": 
		{
		curCell.walls.topWall = false;
		nextCell.walls.bottomWall = false;
		break;
		}
		case "BOTTOM": 
		{
		curCell.walls.bottomWall = false;
		nextCell.walls.topWall = false;
		break;
		}
		case "LEFT":
		{
		curCell.walls.leftWall = false;
		nextCell.walls.rightWall = false;
		break;
		}
		case "RIGHT":
		{
		curCell.walls.rightWall = false;
		nextCell.walls.leftWall = false;
		break;
		}
	}
}

function getSingleExit(grid, id){
	switch(id){
		case "Top":
		{
			let randomCol = Math.floor(Math.random() * (columns-4))+2;
			grid[0][randomCol].walls.topWall = false;
			break;
		}
		case "Bottom":
		{
			let randomCol = Math.floor(Math.random() * (columns-4))+2;
			grid[rows-1][randomCol].walls.bottomWall = false;
			break;
		}
		case "Left":
		{
			let randomRow = Math.floor(Math.random() * (rows-4))+2;
			grid[randomRow][0].walls.leftWall = false;
			break;
		}
		case "Right":
		{
			let randomRow = Math.floor(Math.random() * (rows-4))+2;
			grid[randomRow][columns-1].walls.rightWall = false;
			break;
		}
	}
}

// Get two exits - an entry to the maze and an exit from the maze
function getRandomExits(grid){
	let sides = [ "Top", "Bottom", "Left", "Right" ];
	
	let entryId = Math.floor(Math.random() * sides.length);
	getSingleExit(grid, sides[entryId]);
	
	sides.splice(entryId, 1);

	let exitId = Math.floor(Math.random() * sides.length);
	getSingleExit(grid, sides[exitId]);
}

function drawSingleWall(x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();
}

// Draw cell walls
function drawCellWalls(cell){
	if(cell.walls.topWall==true){
		drawSingleWall(cell.col*cellSize, cell.row*cellSize, cellSize, 0);
	}
	
	if(cell.walls.bottomWall==true){	
		drawSingleWall(cell.col*cellSize, cell.row*cellSize+cellSize, cellSize, 0);
	}
	
	if(cell.walls.leftWall==true){
		drawSingleWall(cell.col*cellSize, cell.row*cellSize, 0, cellSize);
	}
	
	if(cell.walls.rightWall==true){
		drawSingleWall(cell.col*cellSize+cellSize, cell.row*cellSize, 0, cellSize);
	}
}

function drawMaze(grid){
	// Clear context and draw maze
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(let r=0; r < rows; r++){
		for(let c=0; c < columns; c++){
			drawCellWalls(grid[r][c]);
		}
	}
}

function generateMaze(){
	adjustMazeSize();
	
	let grid = generateGrid(rows, columns);
	
	let stack = [];

	let curCell = getRandomFirstCell(grid, rows, columns);
	curCell.visited = true;
	stack.push(curCell);
	
	while(stack.length>0){
		
		// Get unvisited neighbours as available directions to go
		let neighbours = getNeighbours(grid, curCell, rows, columns);
		
		if(neighbours.length>0){
			
			// Randomly select neighbour direction to go
			let neighbour = getRandomNeighbour(neighbours);
			
			// Convert neighbour direction to the next cell
			let nextCell = getNextCell(grid, curCell, neighbour);
			
			// Remove walls between current cell and next cell
			removeWallsBetweenCells(curCell, nextCell, neighbour)
			
			curCell = nextCell;
			curCell.visited = true;
			stack.push(curCell);
		}
		else{
			curCell = stack.pop();
		}
	}

	// Get two exits - an entry to the maze and an exit from the maze
	getRandomExits(grid);
	
	// Draw maze
	drawMaze(grid);
}
