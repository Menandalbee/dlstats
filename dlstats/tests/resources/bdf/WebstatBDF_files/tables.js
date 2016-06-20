/*****************/
/* CONFIGURATION */
/*****************/

// Number of links representing pages
$.fn.dataTableExt.oPagination.iFullNumbersShowPages = 9;
$.fn.dataTableExt.aTypes.unshift( function (s) {
	if(s.length == 10 && s.match(/^\d{2}(-|\/)\d{2}(-|\/)\d{4}$/) != null) {
		return 'sdwDate';
	}
	return null;
} );
$.fn.dataTableExt.oSort['sdwDate-asc'] = function(x,y) {
	var re = /-|\//;
	xs = x.split(re), ys = y.split(re);
	if(xs[2] > ys[2]) return 1;
	if(xs[2] < ys[2]) return -1;
	if(xs[1] > ys[1]) return 1;
	if(xs[1] < ys[1]) return -1;
	if(xs[0] > ys[0]) return 1;
	if(xs[0] < ys[0]) return -1;
	return 0;
};
$.fn.dataTableExt.oSort['sdwDate-desc'] = function(x,y) {
	var re = /-|\//;
	xs = x.split(re), ys = y.split(re);
	if(xs[2] > ys[2]) return -1;
	if(xs[2] < ys[2]) return 1;
	if(xs[1] > ys[1]) return -1;
	if(xs[1] < ys[1]) return 1;
	if(xs[0] > ys[0]) return -1;
	if(xs[0] < ys[0]) return 1;
	return 0;
};
/*************/
/* FUNCTIONS */
/*************/

function activatePlaceHolder(input) {
	/* PLACEHOLDERS */
	function checkField(t, n){
		if($.trim(t.val()) == ''){
			n.show();
		}else{
			n.hide();
		}
	}

	var label = input.next('.placeholder');
	input.on('focus blur keyup', function(e){
		checkField(input, label);
	});
	label.on('click', function(e){
		input.trigger('focus');
	});
}

/**
 * Makes a <table> paginable.
 * @param element this is a jquery element.
 */
function makePaginable(element, sortable, drawCallback, pInitCompleteCallback, aaSorting, planCalendar) {
	var drawCallback = drawCallback || function(){};
	var initCompleteCallback = initCompleteCallback || function(){};
	var initCompleteCallback = function(oSettings, json) {
		var label = element.parent().find('.dataTables_filter>label');
		var input = label.find('input');
		label.before(input);
		input.attr('id', element.attr('id') + '_filterInput');
		label.attr('for', element.attr('id') + '_filterInput');
		label.css('margin-right', 16);
		label.addClass('placeholder');
		label.parent().addClass('placeholding');

		activatePlaceHolder(input);
		label.parent().on('click', 'img', function() {
			label.show();
		});

		if (pInitCompleteCallback) pInitCompleteCallback(oSettings, json);
	};
	var lSortable = sortable == undefined
			? false
			: sortable;
	var aaSorting = aaSorting || [[0,'asc']];
	var myColumnDefs;
	if( planCalendar != undefined ){
		myColumnDefs = [{ bSortable: false, aTargets: [ -1 ] }];
	}

	element.dataTable({
		oLanguage: {
			sUrl: "jsp/dataTables.locale.txt"
		},
		fnInitComplete: initCompleteCallback,
		fnDrawCallback: drawCallback,
		sPaginationType: "full_numbers",
		bStateSave: false,
		bAutoWidth: false,
		bSort: lSortable,
		aaSorting: aaSorting,
		aoColumnDefs: myColumnDefs,
		sDom: '<"top"plf><"clear">t<"bottom"i><"clear">'	// [PAGINATION]   [FILTRE]
															// [--------TABLE--------]
															// [LISTE]      [COMPTEUR]
	});
}
