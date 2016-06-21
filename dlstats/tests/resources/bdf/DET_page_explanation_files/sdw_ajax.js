var AJAX_MESSAGES;

//general memory
var tr,
  serie,
  group,
  groupHTML,
  errorMessage,
  query,
  params,
  node,
  selectedSeries,
  dataset;

var CHARACTERS = {
    'ARROW_RIGHT': '&#9658;',
    'ARROW_BOTTOM': '&#9660;'
};

var miniSearchField;

function initializeAjax(messages) {
  AJAX_MESSAGES = messages;

  errorMessage = AJAX_MESSAGES['js.error.unexpectedError'];
  query = window.location.search;
  params = {};
  selectedSeries = [];
  dataset = [];

  miniSearchField = $( "#quicksearchbox" );

  window.onerror = function(){
    unwait();
    showError(AJAX_MESSAGES['js.error.reload']);
  };

  initiateTooltip();
  getNodeAndSelectedSeries();

  // ajax loader
    // we append the modal box (id=loading) and the small rotating icon "ajax-loader.gif" and we hide them at page load.
    // we also calculate the icon's position.
    $('<div id="loading"><img src="img/ajax-loader-bdf-2.gif" alt="loading" /></div>').appendTo('body').css({
      'display':'none'
    });
    $('#loading img').css({
      'position':'fixed',
      'left':$(window).width()/2 - 16,
      'top':$(window).height()/2 - 16
    });

  // ajax setup (common configuration for all ajax request)
    $.ajaxSetup({
      'dataType': 'json', // force return as json
      'type': 'POST', // force POST data
      'complete': function(jqXHR, textStatus){ unwait(); initiateTooltip(); }, // no more modal box once ajax request is complete
      'beforeSend': function(jqXHR, settings){ wait(); }, // modal box activated before ajax request is sent
      'error': function(){ showMessage(AJAX_MESSAGES['js.error.unexpectedError']);}, // in case of error...
      'traditional': true
    });

    // adding autocomplete the search field
  autoComplete([miniSearchField]);

  // Dialog when searching
  var searchDialog = $('#searchDialog');
  $('#searchDialog').css({"overflow":"hidden","min-Width":"250px","max-Width":"1500px"}); // Rajout permettant l'auto gestion du width de la pop-up dialog

  searchDialog.dialog({
        autoOpen: false,
        width: 'auto',
        resizable: false,
        modal: true,
        title: AJAX_MESSAGES['search.dialog.title'],
        closeOnEscape: false,
        open: function(event, ui) {
        $(".ui-dialog-titlebar-close").hide();
        $('#mySearchParam').append($('#quicksearchbox').val());
        }
  });
  searchDialog.dialog('close');

  $('#searchButton').on('click',function(e){
    e.preventDefault();
    $(this).blur();
    if(window.isFocused){
      $('#quicksearch').submit();
    }
  });

  // prevent launching a search if there is no query
  $("#quicksearch").submit(function() {
    var query = $.trim(miniSearchField.val());
    if (query) {
      setTimeout(function() {searchDialog.dialog('open');}, 500);
      return true;
    }

    return false;
  });

  // click on notification's cross will close the notification.
    // actually, we remove it slowly and we delete its content afterward.
    $('#test').on('click', 'a.closeButton', function(e){
      e.preventDefault();
      $('#test').fadeOut('slow', function(){$(this).html('');});
    });

    // we make any notification or error panel draggable !
    $('#test').draggable();

  // Modified pop() function to return the current array instead of the poped element
    Array.prototype.SdwPop = function(){
      if(this.length > 1){
        var lastElem = this.length - 1;
        this.pop(lastElem);
      }
      return this;
    };

    // This div is intended to get the data structure explanation when needed.
    if ($('#series-dialog').length == 0) {
      $('body').append('<div id="series-dialog" style="display:none;" title=""></div>');
    }

    /*
     * Display data structure explanation
     * when clicking on series keys.
     */
    enableSeriesKeyClick();

 // new version of select[name=trans]
     var selectTrans = $('#parametersAndTransformations.highchartsVersion select[name=trans]');
     selectTrans.hide();
     var transList = '';
     selectTrans.children('option').each(function() {
       var selectedClass = $(this).is(':selected')
           ? 'class="selected"'
           : '';
       transList = transList +
         '<li data-value="' + $(this).val() + '" ' + selectedClass + '>' +
           '<a href="#">' +
             $(this).text() +
           '</a>' +
         '</li>';
     });
     selectTrans.after('<ul id="newTrans" style="display:none;">' + transList + '</ul>');
     $('#newTrans').menu({
    select: function( event, ui ) {
      var value = ui.item.data('value');
      selectTrans.val(value).change();
    }
  });

  $('body').on('click', '#toggleTrans', function(e) {
    var options = $('#newTrans');
    e.stopPropagation();
    $('.tipsy').remove();
    if(options.css('display') == 'none'){
      $('html').click();
      options.show();
      addBodyCloseEvent(options);
    }else{
      options.hide();
    }
  });

  $('.toolbar-menu>img').on('click', function(e) {
    e.stopPropagation();
    $('.tipsy').remove();
    var parent = $(this).parents('.toolbar-menu');
    var menu = parent.children('ul');

    if(!parent.hasClass('menu-open')){
      $('html').click();
      parent.addClass('menu-open');
      addBodyCloseEventForToolbarMenu(parent);
    }else{
      parent.removeClass('menu-open');
    }
  });

  var valueSorters = [
         {
           clazz: 'sorting_asc',
             comparator: function(a, b) {
               var aValue = $(a).data('value');
               var bValue = $(b).data('value');

               var aIndex = $(a).data('index');
               var bIndex = $(b).data('index');

               // bound rows have the same index
               // the aim here is to keep the bound column after the original one
               if (aIndex == bIndex) {
                 if ($(a).hasClass('bound')) return 1;
                 return -1;
               }

               if (bValue == '-' && aValue == '-') {
                 return aIndex - bIndex;
               }

        if (bValue == '-' || aValue < bValue) return -1;
        if (aValue == '-' || aValue > bValue) return 1;
        return 0;
             }
         },
         {
             clazz: 'sorting_desc',
             comparator: function(a, b) {
               var aValue = $(a).data('value');
               var bValue = $(b).data('value');

               var aIndex = $(a).data('index');
               var bIndex = $(b).data('index');

               // bound rows have the same index
               // the aim here is to keep the bound column after the original one
               if (aIndex == bIndex) {
                 if ($(a).hasClass('bound')) return 1;
                 return -1;
               }

               if (bValue == '-' && aValue == '-') {
                 return aIndex - bIndex;
               }

        if (bValue == '-' || aValue > bValue) return -1;
        if (aValue == '-' || aValue < bValue) return 1;
        return 0;
             }
         },
         {
           clazz: 'sorting'
         }
  ];
  var valueSortIndex = 0;
  $('.valDes').css("display", "none");
  sortParams = {};

  var sortByValueHeader = function sortByValueHeader(){

    removeParam(filterParams, "sortingOrder");
    removeParam(filterParams, 'concept');
    $('#keyFamilyOrderHeader').remove();
    $('#otherSeries').remove();

    var table = $(this).parents('table');

    var valueSorter = valueSorters[valueSortIndex];
    // Every clic change from ASC to DESC or inverse. The initial order is abandonned
    valueSortIndex = (valueSortIndex + 1) % (valueSorters.length-1);

    var rows = table.find('tbody tr');
    rows.sortElements(valueSorter.comparator);
    rows.removeClass('lastReorganized');

    var span = $(this).find(">:first-child");
    $.each(valueSorters, function(index, elt) {
      span.removeClass(elt.clazz);
    });
    span.addClass(valueSorter.clazz);
    addParam(filterParams, "sortingOrder", valueSorter.clazz);

    // Re initialize other column (descriptionHeader)
    var spanDesc = $('#descriptionHeader').find(">:first-child");
    $.each(descriptionSorters, function(index, elt) {
      spanDesc.removeClass(elt.clazz);
    });
    spanDesc.addClass('sorting');

    // Update the title in the menu
    if( valueSorter.clazz == "sorting" || valueSorter.clazz == "sorting_desc" ) {

      $('#dataSortTypeLabel').html($('.valDes').html());

      $('.valAsc').css("display", "inline");
      $('.valDes').css("display", "none");

    } else {
      $('#dataSortTypeLabel').html($('.valAsc').html());

      $('.valAsc').css("display", "none");
      $('.valDes').css("display", "inline");
    }

    // Remove the <strong> tag
    var spanStrongSK = $('#descriptionHeader').parent().parent().parent().find(".seriesKey > strong");
    $.each(spanStrongSK, function(){
      $('strong').contents().unwrap();
    });

    resetEvenOdd(table.find('tbody'));
  };


  $('#tableSelectedSeries').on('click', '#valueHeader', sortByValueHeader);
  $('#valueHeader').on('click', sortByValueHeader);

  $('#valueHeader').parents('table').find('tbody tr').each(function(index, elt) {
    $(elt).data('index', index);
    });

  // Description
  var descriptionSorters = [
            {
              clazz: 'sorting_asc',
             comparator: function(a, b) {
                  var aValue = $(a).data('title');
                  var bValue = $(b).data('title');

                  var aIndex = $(a).data('index');
                  var bIndex = $(b).data('index');

                  // bound rows have the same index
                  // the aim here is to keep the bound column after the original one
                  if (aIndex == bIndex) {
                    if ($(a).hasClass('bound')) return 1;
                    return -1;
                  }

             if (aValue < bValue) return -1;
             if (aValue > bValue) return 1;
             return 0;
                }
            },
            {
                clazz: 'sorting_desc',
                comparator: function(a, b) {
                  var aValue = $(a).data('title');
                  var bValue = $(b).data('title');

                  var aIndex = $(a).data('index');
                  var bIndex = $(b).data('index');

                  // bound rows have the same index
                  // the aim here is to keep the bound column after the original one
                  if (aIndex == bIndex) {
                    if ($(a).hasClass('bound')) return 1;
                    return -1;
                  }

             if ( aValue > bValue) return -1;
             if ( aValue < bValue) return 1;
             return 0;
                }
            },
            {
              clazz: 'sorting'
            }
     ];
  var descSortIndex = 0;
  $('.titleDes').css("display", "none");
  $('#tableSelectedSeries').on('click', '#descriptionHeader', function() {

    removeParam(filterParams, "sortingOrder");
    removeParam(filterParams, 'concept');
    $('#keyFamilyOrderHeader').remove();
    $('#otherSeries').remove();

    var table = $(this).parents('table');

    var descSorter = descriptionSorters[descSortIndex];
    // Every clic change from ASC to DESC or inverse. The initial order is abandonned
    descSortIndex = (descSortIndex + 1) % (descriptionSorters.length-1);

    var rows = table.find('tbody tr');
    rows.sortElements(descSorter.comparator);
    rows.removeClass('lastReorganized');

    var span = $(this).find(">:first-child");
    $.each(descriptionSorters, function(index, elt) {
      span.removeClass(elt.clazz);
    });
    span.addClass(descSorter.clazz);
    addParam(filterParams, "sortingOrder", descSorter.clazz);

    // Update the title in the menu
    if( descSorter.clazz == "sorting" || descSorter.clazz == "sorting_desc" ) {
      $('#dataSortTypeLabel').html($('.titleDes').html());

      $('.titleAsc').css("display", "inline");
      $('.titleDes').css("display", "none");
    } else {
      $('#dataSortTypeLabel').html($('.titleAsc').html())

      $('.titleAsc').css("display", "none");
      $('.titleDes').css("display", "inline");
    }
    // Re initialize other column (valueHeader)
    var spanVal = $('#valueHeader').find(">:first-child");
    $.each(descriptionSorters, function(index, elt) {
      spanVal.removeClass(elt.clazz);
    });
    spanVal.addClass('sorting');

    // Remove the <strong> tag
    var spanStrongSK = $('#descriptionHeader').parent().parent().parent().find(".seriesKey > strong");
    $.each(spanStrongSK, function(){
      $('strong').contents().unwrap();
    });

    resetEvenOdd(table.find('tbody'));
  });

  $('#descriptionHeader').parents('table').find('tbody tr').each(function(index, elt) {
    $(elt).data('index', index);
    });
  //jira - 621 : tri par date
  var dateSorters = [
            {
                clazz: 'sorting_desc',
                comparator: function(a, b) {
                  var aValue = $(a).data('date');
                  var bValue = $(b).data('date');

                  var aIndex = $(a).data('index');
                  var bIndex = $(b).data('index');

                  // bound rows have the same index
                  // the aim here is to keep the bound column after the original one
                  if (aIndex == bIndex) {
                    if ($(a).hasClass('bound')) return 1;
                    return -1;
                  }

                  if ( aValue > bValue) return -1;
                  if ( aValue < bValue) return 1;
                  return 0;
                }
            },
                       {
                          clazz: 'sorting_asc',
                          comparator: function(a, b) {
                          var aValue = $(a).data('date');
                          var bValue = $(b).data('date');

                          var aIndex = $(a).data('index');
                          var bIndex = $(b).data('index');

                          // bound rows have the same index
                          // the aim here is to keep the bound column after the original one
                          if (aIndex == bIndex) {
                            if ($(a).hasClass('bound')) return 1;
                            return -1;
                          }

                     if (aValue < bValue) return -1;
                     if (aValue > bValue) return 1;
                     return 0;
                        }
                       },
                     {
                        clazz: 'sorting'
                      }
               ];
               var dateSortIndex = 0;
               $('.dateAsc').css("display", "none");
               sortParams = {};

               var sortByDateHeader = function sortByDateHeader(){

                 removeParam(filterParams, "sortingOrder");
                 removeParam(filterParams, 'concept');
                 $('#keyFamilyOrderHeader').remove();
                 $('#otherSeries').remove();

                 var table = $(this).parents('table');

                 var dateSorter = dateSorters[dateSortIndex];
                 // Every clic change from ASC to DESC or inverse. The initial order is abandonned
                 dateSortIndex = (dateSortIndex + 1) % (dateSorters.length-1);

                 var rows = table.find('tbody tr');
                 rows.sortElements(dateSorter.comparator);
                 rows.removeClass('lastReorganized');

                 var span = $(this).find(">:first-child");
                 $.each(dateSorters, function(index, elt) {
                   span.removeClass(elt.clazz);
                 });
                 span.addClass(dateSorter.clazz);
                 addParam(filterParams, "sortingOrder", dateSorter.clazz);


                 // Update the title in the menu
                 if( dateSorter.clazz == "sorting" || dateSorter.clazz == "sorting_desc" ) {
                $('#dataSortTypeLabel').html($('.dateDes').html());

                $('.dateAsc').css("display", "inline");
                $('.dateDes').css("display", "none");
              } else {
                $('#dataSortTypeLabel').html($('.dateAsc').html())

                $('.dateAsc').css("display", "none");
                $('.dateDes').css("display", "inline");
              }
               // Re initialize other column (valueHeader)
              var spanVal = $('#valueHeader').find(">:first-child");
              $.each(dateSorters, function(index, elt) {
                spanVal.removeClass(elt.clazz);
              });
              spanVal.addClass('sorting');
              var spanVal = $('#descriptionHeader').find(">:first-child");
              $.each(dateSorters, function(index, elt) {
                spanVal.removeClass(elt.clazz);
              });
              spanVal.addClass('sorting');


                 resetEvenOdd(table.find('tbody'));
               };

            $('#tableSelectedSeries').on('click', '#dateHeader', sortByDateHeader);
            $('#dateHeader').on('click', sortByDateHeader);

            $('#dateHeader').parents('table').find('tbody tr').each(function(index, elt) {
              $(elt).data('index', index);
              });

}

