/*
 * params: string,string, int
*/
function callPndo(vElement_id, button_id, boxHeight) {
	var vElement = document.getElementById(vElement_id);
	var button = document.getElementById(button_id);
	pndo(vElement, button,boxHeight);
}

var posx;
var posy;
function getMousePosition(e) {
	posx = 0;
	posy = 0;
	var ev = (!e) ? window.event : e;// IE:Moz
	if (ev.clientX) {// IE
		posx = ev.clientX + document.body.scrollLeft;
		posy = ev.clientY + document.body.scrollTop;
	}
	else if (ev.pageX) {// Moz
		posx = ev.pageX + window.pageXOffset;
		posy = ev.pageY + window.pageYOffset;
	} else {
		return false
	}//old browsers
	return true;
}

function toggleExportOptions(vElement_id, event, isQuickviewPage) {
	getMousePosition(event);
	var vElement = document.getElementById(vElement_id);
	if (isQuickviewPage == true) {
		posy = posy + 10;
		vElement.style.left =(posx - 150)+'px';
		vElement.style.width = '150px';
	} else {
		posy = posy - 65;
	}
	vElement.style.top =(posy)+'px';
	vElement.style.zIndex="1";

	if (vElement.style.height=="auto") {
		vElement.style.height=( 0+"em");
		vElement.style.display="none";
	} else {
		vElement.style.display="block";
		vElement.style.height="auto";
	}
}

// toggles the visibility of the element with the specified id
// the optional caller element sepcifies an img element, whose src will be set to the
// relevant image for the current state
function toggleElementVisibility(elementId, caller) {
    var element = document.getElementById(elementId);
    var isVisible = (element.style.display != 'block') && (element.style.display != '');
    element.style.display = isVisible ? 'block' : 'none';
    if (caller != null) {
        caller.src = isVisible ? 'img/icon_hide.gif' : 'img/icon_show.gif';
    }
    return isVisible;
}

function pndo(sDiv, button, boxHeight) {
	if (sDiv.style.height=="auto") {
		sDiv.style.height=( boxHeight+"em");
		sDiv.style.overflow="hidden";
		sDiv.title = "Click on the text to show the whole item.";
		button.src = "img/Agrandir_16_0.png";
		button.alt = "Show all";
	    button.title = "Show all";
	} else {
		if (sDiv.offsetHeight < (sDiv.scrollHeight-10))	{
			sDiv.style.height="auto";
			sDiv.style.overflow="visible";
		} else {
			sDiv.style.height="auto";
			sDiv.style.overflow="visible";
		}
		sDiv.title = "Click on the text to hide this item.";
		button.src = "img/Reduire_16_0.png";
		button.alt = "Hide all";
	    button.title = "Hide all";
	}
}

/*
 * Same as toggleElementVisibility, but with arrow icons
 */
function toggleElementVisibility2(elementId, caller) {
    var element = document.getElementById(elementId);
    var isVisible = (element.style.display != 'block') && (element.style.display != '');
    element.style.display = isVisible ? 'block' : 'none';
    if (caller != null) {
        caller.src = isVisible ? 'img/TriangleBasNoir.png' : 'img/TriangleDroiteNoir.png';
    }
    return isVisible;
}

function toggleElementVisibilityAndText(elementId, caller, visibleTxt, invisibleTxt) {
	if(toggleElementVisibility(elementId, caller)){
		caller.setAttribute('alt', invisibleTxt);
	}else{
		caller.setAttribute('alt', visibleTxt);
	}
}

/*
 * Same as toggleElementVisibilityAndText, but with arrow icons
 */
function toggleElementVisibilityAndText2(elementId, caller, visibleTxt, invisibleTxt) {
	if(toggleElementVisibility2(elementId, caller)){
		caller.setAttribute('alt', invisibleTxt);
	}else{
		caller.setAttribute('alt', visibleTxt);
	}
}

function moreOption(selectElementId, numberOfElement) {
	var element = document.getElementById(selectElementId);
	var hiddenParameter = document.getElementsByName('s'+selectElementId);
	hiddenParameter = hiddenParameter.namedItem('s'+selectElementId);
	if (element.size  < numberOfElement + 1) {
		element.size = element.size + 2;
		hiddenParameter.value = element.size;
	}
	showHideButtons(selectElementId, numberOfElement);
}

function lessOption(selectElementId, numberOfElement) {
	var element = document.getElementById(selectElementId);
	var hiddenParameter = document.getElementsByName('s'+selectElementId);
	hiddenParameter = hiddenParameter.namedItem('s'+selectElementId);
	if (element.size > Math.min(numberOfElement + 1, 4)) {
		element.size = element.size - 2;
		hiddenParameter.value = element.size;
	}
	showHideButtons(selectElementId, numberOfElement);
}

function showHideButtons(selectElementId, numberOfElement) {
	var element = document.getElementById(selectElementId);
	var buttonLess = document.getElementsByName('bL'+selectElementId).namedItem('bL'+selectElementId);
	if (buttonLess != null && element.size <= 3) {
		buttonLess.style.display = 'none';
	} else if(buttonLess != null){
		buttonLess.style.display = 'block';
	}

	var buttonMore = document.getElementsByName('bM'+selectElementId).namedItem('bM'+selectElementId);;
	if (element.size  < numberOfElement + 1) {
		buttonMore.style.display = 'block';
	} else {
		buttonMore.style.display = 'none';
	}
}


