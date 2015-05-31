var Matrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var directions =
{
	left:0,
	up:1,
	right:2,
	down:3,
	length:4
};
var debugVar;
// console.log(matrix);
// console.log(getNfree(matrix));

function getNfree(matrix)
{
	//console.log(matrix)
	//debugVar = matrix;
	if(matrix === undefined) throw "getNfree expects a list";
	return matrix.reduce(function(prev,current){
		return prev+(current===0?1:0);
	},0);
}

// console.log(spawn()); 
// display();
//console.log(matrix);

function spawn(matrix,n,numberArg){
	var N = getNfree(matrix), rand, number;
	if(N===0) return matrix;
	rand = arguments.length===1?Math.floor((Math.random()*N)+1):n;
	number = arguments.length<=2?(Math.random()<=0.9?2:4):numberArg;
	var i=0;
	matrix = matrix.map(function(current,index){
		if(current !== 0) ++i;
		if(index === rand-1+i) 
			{
				i=17;
				return number;
			}
		return current;
	});
	//console.log(matrix);
	return matrix;
}

function moveMatrix(matrix,direction){
	var newlists;
	lists = splitMatrix(matrix,direction);
	newlists = lists.map(function(list){
		return moveList(list);
	});
	return groupLists(newlists,direction);
}

function moveList(list)
{
	var newlist = [];
	var temp = [list,0];
	var i;
	for(i = 0; i<list.length; i++)
	{
		temp = collapseHead(remZeroes(temp[0]));
		newlist.push(temp[0][0]);
		if (temp[1]===-1) break;
		temp[0]=temp[0].slice(1);
	}
	for(i = 0; i<list.length; i++)
	{
		if(i>=newlist.length) newlist.push(0);
	}
	return newlist;
}

function remZeroes(list)
{
	var newlist = [];
	list.map(function(current){return current===0?0:newlist.push(current);});
	for(var i = 0; i<list.length; i++)
	{
		if(i>=newlist.length) newlist.push(0);
	}
	return newlist;
}

function collapseHead(list)
{
	if(list[1]===0) return [list,-1];
	if(list[0]===list[1]){
		list[0] = list[0]+list[1];
		list[1] = 0;
		return [list,1];
	}
	else return [list,0];
}

// console.log(moveList([2,4,2,0,4,2]));

function splitMatrix(matrix,direction)
{
	var listOfLists = [];
	for(var i = 0; i<4; ++i)
	{
		listOfLists.push([]);
		for(var j = 0; j<4; ++j)
		{
			listOfLists[i].push(matrix[direction%2===0?i*4+j:i+j*4]);
		}
		if(direction>1) listOfLists[i].reverse();
	}
	return listOfLists;
}

function groupLists(lists,direction)
{
	var matrix = [];
	if(direction>1) lists.map(function(current){return current.reverse();});
	for(var i = 0; i<4; ++i)
	{
		for(var j = 0; j<4; ++j)
		{
			matrix.push(lists[direction%2===0?i:j][direction%2===0?j:i]);
		}
	}
	return matrix;
}

function solverInstant(matrix){
	for(var i = 0; i<1000; i++)
	{
		//direction = Math.floor((Math.random()*4));
		var direction = chooseDirectionDeep2(matrix,1)[0];
		if(isLegalMove(matrix,direction)){
		matrix = moveMatrix(matrix,direction);
		matrix = spawn(matrix);
		}
		else
		{
			console.log("Solver tries illegal moves");
			break;
		}
		//display(matrix);
		if(isOver(matrix)) break;
	}
	console.log(i);
	return matrix;
	//display();
}

function solver(matrix){
	var timeout = 200;
	var maxSteps = 1000;
	solverRecursif(matrix,maxSteps,timeout);
}

function solverRecursif(matrix,maxSteps,timeout){
	setTimeout(function(){
		if(!maxSteps) return matrix;
		if(isOver(matrix)) return matrix;
		solverRecursif(solveStep(matrix),maxSteps-1,timeout)
	},timeout);
}

function solveStep(matrix){
	var direction = chooseDirectionDeep2(matrix,2)[0];
	if(isLegalMove(matrix,direction)){
		matrix = moveMatrix(matrix,direction);
		matrix = spawn(matrix);
		display(matrix);
		return matrix;
	}
	else
	{
		throw "Solver tries illegal moves";
	}
}