function addBodyCloseEvent(elt){
  $('html, body, svg, shape').one('click', function(e){
    elt.hide();
  });
}

function addBodyCloseEventForToolbarMenu(elt){
  $('html, body, svg, shape').one('click', function(e){
    elt.removeClass('menu-open');
  });
}

/*
 * Resets the even/odd classes on given tbody or thead.
 * Any row with the 'bound' class will have the same color
 * than its previous sibling.
 */
function resetEvenOdd(table) {
  table.children('tr:not(.bound):odd').each(function() {
    $(this).removeClass('even').addClass('odd');
    $(this).children('td').removeClass('even').addClass('odd');
  });

  table.children('tr:not(.bound):even').each(function() {
    $(this).removeClass('odd').addClass('even');
    $(this).children('td').removeClass('odd').addClass('even');
  });

  table.children('tr.bound').each(function() {
    var previous = $(this).prev();
    if (previous.hasClass('odd')) {
      $(this).removeClass('even').addClass('odd');
      $(this).children('td').removeClass('even').addClass('odd');
    } else {
      $(this).removeClass('odd').addClass('even');
      $(this).children('td').removeClass('odd').addClass('even');
    }
  });

  // keep reference series' style
  table.children('tr.greeny, tr.reference').each(function() {
    if ($(this).hasClass('even')) {
      $(this).removeClass('even').removeClass('greeny').addClass('reference');
      $(this).children('td').removeClass('even').removeClass('greeny').addClass('reference');
    } else {
      $(this).removeClass('odd').removeClass('reference').addClass('greeny');
      $(this).children('td').removeClass('odd').removeClass('reference').addClass('greeny');
    }
  });
}

