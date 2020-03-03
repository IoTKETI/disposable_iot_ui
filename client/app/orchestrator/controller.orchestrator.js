(function() {
  'use strict';

  angular
    .module('iotvtool')
    .controller('orchestratorController', OrchestratorController)
  ;


  function RuleEditorDialogController($scope, source, target, link, $mdDialog ) {

    $scope.source = source;
    $scope.target = target;
    $scope.link = link;
    $scope.candidateValueMaps = {};

    if($scope.target.nodeData && $scope.target.nodeData.dataType == 'object') {
      var fieldNames = [];
      $scope.target.nodeData.restriction.map(function(item){
        fieldNames.push(item.name);
      });

      fieldNames.map(function(name){
        var ruleMap = $scope.link.rule.maps.find(function(map){
          return map.name == name;
        });

        if(ruleMap)
          $scope.candidateValueMaps[name] = __candidateValues(name, ruleMap.source, ruleMap.value);
      });
    }
    else {
      $scope.candidateValueMaps["__DEFAULT__"] = __candidateValues(null, $scope.link.rule.maps[0].source,  $scope.link.rule.maps[0].value );
    }

    function __candidateValues(name, source, value) {
      var result = {
        selected: 0,
        values: []
      };

      var sourceFieldsInfo = ($scope.source && $scope.source.nodeData && $scope.source.nodeData.dataType == 'object') ? $scope.source.nodeData.restriction : null;
      if(sourceFieldsInfo && sourceFieldsInfo.map) {
        sourceFieldsInfo.map(function(res) {
          result.values.push(
            {description: "입력필드("+res.name+") 전달", source: "SOURCE", value: res.name, __VALUE__: "SOURCE:" }
          );
        });
      }
      else {
        result.values.push(
          {description: "입력값을 전달", source: "SOURCE", value: "", __VALUE__: "SOURCE:" }
        );
      }

      if(!$scope.target.nodeData) {
        result.values.push( {description: "직접 입력", source: "INPUT", value: value, __VALUE__: "VALUE:1", needInput: true} );
      }
      else {
        if($scope.target.nodeData.dataType == "boolean") {
          result.values.push( {description: "참", source: "VALUE", value: "true"} );
          result.values.push( {description: "거짓", source: "VALUE", value: "false"} );
        }
        else  if($scope.target.nodeData.dataType == "object") {
          result.values.push( {description: "직접 입력", source: "INPUT", value: value, __VALUE__: "VALUE:1", needInput: true} );

          if($scope.target.nodeData.restriction) {

            var propertyRestriction = $scope.target.nodeData.restriction.find(function(item){
              return (item.name == name);
            });

            if(propertyRestriction) {
              propertyRestriction.restriction.map(function(value){
                result.values.push( {description: value, source: "VALUE", value: value} );
              });
            }
          }
        }
        else {
          result.values.push( {description: "직접 입력", source: "INPUT", value: value, __VALUE__: "VALUE:1", needInput: true} );

          if($scope.target.nodeData.restriction) {
            $scope.target.nodeData.restriction.map(function(value){
              result.values.push( {description: value, source: "VALUE", value: value} );
            });
          }
        }
      }

      result.selected = result.values.findIndex(function(item){
        if(item.source == "INPUT" && source == "INPUT")
          return true;

        return (item.source == source && item.value == value);
      });

      return result;
    }

    $scope.cancel = function() {
      $mdDialog.cancel(false);
    };

    $scope.delete = function() {

      $mdDialog.hide('delete');
    };

    $scope.create = function() {
      var names = Object.keys($scope.candidateValueMaps);
      names.map(function(name){

        var map = $scope.link.rule.maps.find(function(item){
          var realname = item.name || "__DEFAULT__";
          return realname == name;
        });

        var selected = $scope.candidateValueMaps[name].values[$scope.candidateValueMaps[name].selected];


        map.name = name == "__DEFAULT__" ? "" : name;
        map.source = selected.source;
        map.value = selected.value;
      });

      $mdDialog.hide('apply');
    };
  }


  function taskDetailDialogController($scope, $mdDialog, locals){

    var apiService;    
    $scope.init = function(){
      $scope.nodeId = locals.node.nodeId; 
      $scope.taskItem = locals.node.nodeData;
      $scope.apiService = locals.service;
      $scope.orchestrationId = locals.orchestrationId;      
    } 
    $scope.cancel = function(){
      $mdDialog.hide();
    }
    $scope.change = function(taskItem){
      $scope.apiService.updateTaskItem($scope.orchestrationId, $scope.nodeId, taskItem)
      .then((result)=>{
        $mdDialog.hide(result);
      })
      .catch((err)=>{
        console.log( err );
      })
    }
  }


  function orchestrationManagerDialogController($scope, $mdDialog, locals){

    $scope.init = function(){
      $scope.orchestrationList = angular.copy(locals);      
    }
    $scope.cancel = function(){
      $mdDialog.hide();
    }
    $scope.edit = function(item){
      $mdDialog.hide({act:'edit', item:item});
    }
    $scope.delete = function(item){
      $mdDialog.hide({act:'delete', item:item});
    }
  }


  function orchestrationCreateDialogController($scope, $mdDialog, locals){
  
    $scope.init = function(){
      $scope.orchestrationItem = angular.copy(locals);      
    }      
    $scope.cancel = function(){
      $mdDialog.cancel();
    }
    $scope.save = function(name){
      $scope.orchestrationItem.name = name;
      $mdDialog.hide($scope.orchestrationItem);
    }
  }


  OrchestratorController.$inject = ['$scope', '$state', '$stateParams', '$mdDialog', 'apiService', 'notificationService'];

  var SOURCE_ANCHOR = [1, 0.5, 1, 0, -20, 0];
  var TARGET_ANCHOR = [0, 0.5, -1, 0, 25, 0];
  var GRID_UNIT   = 30;

  function OrchestratorController($scope, $state, $stateParams, $mdDialog, apiService, notificationService) {    
    $scope.jsPlumbInstance = null; // workflow
    $scope.orchestrationId = $stateParams.orchestrationId;
    $scope.toggle = {};

    $scope.orchestrationColorList = [];
    window.COLOR_TYPE.map(function(item){
      $scope.orchestrationColorList.push({
        color: item.color,
        name: item.name
      });
    });

    $scope.formData = {
      color: $scope.orchestrationColorList[0].name,
      name: '',
      description: ''
    };

    $scope.init = _init;
    $scope.initNode = _initNode;
    $scope.deleteNode = _deleteNode;
    $scope.onDropComplete = _onDropComplete;
    // CATEGORY & TASK
    $scope.getCategoryList = _getCategoryList;
    $scope.getCategoryItem = _getCategoryItem;
    $scope.getTaskList = _getTaskList;
    $scope.getTaskItem = _getTaskItem;
    $scope.updateTaskItem = _updateTaskItem;
    $scope.showDetailViewDialog = _showDetailViewDialog;
    // ORCHESTRATION
    $scope.showOrchestrationManagerDialog = _showOrchestrationManagerDialog;
    $scope.showOrchestrationCreateDialog = _showOrchestrationCreateDialog;  
    $scope.showOrchestrationDeployDialog = _showOrchestrationDeployDialog; 


    // CATEGORY & TASK FUNCTIONS
    function _getCategoryList() {
      apiService.getCategoryList()
      .then(function(categoryList){
        $scope.$apply(function () {
          $scope.categoryList = categoryList;
        });
      }, function(err){
        console.log( err );
      });
    }

    function _getCategoryItem(categoryId) {
      apiService.getCategoryItem(taskId)
      .then(function(categoryItem){
        // TODO
      }, function(err){
        console.log( err );
      });
    }

    function _getTaskList() {
      apiService.getTaskList()
      .then(function(taskList){
        $scope.$apply(function () {
          $scope.taskList = taskList;
        });
      }, function(err){
        console.log( err );
      });
    }

    function _getTaskItem(taskId) {
      apiService.getTaskItem(taskId)
      .then(function(taskItem){
        // TODO
      }, function(err){
        console.log( err );
      });
    }

    function _updateTaskItem(orchestrationId, nodeId, taskItem) {
      apiService.updateTaskItem(orchestrationId, nodeId, taskItem)
      .then(function(taskItem){
        // TODO
      }, function(err){
        console.log( err );
      });
    }

    function _showDetailViewDialog($event, node) {
      // service, micro service는 상세정보 표시하지 않음 (김문섭 연구원)
      if (node.nodeData.type != 'Device')
        return;

      return $mdDialog.show({
        controller : taskDetailDialogController,
        templateUrl : './app/orchestrator/dialog.task.detail.html',
        targetEvent : $event,
        parent : angular.element('body'),
        clickOutsideToClose : true,
        locals : {
          orchestrationId : angular.copy($scope.orchestrationId),
          node : angular.copy(node),
          service : apiService
        }
      })
      .then(function(result){
        // update 
        if (result != undefined) {
          $scope.orchestrationItem = result;
        }       
      })
      .catch(function(err){
        if(err && err.status){
          console.error(err);
        }
      })
    }

    // ORCHESTRATION FUNCTIONS
    function _showOrchestrationManagerDialog($event) {
      // get orchestration list
      apiService.getOrchestrationList()
      .then(function(orchestrationList){        
        $mdDialog.show({
          controller : orchestrationManagerDialogController,
          templateUrl : './app/orchestrator/dialog.orchestration.manager.html',
          targetEvent : $event,
          parent : angular.element('body'),
          clickOutsideToClose : true,
          locals : orchestrationList
        })
        .then(function(result){          
          // success
          if (result.act == 'edit') {            
            __setOrchestrationItem(result.item);
          } else if (result.act == 'delete') {
            apiService.deleteOrchestrationItem(result.item.id)
          }
        })
        .catch(function(err){
          if(err && err.status){
            console.error(err);
          }
        })
      }, function(err){
        console.log( err );
      });
    }

    function _showOrchestrationCreateDialog($event) {       
      $mdDialog.show({
        controller : orchestrationCreateDialogController,
        templateUrl : './app/orchestrator/dialog.orchestration.confirm.html',
        targetEvent : $event,
        parent : angular.element('body'),
        clickOutsideToClose : true,
        locals : $scope.orchestrationItem
      })
      .then(function(item){          
        // success
        apiService.updateOrchestrationItem(item.id, item);
      })
      .catch(function(err){
        if(err && err.status){
          console.error(err);
        }
      })
    }  
    
    function _showOrchestrationDeployDialog($event) {  
      var item = $scope.orchestrationItem;     
      var confirm = $mdDialog.confirm()
      .title(`${item.name} 배포`)
      .textContent(`${item.name}을 클라우드에 저장하시겠습니까?`)
      .clickOutsideToClose(true)
      .ok('확인')
      .cancel('취소');

      $mdDialog.show(confirm)
        .then(function(result) {
          return apiService.deployOrchestrationItem(item);
        },  function(err){
          console.log( err );
        });    
    }

    function _showRuleEditorDialog($mdDialog, ev, source, target, link) {
      $mdDialog.show({
        controller: RuleEditorDialogController,
        templateUrl: './app/orchestrator/dialog.rule.editor.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals:{
          source: source,
          target: target,
          link: link
        }
      })
      .then(function(cmd) {
        if (cmd == 'apply') {
          var updateInfo = {
            nodes: $scope.orchestrationItem.nodes
          };

          apiService.updateOrchestrationItem($scope.orchestrationId, updateInfo)
            .then(function(){
          });
        }
        else if (cmd == 'delete') {
          var linkIndex = source.links.indexOf(link);
          if(linkIndex != -1) {
            source.links.splice(linkIndex, 1);
          }

          $scope.jsPlumbInstance.select({ source: source.nodeId, target: target.nodeId }).delete();

          var updateInfo = {
            nodes: $scope.orchestrationItem.nodes
          };

          apiService.updateOrchestrationItem($scope.orchestrationId, updateInfo)
            .then(function(){
              //$state.reload();
            });
        }
      })
      .catch(function(err){
        console.log( err );
      });
    }

    // WORKFLOW
    function _fitToGrid(p) {
      function _gridUnitValue(v) {
        return parseInt(v / GRID_UNIT) * GRID_UNIT;
      }

      return {x: _gridUnitValue(p.x), y: _gridUnitValue(p.y)};
    }

    function _getPageOffset(el, base) {
      if( ! base )
        base = el.documentElement;

      if( el == base )
        return {offsetLeft: 0, offsetTop: 0}

      var offsetParent = el;
      var offsetLeft = 0;
      var offsetTop = 0;
      while( offsetParent != null && offsetParent != base ) {
        offsetLeft += offsetParent.offsetLeft;
        offsetTop += offsetParent.offsetTop;

        offsetParent = offsetParent.offsetParent;
      }

      return {offsetLeft: offsetLeft, offsetTop: offsetTop};
    }

    function _getRelativeOffset(el, base) {

      if( ! base )
        base = el.documentElement;

      if( el == base )
        return {offsetLeft: 0, offsetTop: 0}

      var offsetParent = el;
      var offsetLeft = 0;
      var offsetTop = 0;
      while( offsetParent != null && offsetParent != base ) {
        offsetLeft += offsetParent.offsetLeft;
        offsetTop += offsetParent.offsetTop;

        offsetParent = offsetParent.offsetParent;
      }

      return {offsetLeft: offsetLeft, offsetTop: offsetTop};
    }

    function _getNodePosition(x, y, canvasElement, voElement, dragElement) {

      var offsetPosition = _getPageOffset(canvasElement); //  workspace div
      var offsetInNode = {offsetLeft: 0, offsetTop: 0};
      if(dragElement && false) {
        offsetInNode = _getRelativeOffset(dragElement, voElement); //  composing_vo , element
      }

      var position = {
        x: Math.max(0, x - offsetPosition.offsetLeft - (offsetInNode.offsetLeft)), // - offsetParent.offsetLeft,
        y: Math.max(0, y - offsetPosition.offsetTop - (offsetInNode.offsetTop))// - offsetParent.offsetTop
      };

      return _fitToGrid(position);
    }

    function __findNodeByID(nodeId) {
      var nodeList = $scope.orchestrationItem.nodes;

      var node = nodeList.find(function(item){
        if(item.nodeId == nodeId)
          return true;
        else
          return false;
      });

      return node;
    }
    
    function _deleteNode(node) {
      var indexOf = $scope.orchestrationItem.nodes.indexOf(node);

      $scope.orchestrationItem.nodes.splice(indexOf, 1);

      var updateInfo = {
        nodes: $scope.orchestrationItem.nodes
      };
      apiService.updateOrchestrationItem($scope.orchestrationId, updateInfo)
        .then(function(orchestrationItem){
          __setOrchestrationItem(orchestrationItem);
        })
    }

    function _initNode(el, nodeData) {
      el.data(nodeData);

      $scope.jsPlumbInstance.draggable(el, {
        grid:[GRID_UNIT,GRID_UNIT],
        start: function(event, ui) {
          //console.info('started dragging');
        },
        drag: function(event, ui) {
          //console.info('dragging...');
        },
        stop: function(event) {
          var nodeId = event.el.id;
          var node = __findNodeByID(nodeId);
          var position = _getNodePosition(event.e.clientX-event.e.offsetX, event.e.clientY-event.e.offsetY, event.el.offsetParent, event.el, event.e.toElement);
          node.nodePosition = position;
          /* nodes update */
          var updateInfo = {
            nodes: $scope.orchestrationItem.nodes
          };
          apiService.updateOrchestrationItem($scope.orchestrationId, updateInfo)
          .then(function(orchestrationItem){
            __setOrchestrationItem(orchestrationItem);
          })
        }
      });

      var inputLink = el[0].querySelector('.link-block.in');
      $scope.jsPlumbInstance.makeTarget(inputLink, {
        anchor: TARGET_ANCHOR, // "Left",
        //anchor: [0, 0.5, -1, 0, 10, -2], // "Left",
        endpoint: ['Dot', {radius: 1}],
        allowLoopback:false,
        dropOptions: {
          hoverClass: "drag-hover"
        },
        isTarget: true,
        filter: '.in-link',
        type: 'basic'
      });

      var outLink = el[0].querySelector('.link-block.out');
      $scope.jsPlumbInstance.makeSource(outLink, {
        anchor: SOURCE_ANCHOR, // 'Right', // [1,0.5, 1,0, -10,0], // "Right",
        //anchor: [1, 0.5, 1, 0, -10, -2], // 'Right', // [1,0.5, 1,0, -10,0], // "Right",
        endpoint: ['Dot', {radius: 1}],
        isSource: true,
        filter: '.out-link',
        type: 'basic'
      });
    }

    function __generateDefaultRule(sourceNode, targetNode) {
      var sourceType = (sourceNode.nodeType == "vo" && sourceNode.nodeData.dataType == "object") ? "O" : "P";
      var targetType = (targetNode.nodeType == "vo" && targetNode.nodeData.dataType == "object") ? "O" : "P";

      var maps = [];
      if(targetType == "O") {
        var targetFieldsInfo = targetNode.nodeData.restriction;
        targetFieldsInfo.map(function(res) {
          maps.push({
            name: res.name,
            source: "INPUT",
            value: ""
          });
        });
      }
      else if(sourceType == "P"){
        maps.push({
          name: "",
          source: "SOURCE",
          value: ""
        });
      }
      else {
        maps.push({
          name: "",
          source: "INPUT",
          value: ""
        });
      }

      return {
        type: sourceType + "to" + targetType,
        maps: maps
      }
    }

    function _onDropComplete(nodeType, nodeData, x, y) {
      if(!nodeType)
        return;

      var position = {
        x: x, y: y
      };
      position = _fitToGrid(position);

      var node = {
        nodeId: shortid.gen(),
        nodeType: nodeType,
        nodeData: nodeData,
        nodePosition: position
      };

      $scope.orchestrationItem.nodes.push(node);

      /* nodes update */
      var updateInfo = {
        nodes: $scope.orchestrationItem.nodes
      };
      apiService.updateOrchestrationItem($scope.orchestrationId, updateInfo)
      .then(function(orchestrationItem){
        __setOrchestrationItem(orchestrationItem);
      })
    }


    // ORCHESTRATOR FUNCTIONS
    function _init() {
      // Category & Task 목록 획득 및 적용
      apiService.getCategoryList()
        .then(function(categoryList){
          $scope.$apply(function () {
            $scope.categoryList = categoryList;
          });
        }, function(err){
          console.log( err );
        });

      // JSPlumb START ///////////////////////////////////////////////
      __initJSPlumbInstance();

      jsPlumb.ready(function() {
        var container = document.getElementById('orchestrator-workspace');
        $scope.jsPlumbInstance.setContainer(container);

        // create default orchestration item
        var orchestrationItem = {
          "color": "bluejeans",
          "name": "default",
          "description": "",
        };
        orchestrationItem.nodes = [];

        apiService.createOrchestrationItem(orchestrationItem)
          .then((defaultItem)=> {
            __setOrchestrationItem(defaultItem);
          })
          .catch(function(ex){
            notificationService.showErrorMessage(ex);
          });
      });
    }


    // LOCAL FUNCTIONS
    function __setOrchestrationItem(item) {

      setTimeout(function() {
        // delete every Endpoint in workspace
        $scope.jsPlumbInstance.deleteEveryEndpoint();
        // set orchestration item
        $scope.$apply(function(){
          $scope.orchestrationItem = item;
          $scope.orchestrationId = item.id;

          setTimeout(function() {
            $scope.orchestrationItem.nodes.map(function(node){

              if(!node.links)
                return;
    
              node.links.map(function(link){
                var sourceEl = document.getElementById(node.nodeId);
                var targetEl = document.getElementById(link.to);
    
                var connection = $scope.jsPlumbInstance.connect( {
                  id: link.linkId,
                  source: sourceEl,
                  target: targetEl,
                  deleteEndpointsOnDetach:false,
                  anchors:[SOURCE_ANCHOR, TARGET_ANCHOR], // 'Right', 'Left']
                  overlays: [
                    ["Custom", {
                      create: function(component) {
                        return $('<div><div class="connection-overlay"> </div></div>')[0];
                      },
                      location: 0.5,
                      id: link.linkId
                    }],
                    ["Arrow", {
                      width:15, length:15, location:1
                    }]
                  ]
                });
    
                if(connection) {
                  connection.bind('click', function(jp, event){
    
                    var targetNode = __findNodeByID(link.to);
                    _showRuleEditorDialog($mdDialog, event, node, targetNode, link);
                  });
                }
              });
            });
          }, 100);
        });
      }, 100);
    }

    function __initJSPlumbInstance() {
      /**
       * init workflow canvas & metadata
       */
      var jsPlumbInstance = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 1}],
        Connector: ['Flowchart', {stub:40, cornerRadius:20}],
        PaintStyle: {stroke: "#7caddb", strokeWidth: 2 },
        HoverPaintStyle: {stroke: "#EB7D3C", strokeWidth: 4 },
        LogEnabled: false,
        ConnectionOverlays: [
          ["Custom", {
            create: function(component) {
              return $('<div><div class="connection-overlay"> </div></div>')[0];
            },
            location: 0.5
          }],
          ["Arrow", {
            width:12, length:12, location:1
          }]
        ]
      });

      $scope.jsPlumbInstance = jsPlumbInstance;
      $scope.jsPlumbInstance.registerConnectionType("default", {
        paintStyle:{ stroke:"#7caddb", strokeWidth:2  },
        hoverPaintStyle:{ stroke:"#EB7D3C", strokeWidth:4 }
      });

      $scope.jsPlumbInstance.registerEndpointTypes({
        "basic":{
          paintStyle:{fill:"#7caddb", width:"2px", height:"2px"}
        },
        "selected":{
          paintStyle:{fill:"#7caddb"}
        }
      });

      $scope.jsPlumbInstance.bind('connection', function(info, originalEvent) {

        function __getConnectionNodeId(anchorId) {
          return anchorId.split('.')[1];
        }

        var sourceNodeId = __getConnectionNodeId(info.sourceId);
        var targetNodeId = __getConnectionNodeId(info.targetId);

        var sourceNode = __findNodeByID(sourceNodeId);
        var targetNode = __findNodeByID(targetNodeId);

        var rule = __generateDefaultRule(sourceNode, targetNode);

        var link =  {
          linkId: shortid.gen(),
          to: targetNodeId,
          rule: rule
        };

        if(!sourceNode.links)
          sourceNode.links = [];
        sourceNode.links.push(link);

        info.connection.bind('click', function(jp, event){
          _showRuleEditorDialog($mdDialog, event, sourceNode, targetNode, link);
        });
      });

      $scope.jsPlumbInstance.bind('beforeDrop', function(info) {
        return true;
      });
    }
  }

})();

