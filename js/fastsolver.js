

function disp(tb,db)
{
	$('#table2 td').map(function(index, current){
		var val;
		if(index<8)
		{
			val = 1 << (tb >> (4*index) & 0xf);
		}
		else
		{
			val = 1 << (db >> (4*(index-8)) & 0xf);
		}
		// current.innerText = matrix[index];
		if(val-1)
		{
			current.innerText = val;
			//current.setAttribute("style",'color:black;');
		}
		else
		{
			current.innerText = "";
			//current.setAttribute("style",'color:white;');
		}
	});
}

function Row1(b)
{
	return b & 0xffff;
}

function Row2(b)
{
	return b >> 16 & 0xffff;
}

function Col1(tb,db)
{
	return tb & 0xf | tb >> 12 & 0xf0 | db << 8 & 0xf00 | db >> 4 & 0xf000;
}

function Col2(tb,db)
{
	return tb >> 4 & 0xf | tb >> 16 & 0xf0 | db << 4 & 0xf00 | db >> 8 & 0xf000;
}

function Col3(tb,db)
{
	return tb >> 8 & 0xf | tb >> 20 & 0xf0 | db & 0xf00 | db >> 12 & 0xf000;
}

function Col4(tb,db)
{
	return tb >> 12 & 0xf | tb >> 24 & 0xf0 | db >> 4 & 0xf00 | db >> 16 & 0xf000;
}

function reverse(row)
{
	return row >> 12 & 0xf | row >> 4 & 0xf0 | row << 4 & 0xf00 | row << 12 & 0xf000;
}

var rowLeft = [], rowRight = [], colUp = [], colDown = [];
var score = [];
function initTables()
{
	for(var row = 0; row <= 0xffff; ++row)
	{
		var rowList = [
			row & 0xf,
			row >> 4 & 0xf,
			row >> 8 & 0xf,
			row >> 12 & 0xf
		], movedRow;

		var max = 0,i,scoreCalc = 0;
        for (i = 1; i < 4; ++i) {
            if (rowList[i] > rowList[max]) max = i;
        }

        if (max == 0 || max == 3) scoreCalc += 2;

        if ((rowList[0] < rowList[1]) && (rowList[1] < rowList[2]) && (rowList[2] < rowList[3])) scoreCalc += 2;
        if ((rowList[0] > rowList[1]) && (rowList[1] > rowList[2]) && (rowList[2] > rowList[3])) scoreCalc += 2;

		score[row]=nFreeRow(row) + scoreCalc;

		for (i = 0; i < 3; ++i) 
		{
            var j;
            for (j = i + 1; j < 4; ++j) 
            {
                if (rowList[j] !== 0) break;
            }
            if (j === 4) break;

            if (rowList[i] === 0)
            {
                rowList[i] = rowList[j];
                rowList[j] = 0;
                i--;
            } 
            else if (rowList[i] === rowList[j] && rowList[i] != 0xf) 
            {
                rowList[i]++;
                rowList[j] = 0;
            }
        }
        movedRow = rowList[0] | rowList[1] << 4 | rowList[2] << 8 | rowList[3] << 12;
        
        rowLeft[row] = movedRow; 
        rowRight[reverse(row)] = reverse(movedRow); 
	}
	colUp = rowLeft;
	colDown = rowRight;
	transTable = [];
	return true;
}

function hPackRows(row1,row2)
{
	var hb;
	hb = (row1 | row2 << 16)>>>0;
	return hb;
}

function tPackCols(col1,col2,col3,col4)
{
	var tb;
	tb = (col1 & 0xf | col2 << 4 & 0xf0 | col3 << 8 & 0xf00 | col4 << 12 & 0xf000
		| col1 << 12 & 0xf0000 | col2 << 16 & 0xf00000 | col3 << 20 & 0xf000000 | col4 << 24 & 0xf0000000)>>>0;
	return tb;
}

function dPackCols(col1,col2,col3,col4)
{
	var db;
	db = (col1 >> 8 & 0xf | col2 >> 4 & 0xf0 | col3 & 0xf00 | col4 << 4 & 0xf000
		| col1 << 4 & 0xf0000 | col2 << 8 & 0xf00000 | col3 << 12 & 0xf000000 | col4 << 16 & 0xf0000000)>>>0;
	return db;
}

function mov(tb,db,dir)
{
	var tmp,tmp1,tmp2;
	switch(dir)
	{
		case 0:
			tmp1 = hmoveLeft(tb);
			tmp2 = hmoveLeft(db);
			return isLeg(tb,db,tmp1,tmp2)?[tmp1,tmp2]:false;
		case 1:
			tmp = moveUp(tb,db);
			return isLeg(tb,db,tmp[0],tmp[1])?tmp:false;
		case 2:
			tmp1 = hmoveRight(tb);
			tmp2 = hmoveRight(db);
			return isLeg(tb,db,tmp1,tmp2)?[tmp1,tmp2]:false;
		case 3:
			tmp = moveDown(tb,db);
			return isLeg(tb,db,tmp[0],tmp[1])?tmp:false;
		default:
			return false;
	}
}