/*
 * The seriesId may be of two forms:
 * - {datasetinstanceId}.{seriesKey}
 * - {seriesKey}
 * where {datasetinstanceId} is a number.
 * This method identifies which for the seriesId is
 * and returns the {seriesKey}.
 */
function extractSeriesKey(seriesId) {
  if (!seriesId) return null;

  var regex = /^[0-9]+\./;
  var ids = regex.exec(seriesId);

  if (ids && ids.length > 0) {
    result = seriesId.substr(ids[0].length);
  } else {
    result = seriesId;
  }

  return result;
}

/*
 * Returns an URL for which dynamic parameters has been added.
 * Dynamic parameters are stored in a variable called 'pageDynamicUrlParameters'
 */
function managePageDynamicUrlParameters(url) {
  if (typeof pageDynamicUrlParameters !== 'undefined') {
    $.each(pageDynamicUrlParameters, function(name, getter) {
      var value = getter();
      if (typeof value !== 'undefined') {
        url += '&' + name + '=' + value;
      }
    });
  }

  return url;
};

// Tooltip generation
// That's initialized each page loading and after any ajax request
// We must remove every tooltip before reinitializing them because we can remove element that are attached to them
// For example, series or group removal.
function initiateTooltip(){
  //$('.tipsy').remove();
  $('.tipsyT').tipsy({title: 'alt', gravity:'n', html:true}).removeClass('tipsyT');
  $('.tipsyA').tipsy({title: 'title', gravity:'n', html:true}).removeClass('tipsyA');

  var defaultConf = {
      title: {
        dataName: 'tipsyTitle',
        defaultValue: 'title'
      },
      gravity: {
        dataName: 'tipsyGravity',
        defaultValue: 'n'
      },
      html: {
        dataName: 'tipsyHtml',
        defaultValue: true
      }
  };
  $('.tipsy-custom').each(function() {
    var conf = {};
    for (var propertyName in defaultConf) {
      var property = defaultConf[propertyName];
      var data = $(this).data(property['dataName']);

      var value;
      if (data != undefined) {
        value = data;
      } else {
        value = property['defaultValue'];
      }

      conf[propertyName] = value;
    }

    $(this).tipsy(conf).removeClass('tipsy-custom');
  });

}

