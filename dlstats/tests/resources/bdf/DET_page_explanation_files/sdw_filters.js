(function ($){
  // https://github.com/browserstate/history.js

  SDWFilters = function(data) {

      this.setCurrentDataset = function(aDataset) {
        this.currentDataset = aDataset.length != 0 && aDataset !== false ? $.map(aDataset, function(e,i){
              if(parseInt(e, 10) == e){
                return SdwLoader.datasetList[e];
              }else{
                return e;
              }}) : SdwLoader.datasetList;
      };

    //La liste de toutes les series de la page
    this.allSeries = SdwLoader.seriesList, // DO NOT OVERWRITE
    //La liste de toutes les dataset de la page
    this.allDataset = SdwLoader.datasetList, // DO NOT OVERWRITE
    //Totalité de tous les renseignements de la page
    this.all = data.all,
    //La liste des series filtrées
    this.currentSeries = data.currentSeries || SdwLoader.seriesList,
    //La liste des dataset filtrés
    //Dans certains cas on peut recevoir la valeur de la checkbox de la dataset, donc on teste si la valeur est un numeric, si
    //c'est le cas, on recupère le dataset à l'index de la valeur indiquée.
    this.setCurrentDataset(data.currentDataset),
    //La liste des filtres courrants
    this.currentFilters = data.currentFilters || {},
    //SDW-673
    this.units = SdwLoader.units,
    //Le noeud en cours
    this.node = data.node,
    //Gestionnaire de highChart dans l'onglet chart
    this.sdwChart = undefined,
    //Gestionnaire de la datatable dans l'onglet table
    this.sdwTable = undefined,
    //L'action en cours
    this.currentPage = data.currentPage; // DO NOT OVERWRITE
    //La liste des clefs de series selectionnées
    this.selectedSeriesKeys = $.map(data.selectedSeriesKeys, function(e,i){return SDWFilters.parseSKFromSKId(e);}) || []; // used for tab change
    // TODO previous with History

    /**
     * initialisation du module
     */
    this.init = function init(){

      filterNode(this, true);
    };

    /**
     * ACCESSEURS
     */
    this.setCurrentFilters = function(aFilters) {
      this.currentFilters = aFilters;
    };

    this.setCurrentSeries = function(aSeries) {
      this.currentSeries = aSeries;
    };
    this.setSelectedSeriesKeys = function(aSeries) {
      this.selectedSeriesKeys = [];
      for(var i = 0, l = aSeries.length; i<l; i++){
        this.selectedSeriesKeys.push(SDWFilters.parseSKFromSKId(aSeries[i]));
      }
      updateSeriesCounter(this.allSeries, this.currentSeries, this.selectedSeriesKeys);
    };

    this.addSelectedSeriesKeys = function(sSeries) {
      if($.inArray(sSeries, this.selectedSeriesKeys) == -1){
        this.selectedSeriesKeys.push(SDWFilters.parseSKFromSKId(sSeries));
      }
      updateSeriesCounter(this.allSeries, this.currentSeries, this.selectedSeriesKeys);
    };

    this.removeSelectedSeriesKeys = function(sSeries) {
      sSeries = SDWFilters.parseSKFromSKId(sSeries);
      var inArray = $.inArray(sSeries, this.selectedSeriesKeys);
      if(inArray != -1){
        this.selectedSeriesKeys.splice(inArray, 1);
      }
      updateSeriesCounter(this.allSeries, this.currentSeries, this.selectedSeriesKeys);
    };

    this.removeAllSelectedSeriesKeys = function() {
      for(var i = 0; i<this.currentSeries.length; i++){
        var inArray = $.inArray(this.currentSeries[i], this.selectedSeriesKeys);
        if(inArray!=-1){
          this.selectedSeriesKeys.splice(inArray, 1);
        }
      }
      updateSeriesCounter(this.allSeries, this.currentSeries, this.selectedSeriesKeys);
    };

    this.addAllSelectedSeriesKeys = function() {

      for(var i = 0; i<this.currentSeries.length; i++){
        if($.inArray(this.currentSeries[i], this.selectedSeriesKeys)==-1){
          this.selectedSeriesKeys.push(SDWFilters.parseSKFromSKId(this.currentSeries[i]));
        }
      }
      updateSeriesCounter(this.allSeries, this.currentSeries, this.selectedSeriesKeys);
    };

    var clone = function clone(t){
      return {
        allSeries: SdwLoader.seriesList,
        allDataset: SdwLoader.datasetList,
        all: t.all,
        currentSeries: t.currentSeries,
        currentDataset: t.currentDataset.length != 0 && t.currentDataset != false ? t.currentDataset : SdwLoader.datasetList,
        currentFilters: t.currentFilters,
        node: t.node,
        currentPage: t.currentPage,
        selectedSeriesKeys: t.selectedSeriesKeys
      };
    };

    /**
     * function appelée à chaque changement de filtre
     */
    this.filter = function filter(){
      //Parce que history mange enormement de mémoire et la dépasse quand trop de séries sont présente dans le noeud.
      var elem = (this.allSeries.length>500)?{}:clone(this);
      //filterNode(this);
      History.pushState(elem, null, this.buildURL(this.currentPage));
    };

    this.filterWithoutHistory = function filterWithoutHistory(){
      filterNode(this);
    };

    /**
     * Merge la liste des séries selectionnées et celle des filtrées
     */
    var mergeSelectedSeriesByFilter = function(t){
      if(t.selectedSeriesKeys.length==0)return t.currentSeries;
      return $.map(t.currentSeries, function(e, i){
        for(var i = 0; i<t.selectedSeriesKeys.length;i++){
          if(t.selectedSeriesKeys[i]==e){
            return e;
          }
        }
      });
    };
    //Chercher si le dataset contient une dimension defaultArea
    this.isContainRefArea = function isContainRefArea(datasetDetailedList){
       var containRefArea = false;
       for(var lgth = 0; lgth<datasetDetailedList.length && !containRefArea; lgth++){
              var dataset = datasetDetailedList[lgth];
              var dimensions = dataset.keyFamily.dimensions;

              for(var dimIndex = 0; dimIndex<dimensions.length && !containRefArea; dimIndex++){
                //MA-358 Search if the dataset contains  the defaultArea dimension
                if(dimensions[dimIndex].key == dataset.defaultArea){
                  containRefArea = true;
                }
              }
            }
       return containRefArea;
      };
      //SDW - 699 : Filtrage temporel export CSV
    //Reconstruire les url de la toolbar.jsp pour prendre en compte des nouevaux filtres
    this.updateUrlExport = function updateUrlExport(){
      var exportUrlParam ='node='+this.node;
      var filters = this.currentFilters;
      var count = 0;
      for(var dim in filters) {
        for(var value in filters[dim]) {
          exportUrlParam = exportUrlParam +'&'+ dim +'='+value;
        }
      }
      $("#pdfExportTable").attr("href","print.do?"+exportUrlParam+"&printType=table");
      $("#pdfExportChart").attr("href","print.do?"+exportUrlParam+"&printType=chart");
      $("#pdfExportMatrice").attr("href","printMatrice.do?"+exportUrlParam+"&printType=matrice");
      $("#excelExport").attr("href","export.do?"+exportUrlParam+"&exportType=csv");
      $("#otherExport").attr("href","export.do?"+exportUrlParam+"&exportType=sdmx");
    };

    /**
     * Combine la page donnée avec les paramètres filtrés et les séries sélectionnées afin de construire un URL
     * @param page
     * @returns String l'url demandée
     */
    this.buildURL = function buildURL(page, truncated){
      var truncatedVar = truncated == undefined ? false : truncated;
      var stringBuilder = [page];
      var seriesKeysAlreadyPut = false;
      stringBuilder.push('.do');
      stringBuilder.push(SDWFilters.separator);
      stringBuilder.push('node=');
      stringBuilder.push(this.node);
      stringBuilder.push('&');
      if(hasFilters(this)){
        if(this.currentDataset.length != this.allDataset.length){
          for(var i = 0, l = this.currentDataset.length; i<l; i++){
            stringBuilder.push('DATASET=');
            if(truncatedVar){
              var j =0;
              for(var dataset in SdwLoader.kfdimStruct){
                if(dataset===this.currentDataset[i]){
                  stringBuilder.push(j);
                  break;
                }
                j++;
              }
            } else {
              stringBuilder.push(this.currentDataset[i]);
            }
            stringBuilder.push('&');
          }
        }

        if(SDWFilters.getObjectLength(this.currentFilters) != 0){
          for(var dim in this.currentFilters){
            for(var value in this.currentFilters[dim]){
              if(dim=="SERIES_KEY"){
                seriesKeysAlreadyPut=true;
              }
              stringBuilder.push(dim);
              stringBuilder.push('=');
              stringBuilder.push(value);
              stringBuilder.push('&');
            }
          }

        }

      }
      if(this.selectedSeriesKeys.length > 0 && !seriesKeysAlreadyPut){
        for(var i = 0, l = this.selectedSeriesKeys.length; i<l; i++) {
          //push la selectedSeriesKeysId à la place de la selectedSeriesKeys (pour pouvoir aller sur l'onglet table (sinon écran blanc))
          var serieKeyId = this.allSeries[$.inArray(this.selectedSeriesKeys[i], $.map(this.allSeries, function(e){
              return SDWFilters.parseSKFromSKId(e);
            }))];
          if(serieKeyId==undefined){
            serieKeyId = SDWFilters.parseSKFromSKId(this.selectedSeriesKeys[i]);
          }
          stringBuilder.push('SERIES_KEY=');
          stringBuilder.push(serieKeyId);
//          stringBuilder.push(this.selectedSeriesKeys[i]);
          stringBuilder.push('&');
        }
      }
      stringBuilder.splice(stringBuilder.length-1,1);
      return stringBuilder.join('');
    };

    /**
     * Filtre la totalité des séries de la page avec les datasets et filtres
     * Met à jour le compteur de séries
     * Lance l'action spécifique à l'onglet actuel (voir la variable currentPage)
     * @see SDWFilters.currentDataset
     * @see SDWFilters.currentFilters
     * @see SDWFilters.all
     * @param t SDWFilters
     */
    var filterNode = function filterNode(t, isInit){
      $(document).trigger(SdwEvents.DATA_LOADING_START);
      var currentSeries = [];
      for(dataset in t.all){
        if($.inArray(dataset, t.currentDataset) != -1){ // on veut seulement les séries des datasets sélectionnés
          var aSeries = t.all[dataset];
          //var aSeries = t.allSeries;
          for(sKey in aSeries){ // on boucle sur les séries
            var addThisSeries = SdwUrl.getTypePage()==SdwPage.PAGE_SELECTOR || t.selectedSeriesKeys.length == 0 || (t.selectedSeriesKeys.length != 0 && $.inArray(sKey, t.selectedSeriesKeys) != -1); // on vérifie si la clef fait partie des séries sélectionnées s'il y en a
            var currentSerieDim = aSeries[sKey];
            if(addThisSeries){
              for(dimToFilter in t.currentFilters){
                if($.inArray(dimToFilter, $.map(currentSerieDim, function(e,i){return i;})) != -1){ // it should always be true... I guess
                  var filterValues = $.map(t.currentFilters[dimToFilter], function(v,k) {if(v && typeof k == "string") return k; return null;});
                    if($.inArray(currentSerieDim[dimToFilter]['value'], filterValues) == -1){
                          addThisSeries = false;
                     }

                }
              }
            }
            if(addThisSeries){
              currentSeries.push(sKey);
            }
          }

        }
      }
      t.currentSeries = currentSeries;

      // mise à jour du compteur de séries
      updateSeriesCounter(t.allSeries, t.currentSeries, t.selectedSeriesKeys);

      //On ne met à jour les filtres selectionné et les dimensions communne que si on ne se trouve pas sur
      //un navigateur IE8 ou moins et qu'il y a plus de 500 series pour des question de rapidité.
      var vers=getInternetExplorerVersion();
      if(t.allSeries.length<500 || vers==-1 || vers>=9){
      //C'est juste pour rendre la mise à jour des filtres asynchrone
      setTimeout(function(){
        t.updateFiltersSelect(t.currentSeries, $("#filterSections select.listbox.select2"));
      },0);

      //C'est juste pour rendre la mise à jour des descriptions communes asynchrone
    setTimeout(function(){
        // mise à jour des descriptions communes
         t.updateCommonDescription();
    },0);
      }

      // action selon la page courante
      switch(t.currentPage){
        case 'browse':
        case 'browseSelection':
          t.filterSelection();
          break;
        case 'browseChart':
          t.filterChart();
          break;
        case 'browseExplanation':
          t.filterInfo(isInit);
          break;
        case 'browseTable':
        // Optimisation matrice
          t.filterTable(isInit);
          break;
      }
    };

    /**
     * Action sur l'onglet "Séries"
     * - Cache les lignes ne faisant pas partie du filtre actuel du tableau
     * - Décocher les séries cachées ? TODO
     */
    this.filterSelection = function filterSelection(){
      loadSeriesInfo();
//      var rows = $('#browseDataSelectionTable tbody tr');
//      var that = this;
//      if(hasFilters(this)){
//        rows.slideUp();
//        rows.filter(function(){
//          return (typeof $(this).data('sk') === 'undefined') || ($.inArray($(this).data('sk'), that.currentSeries) != -1);
//        }).slideDown();
//      }else{
//        rows.slideDown();
//      }
//      rows.each(function(){
//          //On check/decheck la séries selon sa présence dans la liste des séries séléctionnées
//        $(this).find("input").attr("checked", ($.inArray($(this).data('sk'), that.selectedSeriesKeys) != -1));
//        });
    };

    /**
     * Action sur l'onglet "graphique"
     * @see SDWFiltersChart.refresh
     */
    this.filterChart = function filterChart() {
      $(document).trigger(SdwEvents.INITIALIZE_CHART);
      if(this.sdwChart!=undefined){
        this.sdwChart.refresh(mergeSelectedSeriesByFilter(this));
      }
    };

    /**
     * Action sur l'onglet "Infos"
     * - Cache les parties ou lignes filtrées
     */
    this.filterInfo = function filterInfo(isInit){
      var that = this;
      var selectedSeries = mergeSelectedSeriesByFilter(that);
      var currentInfoSeries = $.map($('#seriesLevelMetadata .tablestats').find('tbody tr:eq(1) td:eq(0)'), function(e){return $(e).data('key')});
      // filter datasetmergeSelectedSeriesByFilter(that)

      if(!isInit && (selectedSeries.length<100 || (selectedSeries.length>100 && currentInfoSeries.length>0))){
        //si les series selectionnées ne sont pas présentes dans les actuelles, on recharge la page pour refiltrer côté serveur
      var j = selectedSeries.length-1;
      for(; j>=0; j--){
        if($.inArray(selectedSeries[j], currentInfoSeries)==-1){
          location.href=sdwFilters.buildURL(sdwFilters.currentPage);
            return;
        }
      }
      }

      $('#datasetLevelMetadata .panel').show();
      $('#datasetLevelMetadata h2').filter(function(){
        return $.inArray($(this).data('dataset'), that.currentDataset) == -1;
      }).parent().hide();

      // filter series
      var seriesTables = $('#seriesLevelMetadata .tablestats');
      seriesTables.hide();
      seriesTables.each(function(){
        var seriesTable = $(this);
        var td = seriesTable.find('tbody tr:eq(1) td:eq(0)').filter(function(){
          return $.inArray($(this).data('key'), selectedSeries) != -1;
        }).parent().parent().parent().show();
      });

      var nbrByDataset = {};

      var i = SdwLoader.seriesDetailedList.length-1;

      for(; i>=0; i--){
        var seriesKey = SdwLoader.seriesDetailedList[i].seriesKey;
        var datasetName = SdwLoader.seriesDetailedList[i].dataset.name;
        if(nbrByDataset[datasetName]===undefined){
          nbrByDataset[datasetName]={};
          nbrByDataset[datasetName].nbrCurrentSeries=0;
          nbrByDataset[datasetName].nbrSelectedSeries=0;
        };
        if($.inArray(seriesKey, this.currentSeries)!=-1){
          nbrByDataset[datasetName].nbrCurrentSeries++;

          if($.inArray(seriesKey, selectedSeries)!=-1){
            nbrByDataset[datasetName].nbrSelectedSeries++;
          }
        }
      }

      for(var dataset in nbrByDataset){

        var nbrSelectedSeries = nbrByDataset[dataset].nbrSelectedSeries;
        var nbrCurrentSeries = nbrByDataset[dataset].nbrCurrentSeries;

        var text = "";
        if(nbrSelectedSeries===nbrCurrentSeries){
          text = nbrCurrentSeries;
        } else {
          text = nbrSelectedSeries+" / "+nbrCurrentSeries;
        }
        $('#seriesLevelMetadata h3 span #nbrCount'+dataset).html('('+text+')');
      }
    };

    /**
     * Action sur l'onglet "Table"
     * @see SDWFiltersTable.refresh
     */
    // SDW-Optimisation matrice
    this.filterTable = function filterTable(isInit){
      replaceTable(isInit);
//      if(this.sdwTable !== undefined){
//        this.sdwTable.refresh(this.currentSeries);
//      }
    };

    /**
     * Met à jour le compteur de séries
     */
    var updateSeriesCounter = function updateSeriesCounter(as, cs, ss){

      if(ss && ss.length!=0){
        var nbrCrossedSerie = 0;

        for(var i = 0; i<ss.length; i++){
          if($.inArray(ss[i], cs)!=-1){
            nbrCrossedSerie++;
          }
        }

        var outOf = (as.length==cs.length)? SdwLibelle.OUT_OF : SdwLibelle.OUT_OF_FILTERED;

        $('#filterSections .seriesCountSpan').html(['(',nbrCrossedSerie,outOf.replace(" ^ ", cs.length), ')'].join(''));
        $('#quickSeriesCount').html('('+nbrCrossedSerie+')');
         // Initialize jRumble on Selector
    var timeOut = $('#idTimeOutPictoFilter').val();
    $('#demo').jrumble({
      x: 0,
      y: 0,
      rotation: 0
      
    });
    $('#demo').trigger('startRumble');
    setTimeout(function(){
      $('#demo').trigger('stopRumble');},timeOut);

      }else{
        var outOf = (as.length==cs.length)? '' : SdwLibelle.OUT_OF_FILTERED;
        $('#filterSections .seriesCountSpan').html(['(',cs.length,outOf.replace(" ^ ", cs.length),')'].join(''));
        $('#quickSeriesCount').html('('+cs.length+')');
        // Initialize jRumble on Selector
    var timeOut = $('#idTimeOutPictoFilter').val();
    $('#demo').jrumble({
      x: 0,
      y: 0,
      rotation: 0
      
    });
    $('#demo').trigger('startRumble');
    setTimeout(function(){
      $('#demo').trigger('stopRumble');},timeOut);

      }

      //Afficher la po pin (définie dans toolbar.jsp)si c la première navigation
      var showTooltipFilter = $('#showTooltipFilter').val();

      if(showTooltipFilter == 'true'){
          $('#demo.newToolBarElement').tipsy("show");
          //Personnaliser la css
          $('.tipsy-arrow').css({
              'background': "url('img/tipsy_green.gif') ",
              'width': '13px',
              'margin-top':'-18px',
              'margin-right':'70px'

            });
          $('.tipsy').css({
              'font-size':'12px'

          });
            $('.tipsy-inner').css({
                 'background-color':'#119643'


            });

            $('.tipsy-e').css({

               'margin-left':'80px',
               'margin-top':'30px'

               });

      }
    };


    //JIRA SDW-474
    //Update les filtres de la page actuel pour signaler quand une dimension est "inactive"
    //une dimension est dite inactive quand aucune dim n'est selectionnée dans son filtre
    //associé et qu'aucune serie courante ne la possede. Ainsi sa selection n'aurait pas d'impacte
    //(ou un impacte inutile) sur la liste des series à afficher. Filtre ensuite les dimensions en
    //fonction de leurs activitées (les actives en haut) et de leurs ordres alphanumériques sur les
    //clefs de dimensions
    //currentSeriesKey: liste des clefs de series des series actuellement affichée
    //target: l'element jquery represenatant le selecteur à update
    this.updateFiltersSelect = function updateFiltersSelect(currentSeriesKey, target){

      //on recupere toute les dimensions triées par concept contenues par les series actuelles
      var currentDim = {};

      //var currentUnit = SdwLoader.units;
      //on boucle sur toutes les series
      $.each(SdwLoader.seriesDetailedList, function(index, e){
        //c'est une des series actuelles?
        if($.inArray(e.seriesKey,currentSeriesKey)!=-1){
          //on récupère la liste des concepts de la keyFamily de la serie
          var conceptList = $.map(e.dataset.keyFamily.dimensions, function(e){
            return e.key;
          });
          //on recupere la liste des dimensions de la serie
          var dimValueList = $.map(e.dimensionsValues, function(e){
          for(var dim in e){
            return dim;
          }
          });

          for(var i = 0; i<conceptList.length; i++){
            if(!currentDim[conceptList[i]]){
              currentDim[conceptList[i]]=[];
              currentDim[conceptList[i]].push(dimValueList[i]);
            } else if($.inArray(dimValueList[i], currentDim[conceptList[i]])==-1) {
              currentDim[conceptList[i]].push(dimValueList[i]);
            }
          }
        }
      });

      //On parcourt tous les filtres avec toutes les dimensions pour ajouter ou enlever
      //la class disabledDimensionen fonction de sa presence ou non dans currentDim
      target.each(function(i, e){
        var conceptSelect = $(e);
        conceptSelect.find('option').each(function(i, e){
          var dimOption = $(e);
          conceptSelectName = conceptSelect.attr('name');
          //On disable si il n'y a aucune dimension filtrée pour le concept et que
          //currentDim est vide ou ne contient pas la valeur de la dimension en cours
          if(!sdwFilters.currentFilters[conceptSelectName] && (!currentDim[conceptSelectName] || $.inArray(dimOption.attr('value'), currentDim[conceptSelectName])==-1)){
            //dimOption.attr('disabled', 'disabled');
            var idOption = dimOption.attr('id');
            //SDW-673 : ne pas griser le filtre unité
            if(idOption != 'unit'){
              dimOption.addClass('disabledDimension');

            }

          } else {
            //dimOption.removeAttr('disabled');
            dimOption.removeClass('disabledDimension');
          }
        });

        //On tri pour que les dimensions soit avec les actives en haut puis par ordre
        //alphanumérique
        conceptSelect.find('option').sort(function(a, b){
          var jA = $(a);
          var jB = $(b);

          var aDisabled = jA.hasClass('disabledDimension');
          var bDisabled = jB.hasClass('disabledDimension');

          if(bDisabled && !aDisabled) return -1;
          if(aDisabled && !bDisabled) return 1;

          return jA.attr('value') > jB.attr('value') ? 1 : -1;
        }).remove().appendTo(conceptSelect);
      });
    };

    /**
     * Met à jour les descriptions communes
     */
    this.updateCommonDescription = function updateCommonDescription(){

      var allValues = [];
      var _datasets = [];

      for (var i = 0; i < SdwLoader.seriesDetailedList.length; i++) {
        var series = SdwLoader.seriesDetailedList[i];
        if ($.inArray(series.seriesKey, this.currentSeries) < 0) continue;

        if ($.inArray(series.dataset.name, _datasets) < 0 ) {
          _datasets.push(series.dataset.name);
        }

      for (var dimIndex = 0; dimIndex < series.dimensionsValues.length; dimIndex++) {
          var dim = series.dimensionsValues[dimIndex];
          var dimKey;
          var dimLabel;
          for (var key in dim) {
            dimKey = key;
            dimLabel = dim[key];
            break;
          }
          var dimValues = allValues[dimIndex];
          if (!dimValues) {
            dimValues = {};
            allValues[dimIndex] = dimValues;
          }

          dimValues[dimKey] = dimLabel;
        }
      }

      var commonDimensions = [];
      var keyFamilyName = '';
      if (_datasets.length === 1) {
        var dataset = SdwLoader.datasetByName[_datasets[0]];
        commonDimensions.push({
          key: dataset.name,
          label: dataset.description
        });
        keyFamilyName = dataset.keyFamily.name;
        var dimensionsByNames = [];
        for (var i = 0; i < dataset.keyFamily.dimensions.length; i++) {
          var dim = dataset.keyFamily.dimensions[i];
          dimensionsByNames[i] = dim.name;
        }

        for (var i = 0; i < allValues.length; i++) {
          var count = 0;
          var dimKey = null;
          var dimLabel = null;
          $.each(allValues[i], function(key, value) {
            if (count > 0) {
              dimKey = null;
              dimLabel = null;

            } else {
              dimKey = key;
              dimLabel = value;
            }

            count++;
          });

          if (dimKey !== null) {
            commonDimensions.push({
                key: dimKey,
                label: dimLabel,
                name: dimensionsByNames[i]
            });
          }
        }
      }

      $('#commonDimensionHolder').html($('#tmpl-common-dimensions').jqote({
        commonDimensions: commonDimensions,
        keyFamilyName: keyFamilyName
      }));

      $(document).trigger(SdwEvents.COMMON_DIMENSIONS_LOADED);
    };
//    this.updateCommonDescription = function updateCommonDescription(){
//      var position = [],
//        tmp = 0;
//        maxPos = this.currentSeries.length > 0 ? this.currentSeries[0].split('.').length-1 : 0;
//      for(;tmp<maxPos;tmp++){
//        var cur;
//        for(var i = 0, l = this.currentSeries.length; i<l; i++){
//          var tmpCur = this.currentSeries[i].split('.')[tmp];
//          if(cur === undefined) cur = tmpCur;
//          if(cur != tmpCur){
//            cur = undefined;
//            break;
//          }
//        }
//        if(cur !== undefined){
//          position.push(tmp);
//        }
//      }
//
//
//      if(position.length != 0){
//        var stringBuilder = [], dataset = $.map(kfdimStruct, function(e,i){return i;})[0];
//        stringBuilder.push('<li class="tag" data-complement="');
//        stringBuilder.push($('#datasetHelper').text());
//        stringBuilder.push(' : ');
//        stringBuilder.push(dataset);
//        stringBuilder.push('"><div>');
//        stringBuilder.push(kfdimStruct[dataset].datasetDescription);
//        stringBuilder.push('</div></li>');
//        for(var i = 0, l = position.length; i < l ; i++) {
//          if(position[i]==0){
//            stringBuilder.push('<li class="tag" data-complement="');
//            stringBuilder.push();
//            stringBuilder.push(' : ');
//            stringBuilder.push(dataset);
//            stringBuilder.push('"><div>');
//            stringBuilder.push(kfdimStruct[dataset].datasetDescription);
//            stringBuilder.push('</div></li>');
//          } else {
//
//            var concept = kfdimStruct[dataset].concept[position[i]-1],
//            data = kfdimStruct[dataset].data[position[i]-1];
//            stringBuilder.push('<li class="tag" data-complement="');
//            stringBuilder.push($.map(concept, function(e,i){return e;})[0]);
//            stringBuilder.push(' : ');
//            stringBuilder.push($.map(data, function(e,i){return i;})[0]);
//            stringBuilder.push('"><div>');
//            stringBuilder.push($.map(data, function(e,i){return e;})[0]);
//            stringBuilder.push('</div></li>');
//          }
//        }
//        //<li class="tag" data-complement="${dimension.dimensionName}<bean:message key="lang.colon.html"/> ${dimension.valueCode}"><div>${dimension.valueDescription}</div></li>
//        $('.tag-list').html(stringBuilder.join(''));
//
//      }
//    };

    /**
     * Vérifie la présence de filtre (dimension ET dataset)
     * @returns boolean
     */
    var hasFilters = function hasFilters(t){
      return SDWFilters.getObjectLength(t.currentFilters) > 0 ||
          (t.currentDataset.length > 0 && t.currentDataset.length != t.allDataset.length);
    };

    //cleanArray removes all duplicated elements
    var cleanArray = function cleanArray(array) {
      var i, j, len = array.length, out = [], obj = {};
      for (i = 0; i < len; i++) {
        obj[array[i]] = 0;
      }
      for (j in obj) {
        out.push(j);
      }
      return out;
    };
  };

  /**
   * Module gérant le graphique filtré
   * @param data
   * @returns {SDWFiltersChart}
   */
  SDWFiltersChart = function(data){
    this.allSeries = data.series || [];
    this.chartContainer = data.chartContainer || null;
    this.chartOptions = data.chartOptions || {};
    this.chartType = data.chartType || "highstockchart";
    this.callback = data.callback || undefined;

    this.refresh = function(series){
        // Les évènements attachés aux boutons du graphique sont liés au graphique. Il faut donc les détacher car nous allons "détruire" l'ancien graphique
//        $("#chartIconExport,#chartIconArea, #chartIconColumn, #chartIconLine, #chartIconStackedArea, #chartIconStackedColumn, #chartIconStackedLine, #chartIconScatter").off("click");
        // Clic clic boom
        // On filtre les séries du graphique avec les séries préalablement calculées comme filtrées entrées en paramètre
        switch(this.chartType){
        case "highstockchart":
          if(this.chartContainer!==undefined && this.chartContainer!==null && this.chartContainer.chart!==undefined){

            removeParam(sdwFilters.currentFilters, "pieChart");

            var chartSeries = this.chartContainer.chart.series;

            var i = chartSeries.length-1;
            var selectedPresentSeries = {};

            for(; i>=0; i--){
              var selected = $.inArray(chartSeries[i].name.split(' ^ ')[1] ,series) !== -1;
              chartSeries[i].setVisible(selected, false);
              if(selected){
                selectedPresentSeries[chartSeries[i].name.split(' ^ ')[1]]=true;
              }
            }
            var nbrSelected = 0;
            for(var selectedSeries in selectedPresentSeries){
              nbrSelected++;
            }
            if(nbrSelected<series.length){
              location.href=sdwFilters.buildURL(sdwFilters.currentPage);
            } else {
              this.chartContainer.chart.redraw();
            }
          }
          break;
        case "highstockmap":
          this.callback(this.filterMapSeries(series));
          break;
        case "piechart":
          this.callback(this.filterPiechartSeries(series));
          break;
        case "jfreechart":
          this.callback($.map(sdwFilters.allSeries, function(e){
            if($.inArray(e.substring(e.indexOf('.')+1), series) != -1){
              return e;
            }
          }));
          break;

        }
    };

    //deprecated
    this.filterHighstockchartSeries = function filterHighstockchartSeries(series){
      var newSeries = [];
        for(var i = 0, l = this.allSeries.length; i<l;i++){
          if($.inArray(this.allSeries[i].name.split(' ^ ')[1] ,series) !=-1){
            newSeries.push(this.allSeries[i]);
          }
        }
        return newSeries;
    };

    this.filterMapSeries = function(series){

      if (null == this.allSeries || "object" != typeof this.allSeries) return this.allSeries;
        var newSeries = this.allSeries.constructor();

        var index = series.length-1;

        for(; index>=0; index--){
          var serieAlreadyHere = false;

          for(var timestamp in this.allSeries){
            for(var j=0; j<this.allSeries[timestamp].length; j++){
              if(this.allSeries[timestamp][j].seriesKey==series[index]){
                serieAlreadyHere=true;
                break;
              }
            }
            if(serieAlreadyHere){
              break;
            }
          }
          if(!serieAlreadyHere){
            location.href=sdwFilters.buildURL(sdwFilters.currentPage);
          }
        }

        var sortedAttr = [];
        for (var attr in this.allSeries) {
          sortedAttr.push(attr);
        }
        sortedAttr.sort(function(left, right) {
          var iLeft = parseInt(left, 10);
          var iRight = parseInt(right, 10);

          if (iLeft == iRight) return 0;
          if (iLeft < iRight) return -1;
          return 1;
        });

      for (var attrIndex = 0; attrIndex < sortedAttr.length; attrIndex++) {
        var attr = sortedAttr[attrIndex];
            if (this.allSeries.hasOwnProperty(attr)){
              var tabInit = this.allSeries[attr];
              var tab = [];
              for(var i = 0, l = tabInit.length; i<l;i++){
                  if($.inArray(tabInit[i].seriesKey ,series) !=-1){
                    tab.push(tabInit[i]);
                  }
              }
              newSeries[attr] = tab;
            }
        }

        return newSeries;
    };

    this.filterPiechartSeries = function(series){

      if (null == this.allSeries || "object" != typeof this.allSeries) return this.allSeries;
        var newSeries = this.allSeries.constructor();

        var index = series.length-1;

        for(; index>=0; index--){
          var serieAlreadyHere = false;

          for(var timestamp in this.allSeries){
            for(var j=0; j<this.allSeries[timestamp].length; j++){
              if(this.allSeries[timestamp][j].name.split(' ^ ')[1]==series[index]){
                serieAlreadyHere=true;
                break;
              }
            }
            if(serieAlreadyHere){
              break;
            }
          }
          if(!serieAlreadyHere){
            location.href=sdwFilters.buildURL(sdwFilters.currentPage);
          }
        }

        var sortedAttr = [];
        for (var attr in this.allSeries) {
          sortedAttr.push(attr);
        }
        sortedAttr.sort(function(left, right) {
          var iLeft = parseInt(left, 10);
          var iRight = parseInt(right, 10);

          if (iLeft == iRight) return 0;
          if (iLeft < iRight) return -1;
          return 1;
        });

      for (var attrIndex = 0; attrIndex < sortedAttr.length; attrIndex++) {
        var attr = sortedAttr[attrIndex];
            if (this.allSeries.hasOwnProperty(attr)){
              var tabInit = this.allSeries[attr];
              var tab = [];
              for(var i = 0, l = tabInit.length; i<l;i++){
                  if($.inArray(tabInit[i].name.split(' ^ ')[1] ,series) !=-1){
                    tab.push(tabInit[i]);
                  }
              }
              newSeries[attr] = tab;
            }
        }

        return newSeries;
    };
  };

  /**
   * Module gérant plus ou moins bien la table filtrée
   * @param data
   * @returns {SDWFiltersTable}
   */
  SDWFiltersTable = function(data){

    this.series = data.series; // toutes les séries
    this.table = data.table; // objet Datatable
    this.options = data.options; // option objet datatable

    this.refresh = function(filteredSeries){

      if(this.table instanceof jQuery){
        replaceTable();
      }
    };
  };

  window.SDWFilters = SDWFilters;

  /** statics methods **/
  /**
   * get dataset code from series key even if it has datasetInstanceId in it.
   */
  SDWFilters.parseDatasetFromSK = function(sk) {
    if(typeof sk != 'string') throw new Error('Dataset can\'t be parsed');
    var splittedSK = sk.split('.');
    var position = 0;
    if(parseInt(splittedSK[0],10) == splittedSK[0]) position = 1;
    return splittedSK[position];
  };

  /**
   * donne la clef de série depuis potentiellement une id de série
   */
  SDWFilters.parseSKFromSKId = function(skid){
    if(typeof skid != 'string') throw new Error('Dataset can\'t be parsed');
    var splittedSK = skid.split('.');
    if(parseInt(splittedSK[0],10) == splittedSK[0]) splittedSK.splice(0,1);
    return splittedSK.join('.');
  };

  /**
   * Donne le nombre d'attribut dans un objet javascript
   * @param o
   * @returns -1 si le paramètre n'est pas un objet
   */
  SDWFilters.getObjectLength = function(o){
    if(typeof o == 'object')
      return $.map(o, function(v,k){return k;}).length;
    return -1;
  };

  /**
   * Fais le ménage dans les filtres
   * retrait de doublons, de filtres flagués à "false" ou des filtres vides
   * @param filters
   * @returns
   */
  SDWFilters.cleanFilters = function(filters){
    for(dim in filters) {
      for(val in filters[dim]){
        if(filters[dim][val] == false) delete filters[dim][val];
      }
      if(SDWFilters.getObjectLength(filters[dim]) < 1 ){
        delete filters[dim];
      }
    }
    return filters;
  };
  SDWFilters.separator = '?'; // HASHBANG or not ?

  /**
   * fonction parsant l'URL au chargement
   * @param url
   * @returns {objet avec filtres et dataset}
   */
  SDWFilters.parseURL = function(url) {
    var ret;

    //because the dieze
    var indexOfDieze = url.indexOf("#");
    if(indexOfDieze!=-1){
      var newUrl = url.substring(indexOfDieze+1);
      if(newUrl==""){
        url=url.substring(0, indexOfDieze);
      } else {
        url=newUrl;
      }
    }
    var splittedURL = url.split(SDWFilters.separator);
    var isHTML4 = false;
    if(splittedURL.length == 3) isHTML4 = true;
    if(url.indexOf('&') != -1){
      ret = {'DATASET':[], 'FILTERS':{}, 'SERIES_KEY':[]};
    }else{
      ret = {'DATASET':false, 'FILTERS':false, 'SERIES_KEY':false};
      return ret;
    }
    var hash = isHTML4 ? splittedURL[2] : splittedURL[1];
    var splittedHash = hash.split('&');
    for(var i = 0, l = splittedHash.length; i<l; i++) {
      var namVal = splittedHash[i].split('=');
      if(namVal[0] == 'DATASET'){
        ret['DATASET'].push(namVal[1]);
      }else if(namVal[0] == 'SERIES_KEY'){
        ret['SERIES_KEY'].push(namVal[1]);
      }else if(namVal[0] != 'node'){
        var filterRet = ret['FILTERS'];
        if(filterRet[namVal[0]] == undefined)filterRet[namVal[0]] = {};
        filterRet[namVal[0]][namVal[1]] = true;
      }
    }
    return ret;
  };

  /**
   * Met à jour les menus de filtres (module jquery.select2)
   * @param filters
   */
  SDWFilters.updateFiltersMenu = function(filters){

    var filterSection = $('.conceptFilterSection');
    var selects = filterSection.find("select");
    selects.val('').trigger("change", ['history']);
    for(var dimKey in filters){

      var excludeDim = ["min","max","dataNav","currentDataNav","frequency","snapshot","dataSelection","trans","submitOptions.x","submitOptions.y","resetSettings.x","resetSettings.y","dvfreq","flip.x","flip.y","start","end"];

      //If dimKey not in excludeDim, then add option in filter, otherwise, do nothing
      if(excludeDim.indexOf(dimKey) < 0){
        var select = filterSection.find('select[name='+dimKey+']');
        if(select.length > 0){
          for(var dimVal in filters[dimKey]) {
            select.find('option[value='+dimVal+']').prop('selected','selected');
          }

          select.trigger('change', ['history']);
        }
      }
    }
  };


  SDWFilters.updateDatasetMenu = function(dataset) {
    var datasetSection = $('.datasetFilter');
    datasetSection.find("input[type='checkbox']").each(function(){
      $(this).prop('checked', false);
    });
    for(var i=0; i<dataset.length;i++){
      var select = datasetSection.find(':checkbox.'+dataset[i]);
      select.prop('checked', true);
    }
  };

  SDWFilters.updateSelectedSeries = function(series) {
    $.each(series, function(i, e){
      $('tr[data-sk="'+e+'"] :checkbox').prop("checked", true);
    });
  };


})(jQuery);