function oldmov(tb,db,dir) //deprecated
{
	var tmp;
	switch(dir)
	{
		case 0:
			tmp = moveLeft(tb,db);
			return isLeg(tb,db,tmp[0],tmp[1])?tmp:false;
		case 1:
			tmp = moveUp(tb,db);
			return isLeg(tb,db,tmp[0],tmp[1])?tmp:false;
		case 2:
			tmp = moveRight(tb,db); 
			return isLeg(tb,db,tmp[0],tmp[1])?tmp:false;
		case 3:
			tmp = moveDown(tb,db);
			return isLeg(tb,db,tmp[0],tmp[1])?tmp:false;
		default:
			return false;
	}
}

function hmoveLeft(hb)
{
	return hPackRows(rowLeft[Row1(hb)],rowLeft[Row2(hb)]);
}

function hmoveRight(hb)
{
	return hPackRows(rowRight[Row1(hb)],rowRight[Row2(hb)]);
}

function moveLeft(tb,db)
{
	var ntb,ndb;
	ntb = hPackRows(
		rowLeft[Row1(tb)],
		rowLeft[Row2(tb)]
		);
	ndb = hPackRows(
		rowLeft[Row1(db)],
		rowLeft[Row2(db)]
		);
	return [ntb, ndb];
}

function moveRight(tb,db)
{
	var ntb,ndb;
	ntb = hPackRows(
		rowRight[Row1(tb)],
		rowRight[Row2(tb)]
		);
	ndb = hPackRows(
		rowRight[Row1(db)],
		rowRight[Row2(db)]
		);
	return [ntb, ndb];
}

function moveUp(tb,db)
{
	var ntb,ndb;
	ntb = tPackCols(
		colUp[Col1(tb,db)],
		colUp[Col2(tb,db)],
		colUp[Col3(tb,db)],
		colUp[Col4(tb,db)]
		);
	ndb = dPackCols(
		colUp[Col1(tb,db)],
		colUp[Col2(tb,db)],
		colUp[Col3(tb,db)],
		colUp[Col4(tb,db)]
		);
	return [ntb, ndb];
}

function moveDown(tb,db)
{
	var ntb,ndb;
	ntb = tPackCols(
		colDown[Col1(tb,db)],
		colDown[Col2(tb,db)],
		colDown[Col3(tb,db)],
		colDown[Col4(tb,db)]
		);
	ndb = dPackCols(
		colDown[Col1(tb,db)],
		colDown[Col2(tb,db)],
		colDown[Col3(tb,db)],
		colDown[Col4(tb,db)]
		);
	return [ntb, ndb];
}

function nFreeRow(row) // gets nFree in a row, used for scoring
{
	var n=0,i,tmp=row;
	for(i=0; i<4; ++i)
	{
		if(!(tmp&0xf)) n++; // if the last octet of tmp = 0
		tmp >>= 4; // get rid of last octet
	}
	return n;
}

function nFree(tb,db)
{
	var n=0,i,tmp1=tb,tmp2=db;
	for(i=0; i<8; ++i)
	{
		if(!(tmp1&0xf)) n++; // if the last octet of tmp1 = 0
		tmp1 >>= 4; // get rid of last octet
		if(!(tmp2&0xf)) n++;
		tmp2 >>= 4;
	}
	return n;
}

function fspawn(tb,db)
{
	var nf = nFree(tb,db);
	var nb = Math.random()<0.9?1:2; // The number we will spawn, 1 or 2
	var ind = Math.floor(Math.random()*nf+1); //it will spawn on the ind th free space
	var tmp1=tb, tmp2=db, j=0,i;
	for(i = 0; i<=7; ++i)
	{
		if(!(tmp1&0xf)) j++; // if the last octet of tmp1 = 0
		if(j===ind) 
		{ //We are on the right tile
			return [tb | nb << i*4,db];
		}
		tmp1 >>= 4; // get rid of last octet
	}
	for(i = 8; i<=15; ++i)
	{
		if(!(tmp2&0xf)) j++; // if the last octet of tmp2 = 0
		if(j===ind) 
		{ //We are on the right tile
			return [tb,db | nb << i*4];
		}
		tmp2 >>= 4; // get rid of last octet
	}
	return [tb,td];
}

function isLeg(tb,db,ntb,ndb) //is the move legit
{

	return (ntb^tb | ndb^db) !== 0;

}