//Retrieve params from query
function getNodeAndSelectedSeries(){
    if(query.charAt(0) == '?') query = query.substr(1);
    var tmpparams = query.split('&');
    for(var i = 0, l = tmpparams.length; i < l; i++){
    var tmpparam = tmpparams[i].split('='),
      name = tmpparam[0],
      value = tmpparam[1];
    if(params[name] == undefined){
      params[name] = value;
    }else if(params[name] != undefined && typeof params[name] == 'string'){
      params[name] = [params[name], value];
    }else{
      params[name].push(value);
    }
    }
    node = params.node != undefined ? params.node : '';
    selectedSeries = params.SERIES_KEY != undefined ? params.SERIES_KEY : [];
    dataset = params.DATASET != undefined ? params.DATASET : [];
}

//function showing the loading modal
function wait(){
  $('#loading').css({'height':$(document).height(),'opacity':0, 'display':'block'}).animate({'opacity':1}, 'fast');
}
// function hiding the loading modal
function unwait(){
  $('#loading').animate({'opacity':0}, 'fast', function(){$(this).hide();});
}

//function check the integrity of data
// t = custom type of data (string, int, etc.), d = data
// return boolean
function dataTypeIsOK(d, t){
  if(t == 'stringOrObject'){
    return dataTypeIsOK(d, 'object') || dataTypeIsOK(d, 'string');
  }
  if(t == 'object'){
  return d!=null && typeof d == 'object';
  }
  if(t == 'string'){
    return d!=null && typeof d == 'string';
  }
  if(t == 'int'){
    return parseInt(d, 10) == d;
  }
  if(t == 'empty'){
    return true;
  }
  return false;
}
// function checking if data integrity corresponds to a pattern
// data = data to check (it's a javascript object), check = passed pattern (it's also a javascript object)
// return boolean
function dataIsOK(data, check){
  var retour = true;
  for(i in check){
    if(typeof check[i] == 'object'){
      for(j in check[i]){
        if(!check[i][j] || !dataTypeIsOK(data[i][j], check[i][j]))
          retour = false;
      }
    }else{
      if(!data[i] || !dataTypeIsOK(data[i], check[i]))
        retour = false;
    }
  }
  return retour;
}
// checking json data's integrity with arrayCheck
// if everything is ok, the "f" function will be played.
// @see #dataIsOk()
function checkJSON(data, f, arrayCheck){
  if(!data){
    showError(errorMessage);
  }else{
    if(data && (data.status == 600 || data.status == 500 || data.status == 400)){ // TODO 400 should be special
      showError(data.message);
    }else if(data.status == 300){
      showWarning(data.message);
    }else if(data.status == 200){
      if(dataIsOK(data, arrayCheck)){
        showMessage(data.message);
        f(data);
      }else{

      }
    }else{
      showError(errorMessage);
    }
  }
}
// function launching every ajax request
// url = "ajax/*.do", sentData = data sent (javascript object)
// callback = javascript function, and arrayCheck = pattern check data received integrity
function ajaxRequest(url, sentData, callback, arrayCheck){
  $.ajax({
    'url' : url,
    'data' : sentData,
    'success' : function(data){
      checkJSON(data, callback, arrayCheck);
      initiateTooltip();
    },
    'traditional' : true
  });
}

