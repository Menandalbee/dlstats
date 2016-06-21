var SdwLoader = (function() {

  var extractDatasetAndSeriesList = function(seriesDetailedList){
    var infoSeriesList=[];
    var infoDatasetList=[];

    //On extrait les informations utiles des séries
    for(var i=0; i<seriesDetailedList.length; i++){
      var serie = seriesDetailedList[i];

      infoSeriesList.push(serie.seriesKey);
      if($.inArray(serie.dataset, infoDatasetList) === -1){
        infoDatasetList.push(serie.dataset);
      }
    }

    return {
      infoSeriesList: infoSeriesList,
      infoDatasetList: infoDatasetList
    };
  };

  var createMainFilterVar = function createMainFilterVar(seriesList){
    var filterVar={};

    for(var i = 0; i<seriesList.length; i++){
      var serie = seriesList[i];
      if(filterVar[serie.dataset.name]==undefined)filterVar[serie.dataset.name]={};
      var elem = {};
      for(var j = 0; j<serie.dimensionsValues.length; j++){
        var dimensionKey = serie.dataset.keyFamily.dimensions[j];
        for(var dim in serie.dimensionsValues[j]){
          elem[dimensionKey.key]={};
          elem[dimensionKey.key].value = dim;
          elem[dimensionKey.key].positionInKey = dimensionKey.position;
        }
      }
    //SDW-673
      elem['UNIT']={};
      elem['UNIT'].value = serie.unitMult+'-'+serie.unit;

      filterVar[serie.dataset.name][serie.seriesKey]=elem;

    }

    return filterVar;
  };

  var createKfdimStruct = function createKfdimStruct(seriesList){
    var kfdimStruct={};

    for(var i = 0; i<seriesList.length; i++){
      var datasetName = seriesList[i].dataset.name;

      if(kfdimStruct[datasetName]===undefined)kfdimStruct[datasetName]={};

      if(kfdimStruct[datasetName]["concept"]===undefined){
        var concept = [];
        var dimensions = seriesList[i].dataset.keyFamily.dimensions;

        for(var j = 0; j<dimensions.length; j++){
          var elem = {};
          elem[dimensions[j].key]=dimensions[j].name;
          concept.push(elem);
        }
        kfdimStruct[datasetName]["concept"]=concept;
      }

      var dimensions = seriesList[i].dimensionsValues;
      for(var j = 0; j<dimensions.length; j++){
        for(var dim in dimensions[j]){
          if(kfdimStruct[datasetName]["data"]===undefined)kfdimStruct[datasetName]["data"]=[];

          if(kfdimStruct[datasetName]["data"][j]===undefined){
            var elem = {};
            elem[dim]=dimensions[j][dim];
            kfdimStruct[datasetName]["data"].push(elem);
          } else {
            kfdimStruct[datasetName]["data"][j][dim]=dimensions[j][dim];
          }
        }
      }
      kfdimStruct[datasetName]["datasetDescription"]=seriesList[i].dataset.description;
      kfdimStruct[datasetName]["keyFamily"]=seriesList[i].dataset.keyFamily.name;
      kfdimStruct[datasetName]["keyFamilyDescription"]=seriesList[i].dataset.keyFamily.description;
    }

    return kfdimStruct;
  };

  var ajaxDimension = function ajaxDimension(kfName, dimKey, dims, elem){
    return SdwServices.dimension(kfName, dimKey, dims).done(function(dimensions){
      elem[kfName][dimKey]=dimensions;
    });
  };

  var prepareTempElemForDim = function(seriesDetailedList, datasetList){
    var elemTemp = {};

    datasetListMap={};

    for(var j = 0; j<datasetList.length; j++){
      datasetListMap[datasetList[j].name]=datasetList[j];
    }

    //On boucle sur les série et les dataset pour trouver les correspondances
    for(var i = 0; i<seriesDetailedList.length; i++){
      var dataset = datasetListMap[seriesDetailedList[i].dataset];
      seriesDetailedList[i].dataset=dataset;

      //On boucle ensuite sur les clefs de dimensions pour créer les requêtes ajax et enrichir le seriesDetailedList
      for(var k = 0; k<dataset.keyFamily.dimensions.length; k++){
        var kfName = dataset.keyFamily.name;
        var kfDimKey = dataset.keyFamily.dimensions[k].key;

        if(elemTemp[kfName]===undefined)elemTemp[kfName]={};
        if(elemTemp[kfName][kfDimKey]===undefined)elemTemp[kfName][kfDimKey]={};
        elemTemp[kfName][kfDimKey][seriesDetailedList[i].dimensionsValues[k]]=true;
      }
    }

    return elemTemp;
  };

  //loader: le loader pour l'enrichir avec les dataset retournées en ajax
  //callback: fonction qui est exécuter à la fin de tous les appels ajax
  //Complete la liste des séries détaillées avec les détails des dataset
  var loadDataset = function(loader, callback){

    var that = loader;

    SdwServices.datasets(that.datasetList)
    .done(function(data){

      that.datasetDetailedList = data;
      that.datasetByName = {};
      that.keyFamilyByName = {};
      that.keyFamilyById = {};

      // recuperation de la liste des key family
      for (var i = 0; i < data.length; i++) {
        var ds = data[i];
        that.datasetByName[ds.name] = ds;

        var kfName = ds.keyFamily.name;
        var keyFamily = that.keyFamilyByName[kfName];
        if (!keyFamily) {
          keyFamily = ds.keyFamily;
          that.keyFamilyByName[kfName] = keyFamily;
          that.keyFamilyById[keyFamily.id] = keyFamily;
        }
      }

      //La liste des appels ajax des dimensions à exécuter en parallèle
      var calls = [];

      var elemTemp = prepareTempElemForDim(that.seriesDetailedList, data);

      for(var kfName in elemTemp){
        for(var dimKey in elemTemp[kfName]){
          var dims = [];
          for(var dim in elemTemp[kfName][dimKey]){
            dims.push(dim);
          }
          calls.push(ajaxDimension(kfName, dimKey, dims, elemTemp));
        }
      }

      //On attends la fin de toutes les requêtes ajax des dimensions pour renvoyer les seriesDetailedList à l'appelant.
      $.when.apply(this, calls)
      .done(function(){

      //SDW-673
        var units = [];
        var tabCalls = [];
        var doUnit = true;
        //Corresponding to max.display.data
        if(that.seriesDetailedList.length > 500){
          doUnit = false;
        }

            for(var i = 0; i<that.seriesDetailedList.length; i++){

              //SDW-673
              if(doUnit){
                tabCalls.push(loadUnits(that.seriesDetailedList[i], units));
              }

               var seriesDetails = that.seriesDetailedList[i];

                 var kf = seriesDetails.dataset.keyFamily;

                  for(var j = 0; j<kf.dimensions.length; j++){
                    var datapool = elemTemp[kf.name][kf.dimensions[j].key];

                    var dimensions={};
                    dimensions[seriesDetails.dimensionsValues[j]]=datapool[seriesDetails.dimensionsValues[j]];
                    seriesDetails.dimensionsValues[j] = dimensions;
                  }

            }
          //On attends la fin de toutes les requêtes ajax des unités pour renvoyer les seriesDetailedList à l'appelant.
            $.when.apply(this, tabCalls)
            .done(function(){

                 that.kfdimStruct = createKfdimStruct(that.seriesDetailedList);
                   //SDW-673
                 that.units = units;

                 that.mainFilterVar = createMainFilterVar(that.seriesDetailedList);

                 if(callback)callback(that);
           });
          });



    });
  };
 //SDW-673

  function loadUnits(seriesDetailed, units){

        return SdwServices.seriesMetadata(seriesDetailed.seriesKey).done(function(data){
          if(typeof(data.unit) != 'undefined' && typeof(data.unitMult!= 'undefined'))	{
	          seriesDetailed.unit = data.unit;
	          seriesDetailed.unitMult = data.unitMult;
	          seriesDetailed.buildUnitDescription = data.buildUnitDescription;
               var  element = {
                 unit :  data.unit,
                 unitDesc : data.unitDesc,
                 unitMult : data.unitMult,
                 unitMultDesc : data.unitMultDesc,
                 buildUnitDescription : data.buildUnitDescription
               };

               var found = false;
                 // gestion des doublons
                 for(var index = 0; index <units.length; index++){

                   if(typeof(element) != 'undefined'){

                          if(units[index].unit == element.unit && units[index].unitMult == element.unitMult){
                            found = true;
                            break;
                          }
                     }
                  }
                if(found == false && typeof(element) != 'undefined'){
                  units.push(element);

                }
          }

    });

  };
  var loadSeries = function loadSeries(seriesKeyList, loader, callback){

    var that = loader;
    var calls = [];

    var ajaxSerie = function ajaxSerie(serieKey){
      return SdwServices.seriesMetadata(serieKey).done(function(data){
        for(var j = 0; j<that.seriesDetailedList.length; j++){
          if(that.seriesDetailedList[j].seriesKey===data.seriesKey){

            for(var elem in data){
              if(that.seriesDetailedList[j][elem]===undefined){
                that.seriesDetailedList[j][elem]=data[elem];
              }
            }

            that.seriesDetailedList[j].completeSerie=true;

            break;
          }
        }
      });
    };

    for(var i = 0; i < seriesKeyList.length; i++){
      calls.push(ajaxSerie(seriesKeyList[i]));
    }

    $.when.apply(this, calls).done(function(){
      if(callback)callback(that.seriesDetailedList);
    });
  };

  return{
    kfdimStruct: undefined,
    seriesList: undefined,
    datasetList: undefined,
    seriesDetailedList: undefined,
    datasetDetailedList: undefined,
    datasetByName: undefined,
    keyFamilyByName: undefined,
    keyFamilyById: undefined,
    mainFilterVar: {},
    //SDW-673
    units :{},

    // Charge via ajax les données pour créer et enrichir kfdimStruct, seriesList et datasetList
    loadInfoNode: function(node, callback){

      var that = this;

      SdwServices.series({
        node: node,
        sk: SdwUrl.getParameters('sk')
      }).done(function(data){

        that.seriesDetailedList = data;

        var extractData = extractDatasetAndSeriesList(data);

        that.datasetList = extractData.infoDatasetList;
        that.seriesList = extractData.infoSeriesList;

        loadDataset(that, callback);
      });
    },

    loadInfoSeries: function(seriesKeyList, callback){
      var that = this;

      SdwServices.series({
        sk: seriesKeyList
      }).done(function(data){

        that.seriesDetailedList = clone(data);

        var extractData = extractDatasetAndSeriesList(data);

        that.datasetList = extractData.infoDatasetList;
        that.seriesList = extractData.infoSeriesList;

        loadDataset(that, callback);
      });
    },

    loadUncompleteSeries: function(seriesKeyList, callback){
      var that = this;
      var seriesToComplete = [];

      for(var i = 0; i<seriesKeyList.length; i++){
        for(var j = 0; j<that.seriesDetailedList.length; j++){
          if(that.seriesDetailedList[j].seriesKey===seriesKeyList[i] && !that.seriesDetailedList[j].completeSerie){
            seriesToComplete.push(seriesKeyList[i]);
          }
        }
      }

      loadSeries(seriesToComplete, that, callback);
    }

  };
})();