function rset()
{
	tb = 0x00000000;
	db = 0x00000000;
	var m = fspawn(tb,db);
	m = fspawn(m[0],m[1]);
	return m;
}

function scoreBoard(tb,db)
{
	return score[Row1(tb)]
		+score[Row2(tb)]
		+score[Row1(db)]
		+score[Row2(db)]
		+score[Col1(tb,db)]
		+score[Col2(tb,db)]
		+score[Col3(tb,db)]
		+score[Col4(tb,db)];
}

var hits=0;
var pos = 0;
var cacheLimit = 5;
function scoreMove(tb,db,depth,prob) //return score of a config, calculates by moving in every direcvtion and calling scoreSpawn
{
	if(!depth) {pos++; return scoreBoard(tb,db);}
	if(depth<=cacheLimit)
	{
		if(transTable[tb])
		{
			if(transTable[tb][db])
			{
				hits++;
				return transTable[tb][db];
			}
		}
	}
	if(prob < 0.0001) return scoreBoard(tb,db);
	var tmp, dir,curr = 0,best = 0;
	for(dir = 0; dir<4; ++dir) //try each direction
	{
		tmp = mov(tb,db,dir);
		if(tmp) // if move is legit
		{
			curr = scoreSpawnExp(tmp[0],tmp[1],depth-1,prob);
			if(curr > best) best = curr;
		}
	}
	if(depth<=cacheLimit)
	{
		if(!transTable[tb]) transTable[tb] = [];
		transTable[tb][db] = best;
	}
	return best;
}

function scoreSpawn(tb,db,depth,prob) //return score of a config, calculates by spawning every possibility and calling scoreMove
{
	var ind,tmp1=tb,tmp2=db,curr=0,worst=Infinity;
	for(ind = 0; ind<8; ++ind)
	{
		if(!(tmp1&0xf)) //if current last nb = 0
		{
			curr=scoreMove(tb|0x1<<4*ind,db,depth,prob*0.9); //spawn a 1
			if(curr < worst) worst = curr;
			curr=scoreMove(tb|0x2<<4*ind,db,depth,prob*0.1); //spawn a 2
			if(curr < worst) worst = curr;
		}
		tmp1 >>= 4;
	}
	for(ind = 8; ind<16; ++ind)
	{
		if(!(tmp2&0xf)) //if current last nb = 0
		{
			curr=scoreMove(tb,db|0x1<<4*ind,depth,prob*0.9); //spawn a 1
			if(curr < worst) worst = curr;
			curr=scoreMove(tb,db|0x2<<4*ind,depth,prob*0.1); //spawn a 2
			if(curr < worst) worst = curr;
		}
		tmp2 >>= 4;
	}
	return worst;
}

function scoreSpawnExp(tb,db,depth,prob) //return score of a config, calculates by spawning every possibility and calling scoreMove
{
	var ind,tmp1=tb,tmp2=db,curr=0,worst=Infinity;
	for(ind = 0; ind<8; ++ind)
	{
		if(!(tmp1&0xf)) //if current last nb = 0
		{
			curr+=scoreMove(tb|0x1<<4*ind,db,depth,prob*0.9)*0.9; //spawn a 1
			curr+=scoreMove(tb|0x2<<4*ind,db,depth,prob*0.1)*0.1; //spawn a 2
		}
		tmp1 >>= 4;
	}
	for(ind = 8; ind<16; ++ind)
	{
		if(!(tmp2&0xf)) //if current last nb = 0
		{
			curr+=scoreMove(tb,db|0x1<<4*ind,depth,prob*0.9)*0.9; //spawn a 1
			curr+=scoreMove(tb,db|0x2<<4*ind,depth,prob*0.1)*0.1; //spawn a 2
		}
		tmp2 >>= 4;
	}
	return curr/nFree(tb,db);
}
var moves = 0;
function findBestMove(tb,db,depth)
{
	var tmp, dir, curr=0, best=0, bestMove = 0;
	if(depth<0) depth =0;
	if(hits>10000000) {hits = 0; transTable = [];}
	for(dir = 0; dir<4; ++dir)
	{
		tmp = mov(tb,db,dir);
		if(tmp)
		{
			curr = scoreSpawnExp(tmp[0],tmp[1],depth,1);
			if(curr > best)
			{
				best = curr;
				bestMove = dir;
			}
		}
	}
	moves++;
	return bestMove;
}

function fastSolver(tb,db,depth)
{
	var timeout = 0;
	var maxSteps = 20000;
	var m = fastSolverRecursif(tb,db,depth,timeout,maxSteps);
	return m;
}