/*
 * loadIn(element, url, params, [callback])
 * Loads into 'element' (which is a jquery object) html returned by a call to 'url', with the given 'params'.
 * 'callback(responseText, textStatus, XMLHttpRequest)' -- optional -- will be called once this is done.
 */
function loadIn(element, url, params, callback) {
  wait();
  element.load(url, params, function(responseText, textStatus, XMLHttpRequest) {
    if (callback != undefined) {
      callback(responseText, textStatus, XMLHttpRequest);
    }
    unwait();
    initiateTooltip();
  });
}

//We remove the loading icon on the search field
function search_unwait(){
    if(document.getElementById("quicksearchbox")){
      $('#quicksearchbox').removeClass('ui-autocomplete-loading');
        //document.getElementById("quicksearchbox").classList.remove("ui-autocomplete-loading");
    }
}

//adding autocomplete to element(s) passed in parameter
function autoComplete(el){
    if(el instanceof jQuery){
    el = [el];
    }
    for(var i = 0, l = el.length; i<l; i++){
    el[i].on( "keydown", function( event ) {
      if ( event.keyCode === $.ui.keyCode.TAB &&
          typeof $( this ).data( "autocomplete" ) != 'undefined' &&
          $( this ).data( "autocomplete" ).menu.active ) {
        event.preventDefault();
      }
    }).autocomplete({
      source: function( request, response ) {
          $.ajax({
            'beforeSend': function(){ },
            'url' : "ajax/searchAutoComplete.do",
                'data' : {search: request.term },
                'success' : function(data){
                  if(data.status == 200){
                response(data.ret.terms);
                  }
                },
                'traditional' : true,
                'dataType': 'json', // force return as json
            'type': 'POST', // force POST data
            'complete': function(jqXHR, textStatus){
                  search_unwait();
            }, // no more modal box once ajax request is complete
            'error': function(){ search_unwait(); } // in case of error...
          });
      },
      select: function(event, ui){
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).data( "autocomplete" ).menu.active ) {
          event.preventDefault();
        }else{
          this.value = ui.item.value;
          $(event.target.form).submit();
        }
      }
    });
    }
}

