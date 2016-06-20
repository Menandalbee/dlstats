var SdwUrl = (function() {
	var parameters = parseParameters();
	var typePage = "";

	function parseParameters() {
		var lParameters = {};
		var url = window.location.href;

		var definitions = url
			.slice( url.indexOf('?') + 1 )
			.split('&');

		for (var i = 0; i < definitions.length; i++) {
			var parts = definitions[i].split('=');
			var name = parts[0];
			var value = parts[1];

			var values = lParameters[name];
			if (!values) {
				values = [];
				lParameters[name] = values;
			}

			values.push(value);
		}

		return lParameters;
	};

	return {
		getParameters: function(name, dynamic) {
			var lParameters;
			if (dynamic) {
				lParameters = parseParameters();
			} else {
				lParameters = parameters;
			}

			return lParameters[name];
		},
		getParameter: function(name, dynamic) {
			var params = this.getParameters(name, dynamic);
			return params ? params[0] : undefined;
		},
		setTypePage: function(data){
			switch(data) {
			    case 0:
			    	typePage = SdwPage.PAGE_SELECTOR;
			        break;
			    case 1:
			    	typePage = SdwPage.PAGE_CHART;
			        break;
			    case 2:
			    	typePage = SdwPage.PAGE_TABLE;
			        break;
			    case 3:
			    	typePage = SdwPage.PAGE_INFO;
			        break;
			    default:
			    	typePage = "";
			} 
		},
		getTypePage: function(){
			return typePage;
		}
	};
})();