function fastSolverRecursif(tb,db,depth,timeout,maxSteps){
	return setTimeout(function(){
		disp(tb,db);
		if(!maxSteps) return [tb,db];
		var dir = findBestMove(tb,db,setDepthSlow(nFree(tb,db)));
		var m = mov(tb,db,dir);
		if(m)
		{
			m=fspawn(m[0],m[1]);
			fastSolverRecursif(m[0],m[1],depth,timeout,maxSteps-1)
		}
		else return [tb,db];
	},timeout);
}

function setDepth(nf)
{
	switch(nf)
	{
		case 0:
		return 6;
		break;
		case 1:
		return 5;
		break;
		case 2:
		return 4;
		break;
		case 3:
		return 4;
		break;
		case 4:
		return 3;
		break;
		case 5:
		return 3;
		break;
		case 6:
		return 3;
		break;
		case 7:
		return 3;
		break;
		case 8:
		return 2;
		break;
		case 9:
		return 2;
		break;
		case 10:
		return 2;
		break;
		case 11:
		return 2;
		break;
		case 12:
		return 1;
		break;
		case 13:
		return 1;
		break;
		case 14:
		return 1;
		break;
		case 15:
		return 1;
		break;
		case 16:
		return 1;
		break;
		default:
		return 2;
		break;
	}
}

function setDepthFast(nf)
{
	switch(nf)
	{
		case 0:
		return 6;
		break;
		case 1:
		return 4;
		break;
		case 2:
		return 4;
		break;
		case 3:
		return 4;
		break;
		case 4:
		return 4;
		break;
		case 5:
		return 4;
		break;
		case 6:
		return 3;
		break;
		case 7:
		return 3;
		break;
		case 8:
		return 3;
		break;
		case 9:
		return 3;
		break;
		case 10:
		return 2;
		break;
		case 11:
		return 2;
		break;
		case 12:
		return 2;
		break;
		case 13:
		return 2;
		break;
		case 14:
		return 2;
		break;
		case 15:
		return 2;
		break;
		case 16:
		return 2;
		break;
		default:
		return 2;
		break;
	}
}

function setDepthSlow(nf)
{
	switch(nf)
	{
		case 0:
		return 6;
		break;
		case 1:
		return 5;
		break;
		case 2:
		return 5;
		break;
		case 3:
		return 4;
		break;
		case 4:
		return 4;
		break;
		case 5:
		return 4;
		break;
		case 6:
		return 3;
		break;
		case 7:
		return 3;
		break;
		case 8:
		return 3;
		break;
		case 9:
		return 3;
		break;
		case 10:
		return 3;
		break;
		case 11:
		return 3;
		break;
		case 12:
		return 3;
		break;
		case 13:
		return 3;
		break;
		case 14:
		return 2;
		break;
		case 15:
		return 2;
		break;
		case 16:
		return 2;
		break;
		default:
		return 3;
		break;
	}
}

var tmp = 2,i;
var tbTest = 0x10302020,ntb;
var dbTest = 0x10302020,ndb;
var nArray;
// console.time('New function');
// for(i=0; i<1000000; ++i)
// {
// 	ntb = hmoveLeft(tbTest);
// 	ndb = hmoveLeft(dbTest);
// }
// console.timeEnd('New function');
// console.time('Old function');
// for(i=0; i<1000000; ++i)
// {
// 	nArray = moveLeft(tbTest,dbTest);
// }
// console.timeEnd('Old function');

// console.time('step');
// findBestMove(tbTest,dbTest,2);
// console.timeEnd('step');


var m = rset();
var tboard=m[0];
var dboard=m[1];

// var tboard = 0xb876439a;
// var dboard = 0x21212354;

disp(tboard,dboard);

initTables();

$('button[name=fup]').click(function(){
	var m = mov(tboard,dboard,1);
	if(m)
	{
		m = fspawn(m[0],m[1]);
		tboard=m[0];
		dboard=m[1];
	}
	disp(tboard,dboard);
});
$('button[name=fdown]').click(function(){
	var m = mov(tboard,dboard,3);
	if(m)
	{
		m = fspawn(m[0],m[1]);
		tboard=m[0];
		dboard=m[1];
	}
	disp(tboard,dboard);
});
$('button[name=fleft]').click(function(){
	var m = mov(tboard,dboard,0);
	if(m)
	{
		m = fspawn(m[0],m[1]);
		tboard=m[0];
		dboard=m[1];
	}
	disp(tboard,dboard);
});
$('button[name=fright]').click(function(){
	var m = mov(tboard,dboard,2);
	if(m)
	{
		m = fspawn(m[0],m[1]);
		tboard=m[0];
		dboard=m[1];
	}
	disp(tboard,dboard);
});

$('button[name=fsolve]').click(function(){
	var m = fastSolver(tboard,dboard,2);
	disp(m[0],m[1]);
});

$('button[name=freset]').click(function(){
	var m = rset();
	tboard=m[0];
	dboard=m[1];
	disp(tboard,dboard);
});