//function showing notification panel
function showMessage(s){
  generateMessage(s, 'info');
}

// function showing error panel
function showError(s){
  generateMessage(s, 'error');
}

// function showing warning panel
function showWarning(s){
  generateMessage(s, 'warning');
}

function generateMessage(s, v){
  if(s==''){
        $('.basicinfo:visible').toggle('slow');
    }else{
       var stmp = '';
       if(typeof s == 'string')
          stmp = s;
       else{
          for(j in s){
            if(typeof s[j] == 'string') stmp += s[j]+"<br/>";
          }
       }
       if($('#test').length != 1){
         $('#contentlimiter').prepend('<div id="test"></div>');
       }
       if(v == 'info')
           $('#test').show().html('<div class="basicinfo"><div class="custom info"> <img src="img/icon_info.png" alt="'+AJAX_MESSAGES['js.popup.info']+'" height="48" width="48" /> <h3>'+AJAX_MESSAGES['js.popup.info']+'</h3>'+stmp+' <a class="closeButton" href="#">x</a></div></div>');
       if(v == 'error')
        $('#test').show().html('<div class="basicinfo"><div class="custom errornotif"> <img src="img/icon_error.png" alt="'+AJAX_MESSAGES['js.popup.error']+'" height="48" width="48" /> <h3>'+AJAX_MESSAGES['js.popup.error']+'</h3>'+stmp+' <a class="closeButton" href="#">x</a></div></div>');
       if(v == 'warning')
        $('#test').show().html('<div class="basicinfo"><div class="custom info"> <img src="img/icon_warning.png" alt="'+AJAX_MESSAGES['js.popup.warning']+'" height="48" width="48" /> <h3>'+AJAX_MESSAGES['js.popup.warning']+'</h3>'+stmp+' <a class="closeButton" href="#">x</a></div></div>');
     }
}

