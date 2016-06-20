SdwEvents = {
    DATA_REFRESH: 'sdw-table-refresh',	// tableau des series rafraichi
    DATA_LOADING_START: 'sdw-data-loading-start',	// chargement des donnees commence
    DATA_LOADING_DONE: 'sdw-data-loading-done',	// chargement des donnees termine
    SERIES_FOLLOWED: 'sdw-series-followed',	// series followed status changed
    COMMON_DIMENSIONS_LOADED: 'sdw-common-dimensions-loader',	// common dimensions loaded
    INITIALIZE_CHART: 'sdw-initialize-chart'	// series followed status changed
};

SdwPage = {
    PAGE_SELECTOR: 'browseSelection',
    PAGE_CHART: 'browseChart',
    PAGE_TABLE: 'browseTable',
    PAGE_INFO: 'browseExplanation'
};

SdwRegex = {
    CONTAINS_IE: "MSIE ([0-9]{1,}[\.0-9]{0,})",
    IS_SERIES_KEY: "([a-zA-Z0-9%_\\?\\^]+\\.)+[a-zA-Z0-9%_\\?\\^]+\\.?"
};

/**
 * Function formating a number.
 * @param number The number to format.
 * @param decimalSeparator The decimal separator. If not set, defaults to '.'.
 * @param thousandsSeparator The thousands separator. If not set, no thousands separator will be used.
 * @return String
 */
function formatNumber(number, decimalSeparator, thousandsSeparator) {
  var sNumber = new String(number);

  var splitNumber = sNumber.split('.');
  var entirePart = splitNumber[0];
  var decimalPart = splitNumber.length > 1
  ? splitNumber[1]
  : null;

  // formating the entire part
  if (typeof thousandsSeparator != 'undefined') {
    var newEntirePart = [];
    $.each(entirePart.split("").reverse(), function(index, elt) {
      if (index > 0 && index % 3 == 0) {
        newEntirePart.push(thousandsSeparator);
      }
      newEntirePart.push(elt);
    });

    entirePart = newEntirePart.reverse().join('');
  }

  var result = [entirePart];

  // adding, if necessary, the decimal part
  if (typeof decimalSeparator == 'undefined') {
    decimalSeparator = '.';
  }
  if (decimalPart != null) {
    result.push(decimalSeparator);
    result.push(decimalPart);
  }

  return result.join('');
}