function testSolver(functionSolver,T){
	var matrix;
	var scores = [];
	for(var t=0; t<T; t++)
	{
		matrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		matrix= spawn(matrix);
		matrix = functionSolver(matrix);
		scores.push(score2(matrix));
	}
	return scores;
}

function chooseDirectionDeep2(matrix,depth)
{
	if(!depth) return [-1,score(matrix)];
	var tempMatrix;
	var universe;
	var scores;
	var tempScore=-1;
	var tempBestScore = -1;
	var tempBestDirection = -1;
	for(var i=0; i<directions.length; ++i)
	{
		//tempDirection = i;
		tempMatrix = moveMatrix(matrix,i);
		if(!arrayEquals(tempMatrix,matrix)){

			universe = spawnCombinations(tempMatrix);
			scores = universe.map(function(current){return chooseDirectionDeep2(current,depth-1)[1];});
			tempScore = chooseScoreMin(scores)[0];

			if(tempScore>tempBestScore){
				tempBestScore = tempScore;
				tempBestDirection = i;
			}
		}
	}
	return [tempBestDirection,tempBestScore<0?0:tempBestScore];
}

function chooseScoreMin(scores)
{
	//Choose minimum score except 0
	//scores = scores.map(function(current){return current>0?current:999999999999999});
	var chosenIndex = 0;
	var chosenScore = scores.reduce(function(prev,curr,index){
		if(prev>curr) chosenIndex = index;
		return Math.min(prev,curr);
	});
	return [chosenScore, chosenIndex];
}

function chooseDirectionDeep(matrix,depth)
{
	if(depth===0) return [-1,score(matrix)];
	var tempMatrix;
	var tempScore = 0;
	var tempScore1 = 0;
	var tempDirection = 0;
	tempMatrix = moveMatrix(matrix,0);
	tempScore = chooseDirectionDeep(tempMatrix,depth-1)[1];
	tempMatrix = moveMatrix(matrix,1);
	tempScore1 = chooseDirectionDeep(tempMatrix,depth-1)[1];
	if(tempScore1>tempScore)
	{
		tempScore = tempScore1;
		tempDirection = 1;
	}
	tempMatrix = moveMatrix(matrix,2);
	tempScore1 = chooseDirectionDeep(tempMatrix,depth-1)[1];
	if(tempScore1>tempScore)
	{
		tempScore = tempScore1;
		tempDirection = 2;
	}
	tempMatrix = moveMatrix(matrix,3);
	tempScore1 = chooseDirectionDeep(tempMatrix,depth-1)[1];
	if(tempScore1>tempScore)
	{
		tempScore = tempScore1;
		tempDirection = 3;
	}
	return [tempDirection, tempScore];
}

function chooseDirection(matrix){
	var tempMatrix;
	var tempScore = 0;
	var tempDirection = 0;
	tempMatrix = moveMatrix(matrix,0);
	tempScore = score(tempMatrix);
	tempMatrix = moveMatrix(matrix,1);
	if(score(tempMatrix)>tempScore)
	{
		tempScore = score(tempMatrix);
		tempDirection = 1;
	}
	tempMatrix = moveMatrix(matrix,2);
	if(score(tempMatrix)>tempScore)
	{
		tempScore = score(tempMatrix);
		tempDirection = 2;
	}
	tempMatrix = moveMatrix(matrix,3);
	if(score(tempMatrix)>tempScore)
	{
		tempScore = score(tempMatrix);
		tempDirection = 3;
	}
	return [tempDirection,tempScore];
}

function spawnCombinations(matrix)
{
	if(!matrix) throw "SpawnCombination takes a list";
	var universe = [];
	var N = getNfree(matrix);
	for(var i = 0; i<N; ++i)
	{
		universe.push(spawn(matrix,i+1,2));
		universe.push(spawn(matrix,i+1,4));
	}
	return universe;
}

function score(matrix){
	if(isOver(matrix)) return 0;
	return score5(matrix);
}

function score2(matrix){
	return matrix.reduce(function(prev,curr){return prev+curr*curr;},0);
}

function score3(matrix){
	return matrix.reduce(function(prev,curr,index){return prev+curr*curr*Math.floor(index/4+1);},0);
}