function enableSeriesKeyTooltips(data) {
  $(".seriesKey>img").tipsy({
    title: function() {
      var span = $(this).parent();
      var parts = span.data("seriesId").split('.');
      var dataset = parts[1];
      var str = "<div style=\"text-align:left;\">";

      str += AJAX_MESSAGES['tooltip.model.keyfamily'] + " " + data[dataset]["keyFamily"] + AJAX_MESSAGES['lang.colon.html'] + " " + data[dataset]["keyFamilyDescription"];
      str += "<br/>";
      str += "<table style='margin-left:10px;'>";
      str += "<tr><td class=\"dsd-tooltip-code\">" + dataset + "</td><td> &bull; </td><td>" + "<span class=\"dsd-tooltip-concept\">" + AJAX_MESSAGES['tooltip.dataset'] + "</span> <span class=\"dsd-tooltip-description\">" + data[dataset]["datasetDescription"] + "</span></td></tr>";

      /*
       * <tr>
       *   <td class="dsd-tooltip-code">...</td>
       *   <td> &bull; </td>
       *   <td>
       *     <span class="dsd-tooltip-concept">...</span>
       *     <span class="dsd-tooltip-description">...</span>
       *   </td>
       * </tr>
       */
      for (var i in parts) {
        if (i > 1) {
          str += "<tr><td class=\"dsd-tooltip-code\">";
            str += parts[i] + "</td><td> &bull; </td><td>";
            str += "<span class=\"dsd-tooltip-concept\">" + $.map(data[dataset]["concept"][i-2], function(value, key) { return value; }) + "</span> ";
            str += "<span class=\"dsd-tooltip-description\">" + data[dataset]["data"][i-2][parts[i]] + "</span>";
          str += "</td></tr>";
        }
      }
      str += "</table>";
      str += AJAX_MESSAGES['js.seriesKey.moreInfo'] + "</div>";
      return str;
    },
    html: true,
    gravity: 's',
    delayIn: 300
  });
}