var SeriesComparator = function( params ) {

  var orderedSeriesKeyList = params.orderedSeriesKeyList;
  var sortingDimension = params.sortingDimension;
  var sortingOrder = params.sortingOrder;
  var keyFamilyCount = params.keyFamilyCount;
  var datasets = params.datasets;
  var selectedSeries = params.selectedSeries;

 
 
 var compareStrings = function(left, right) {
    if (left === undefined || left === null) {
      return (right === undefined || right === null) ? 0 : -1;
    } else {
//			formattedLeft = SdwFormat.removeDiacritics( left );
//			formattedRight = SdwFormat.removeDiacritics( right );
      return (right === undefined || right === null) ? 1 : left.localeCompare( right ) ;
    }
  };
  
  var compareStatus = function(left, right) {
    if (left === undefined || left === null) {
      return (right === undefined || right === null) ? 0 : 1;
    } else if (right === undefined || right === null) {
      return -1;
    } else if (left.expired || left.stopped) {
      return (left) ? 1 : 0;
    } else if (right.expired || right.stopped) {
      return (right) ? -1 : 0;
    } else {
      return 0;
    }
  };

  var compareBooleans = function( left, right ) {
    if (left === undefined || left === null) {
      return (right === undefined || right === null) ? 0 : 1;
    } else if (right === undefined || right === null) {
      return -1;
    } else if (left) {
      return (right) ? 0 : -1;
    } else {
      return (right) ? 1 : 0;
    }
  };

  var compareNumbers = function ( left, right ) {
    if (left === undefined || left === null) {
      return (right === undefined || right === null) ? 0 : 1;
    } else if (right === undefined || right === null) {
      return -1;
    } else if (left < right) {
      return -1;
    } else if (left > right) {
      return 1;
    } else {
      return 0;
    }
  };

  var getPosition = function(series) {
    for (var i = 0; i < orderedSeriesKeyList.length; i++) {
      var skPattern = orderedSeriesKeyList[i];

      var pattern = skPattern
      .replace(/\./g, '\\.')
      .replace(/\%/g, '[A-Z0-9_]+');

      var regex = new RegExp(pattern);

      if (regex.test(series.seriesKey.toUpperCase())) {
        return i;
      }
    }

    return null;
  };

  return function( left, right ) {
    var compare = 0;

    var customSorting = sortingDimension && sortingDimension.indexOf('~') > -1;

    if (customSorting) {
      var kfId = sortingDimension.split('~')[0];
      var dimension = sortingDimension.split('~')[1];

      var lKf = datasets[left.datasetName].keyFamily;
      var rKf = datasets[right.datasetName].keyFamily;

      // different KF
      if (lKf.id !== rKf.id) {
        if (lKf.id == kfId && rKf.id != kfId) {
          compare = -1;
        } else if (lKf.id != kfId && rKf.id == kfId) {
          compare = 1;
        } else if (lKf.id != kfId && rKf.id != kfId) {
          compare = compareStrings( lKf.description, rKf.description );
        }

        // same KF
      } else {
        if (lKf.id == kfId) {
          var dimIndex = null;
          for (var i = 0; i < lKf.dimensions.length; i++) {
            var dim = lKf.dimensions[i];
            if (dim.key === dimension) {
              dimIndex = i;
              break;
            }
          }

          if (dimIndex !== null) {
            compare = compareStrings(left.dimensions[i], right.dimensions[i]);
          }
        }
      }
    }

    if (compare === 0) {
        compare = compareBooleans( left.selected, right.selected );
      }

    if (compare === 0) {
      compare = compareBooleans( left.reference, right.reference );
    }
    if (compare === 0){
      compare = compareStatus (left.status, right.status);
    }
    /*if (compare === 0) {
          compare = compareStrings( left.seriesKey, right.seriesKey );
        }*/
    if (compare === 0 && orderedSeriesKeyList && orderedSeriesKeyList.length > 0) {
      var posLeft = getPosition(left);
      var posRight = getPosition(right);

      compare = compareNumbers( posLeft, posRight );
    }
    // TODO remonter l'info ?
//		if (compare === 0) {
//		compare = compareBooleans( left.isPublished(), right.isPublished() );
//		}

    // TODO remonter l'info ?
//		if (compare === 0) {
//		var nbOfPublicationsLeft = left.nbOfPublications();
//		var nbOfPublicationsRight = right.nbOfPublications();

//		compare = compareNumbers( nbOfPublicationsLeft, nbOfPublicationsRight );
//		}

    // TODO a determiner
//		if (compare === 0) {
//		compare = compareStrings( left.displayedTitle, right.displayedTitle );
//		if (keyFamilyCount === 1) {
//		compare = compareStrings( left.getShortTitle(), right.getShortTitle() );
//		} else {
//		compare = compareStrings( left.displayedTitle(), right.displayedTitle() );
//		}
//		}


    // TODO remonter l'info ?
//		if (compare === 0) {
//		compare = compareBooleans( right.isRestricted(), left.isRestricted() );
//		}

    if (compare === 0) {
        compare = compareNumbers( left.datasetinstanceId, right.datasetinstanceId );
      }


    return compare;
  };
};

//Clone the object (do not clone an objet with a cyclable reference, it would cause a stack overflow)
function clone(obj) {
  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

function find(list, condition) {
  for (var i = 0; i < list.length; i++) {
    var elt = list[i];

    if (condition(elt)) {
      return elt;
    }
  }

  return null;
}

function setLoadAnimation(element) {
  if ($(element).find('.loading').length > 0) return;

  $(element).append('<div class="loading"><img src="img/ajax-loader-bdf-2.gif" /></div>');
}
function removeLoadAnimation(element) {
  $(element).find('.loading').remove();
}


var isMultipleFreq = function isMultipleFreq(seriesKeyList){
  var dimAlreadyThere = undefined;
  var i = SdwLoader.seriesDetailedList.length-1;
  for(; i>=0; i--){
    if($.inArray(SdwLoader.seriesDetailedList[i].seriesKey, seriesKeyList)!=-1){
      for(var dim in SdwLoader.seriesDetailedList[i].dimensionsValues[0]){
        if(dimAlreadyThere && dimAlreadyThere!=dim){
          return true;
        }
        dimAlreadyThere=dim;
      }
    }
  }
  return false;
};

if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }
    return keys;
  };
}

function getInternetExplorerVersion() {

  var rv = -1; // Return value assumes failure.

  if (navigator.appName == 'Microsoft Internet Explorer') {

    var ua = navigator.userAgent;

    var re = new RegExp(SdwRegex.CONTAINS_IE);

    if (re.exec(ua) != null)

      rv = parseFloat(RegExp.$1);

  }

  return rv;

}