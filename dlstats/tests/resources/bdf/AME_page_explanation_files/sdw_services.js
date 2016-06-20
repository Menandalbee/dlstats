var SdwServices = (function() {
	function call(params) {
		var lParams = $.extend({
			type: 'GET',
			traditional: true,
			data: {},
			dataType: 'json',
			beforeSend: null
		}, params);

		return $.ajax(lParams);
	}

	return {
		series: function(data) {
			return call({
				url: 'api/series',
				data: data
			});
		},
		seriesMetadata: function(seriesKey) {
			return call({
				url: 'api/seriesMetadata/' + seriesKey
			});
		},
		dataset: function(datasetName) {
			return call({
				url: 'api/dataset/' + datasetName
			});
		},
		datasets: function(datasetNames) {
			return call({
				url: 'api/dataset',
				data: {
					name: datasetNames
				}
			});
		},
		dimension: function(keyfamilyName, dimension, codes) {
			return call({
				url: 'api/dimension/' + keyfamilyName + '/' + dimension,
				data: {
					code: codes
				}
			});
		},
		node: function(id) {
			return call({
				url: 'api/node/' + id
			});
		},
		nodeObservations: function(node) {
			return call({
				url: 'api/nodeObservations',
				data: {
					node: node
				}
			});
		},
		observations: function(seriesKey) {
			return call({
				url: 'api/observation/'+seriesKey
			});
		}
	};
})();