function enableQuickvieweTooltips(data) {
    $(".seriesKey>img").tipsy({
      title: function() {
        var span = $(this).parent();
        var parts = span.data("seriesId").split('.');
        var dataset = parts[1];
        var str = "<div style=\"text-align:left;\">";

        str += AJAX_MESSAGES['tooltip.model.keyfamily'] + " " + data[dataset]["keyFamily"] + AJAX_MESSAGES['lang.colon.html'] + " " + data[dataset]["keyFamilyDescription"];
        str += "<br/>";
        str += "<table style='margin-left:10px;'>";
        str += "<tr><td class=\"dsd-tooltip-code\">" + dataset + "</td><td> &bull; </td><td>" + "<span class=\"dsd-tooltip-concept\">" + AJAX_MESSAGES['tooltip.dataset'] + "</span> <span class=\"dsd-tooltip-description\">" + data[dataset]["datasetDescription"] + "</span></td></tr>";

        /*
         * <tr>
         *   <td class="dsd-tooltip-code">...</td>
         *   <td> &bull; </td>
         *   <td>
         *     <span class="dsd-tooltip-concept">...</span>
         *     <span class="dsd-tooltip-description">...</span>
         *   </td>
         * </tr>
         */
        for (var i in parts) {
          if (i > 1) {
            str += "<tr><td class=\"dsd-tooltip-code\">";
              str += parts[i] + "</td><td> &bull; </td><td>";
              str += "<span class=\"dsd-tooltip-concept\">" + $.map(data[dataset]["concept"][i-2], function(value, key) { return value; }) + "</span> ";
              str += "<span class=\"dsd-tooltip-description\">" + data[dataset]["data"][i-2][parts[i]] + "</span>";
            str += "</td></tr>";
          }
        }
        str += "</table>";
        str += AJAX_MESSAGES['js.seriesKey.moreInfo'] + "</div>";
        return str;
      },
      html: true,
      gravity: 'n',
      delayIn: 300
    });
  }

function enableSeriesKeyClick() {
  $('.seriesKey>img').off('click');
  $('.seriesKey>img').on('click', function() {
    var seriesId = $(this).parent().data('seriesId');
    if (seriesId) {
      loadIn($('#series-dialog'), 'ajax/keyFamily.do', {seriesId: seriesId},
        function() {
          $('#series-dialog').attr('title', $('#series-dialog>h4').text());
          $('#series-dialog>h4').hide();
          $('#series-dialog').dialog({
            closeText: "",
            modal: true,
            resizable: false,
            width: '90%',
            draggable: false
          });
        }
      );
    }
  });
}