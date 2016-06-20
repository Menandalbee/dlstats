 var filterSizeArray = [];
 var bigSize = 14;

 function grow(id, maxValue) {
	filterSizeArray[id] = document.getElementById("filter"+id).size;
	document.getElementById("filter"+id).size = Math.min(bigSize, maxValue);
}

function shrink(id) {
	document.getElementById("filter"+id).size = filterSizeArray[id];
}