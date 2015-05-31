
test('getNfree()', function() {
	var matrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    equal(getNfree(matrix),16,"16 free spaces");
    matrix = [0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0];
    equal(getNfree(matrix),14,"14 free spaces");
    matrix = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
    equal(getNfree(matrix),0,"0 free spaces");
    matrix = [];
    equal(getNfree(matrix),0,"0 free spaces");
});

test('spawn()',function(){
	var matrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	var expected = [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	deepEqual(spawn(matrix,1,2),expected,"Spawned 2 on first place");
	matrix = [5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0];
	ok(spawn(matrix)[15]!==0,"Spawned number on empty place");
});

test('arrayEquals()',function(){
	var a=[2,5,8,9];
	var b=[2,5,8,9];
	ok(arrayEquals(a,b),"Array are equal");
	b=[3,5,8,9];
	ok(!arrayEquals(a,b),"Array are different");
});

test('isLegalMove()',function(){
	var matrix = [8, 4, 2, 0, 2, 8, 2, 0, 2, 4, 2, 0, 4, 2, 4, 0];
	ok(!isLegalMove(matrix,0),"left is not a legal move");
	ok(isLegalMove(matrix,1),"up is a legal move");
	ok(isLegalMove(matrix,2),"right is a legal move");
	ok(isLegalMove(matrix,3),"down is a legal move");
});