function score4(matrix){
	var squaredSum = matrix.reduce(function(prev,curr){return prev+curr*curr;},0);
	var listsHoriz = splitMatrix(matrix,0);
	var listsVert = splitMatrix(matrix,1);
	var neighbouring = scoreNeighbouring();

}

function score5(matrix){
	var listsHoriz = splitMatrix(matrix,0);
	var listsVert = splitMatrix(matrix,1);
	var scoresHoriz = listsHoriz.map(
		function(current){
			var indexMax = [0,current[0]];
			for(var i=0; i<current.length-1;++i)
			{
				indexMax = current[i+1]>indexMax[1]?[i+1,current[i+1]]:indexMax;
			}
			return indexMax[0]===0||indexMax[0]===3?1:0;
		});
	var scoresVert = listsVert.map(
		function(current){
			var indexMax = [0,current[0]];
			for(var i=0; i<current.length-1;++i)
			{
				indexMax = current[i+1]>indexMax[1]?[i+1,current[i+1]]:indexMax;
			}
			return indexMax[0]===0||indexMax[0]===3?1:0;
		});
	//return scoresHoriz ;
	return getNfree(matrix)+scoresHoriz.reduce(function(prev,curr){return prev+curr;})+scoresVert.reduce(function(prev,curr){return prev+curr;});
}

function scoreNeighbouring(list)
{
	var score = 0;
	for(var i = 0; i<list.length - 1; ++i)
	{
		score += list[i]===list[i+1]?list[i]*list[i+1]:-(list[i]-list[i+1])*(list[i]-list[i+1]);
	}
	return score;
}

function isOver(matrix)
{
	if(getNfree(matrix)>0) return false;
	var lists=splitMatrix(matrix,0);
	if (!listsOver(lists)) return false;
	lists=splitMatrix(matrix,1);
	if (!listsOver(lists)) return false;
	return true;
}

function listsOver(lists)
{
	for(var i = 0; i< lists.length; ++i)
	{
		if(!listOver(lists[i])) return false;
	}
	return true;
}

function listOver(list)
{
	var bool = true;
	list.reduce(function(prev,curr){
		if(prev===curr) bool = false; 
		return curr;
	});
	return bool;
}

function isLegalMove(matrix,move)
{
	var tempMatrix = moveMatrix(matrix,move);
	return !arrayEquals(tempMatrix,matrix);
}

function arrayEquals(a,b)
{
	return !(a<b || b<a);
}

function display(matrix){
	$('#table1 td').map(function(index, current){
		current.innerText = matrix[index];
		if(!matrix[index])
		{
			current.setAttribute("style",'color:white;');
		}
		else
		{
			current.setAttribute("style",'color:black;');
		}
	});
	// console.log(score(matrix));
	// console.log(score2(matrix));
	//console.log(chooseDirection(matrix));
}

function reset(matrix){
	matrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	matrix = spawn(matrix);
	return matrix;
}

Matrix = spawn(Matrix);
display(Matrix);

//var scores = testSolver(solver,20);

$('button[name=up]').click(function(){
	if(isLegalMove(Matrix,directions.up)){
		Matrix = moveMatrix(Matrix,directions.up);
		Matrix = spawn(Matrix);
	}
	display(Matrix);
});
$('button[name=down]').click(function(){
	if(isLegalMove(Matrix,directions.down)){
		Matrix = moveMatrix(Matrix,directions.down);
		Matrix = spawn(Matrix);
	}
	display(Matrix);
});
$('button[name=left]').click(function(){
	if(isLegalMove(Matrix,directions.left)){
		Matrix = moveMatrix(Matrix,directions.left);
		Matrix = spawn(Matrix);
	}
	display(Matrix);
});
$('button[name=right]').click(function(){
	if(isLegalMove(Matrix,directions.right)){
		Matrix = moveMatrix(Matrix,directions.right);
		Matrix = spawn(Matrix);
	}
	display(Matrix);
});

$('button[name=solve]').click(function(){
	Matrix = solverInstant(Matrix);
	display(Matrix);
});

$('button[name=solve2]').click(function(){
	Matrix = solver(Matrix);
	display(Matrix);
});

$('button[name=reset]').click(function(){
	Matrix = reset(Matrix);
	display(Matrix);
});

