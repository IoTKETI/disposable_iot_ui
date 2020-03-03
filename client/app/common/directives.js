(function() {
  'use strict';

  angular
    .module('iotvtool')
    .directive('dragToMove', DragToMoveDirective)
    .directive('oneKeyEnter', OnKeyEnterDirective)

    .directive('orchestratorDraggableNode', OrchestratorDraggableNodeDirective)
    .directive('orchestratorDroppablePanel', OrchestratorDroppablePanelDirective)
  ;


  DragToMoveDirective.$inject = ['$document'];

  function DragToMoveDirective($document) {
    var directive = {
      restrict: 'A',
      scope: {
        position: '=',
        onDragStart: '=',
        onDragEnd: '=',
        objectId: '@',
        trashCanId: '@',
        onDropOnTrashCan: '='
      },
      link: link
    }
    return directive;

    function link(scope, element, attr) {
      var startX = 0, startY = 0, x = scope.position.x || 0, y = scope.position.y || 0;
      var offsetParent = element[0].offsetParent;
      var offsetParentWidth = offsetParent ? offsetParent.clientWidth : 1000, offsetParentHeight = offsetParent ? offsetParent.clientHeight : 1000;

      var trashCan = null;
      var trashCanBox = null;
      var deleteOnDrop = false;
      if(scope.trashCanId) {
        trashCan = $document.find('#' + scope.trashCanId);
        var offset = trashCan.offset();
        trashCanBox = {
          left: trashCan[0].offsetLeft,
          top: trashCan[0].offsetTop - 40,
          right: offset.left + trashCan.width(),
          bottom: offset.top + trashCan.height() + 40
        };
      }

      element.css({
        cursor: 'pointer',
        position: 'absolute'
      });

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);

        offsetParent = element[0].offsetParent;
        offsetParentWidth = offsetParent ? offsetParent.clientWidth : 1000;
        offsetParentHeight = offsetParent ? offsetParent.clientHeight : 1000;

        if(scope.onDragStart) {
          scope.onDragStart(scope.objectId);
        }
      });

      function __dragOverTrashCan(x, y) {
        if(!trashCanBox)
          return false;

        if(x > trashCanBox.left && x < trashCanBox.right && y > trashCanBox.top && y < trashCanBox.bottom )
          return true;
        else
          return false;
      }

      function mousemove(event) {
        y = Math.min(offsetParentHeight-element[0].clientHeight-10, Math.max( 10, event.pageY - startY ));
        x = Math.min(offsetParentWidth-element[0].clientWidth-10, Math.max( 10, event.pageX - startX ));

        element.css({
          top: y + 'px',
          left:  x + 'px'
        });

        if(trashCan) {
          if (__dragOverTrashCan(x, y)) {
            trashCan.addClass('over');
            deleteOnDrop = true;
          }
          else {
            trashCan.removeClass('over');
            deleteOnDrop = false;
          }
        }


      }

      function mouseup() {

        if(deleteOnDrop) {
          if(scope.onDropOnTrashCan) {
            scope.onDropOnTrashCan(scope.objectId);
          }

          trashCan.removeClass('over');
        }
        else if(scope.onDragEnd) {
          scope.onDragEnd(x, y, scope.objectId);
        }

        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }
    }
  }



  function OnKeyEnterDirective() {
    var directive = {
      restrict: 'A',
      link: link
    }
    return directive;

    function link(scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.onKeyEnter);
          });

          event.preventDefault();
        }
      });
    }
  }


  function OrchestratorDraggableNodeDirective() {

    return {
      restrict: 'A',
      scope: {
        nodeType: "=",
        nodeData: "="
      },
      link: function (scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
          'dragstart',
          function (e) {
            var node =  {
              nodeType: scope.nodeType,
              nodeData: scope.nodeData
            };

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json+keti-iotvtool-orchestrator-item', JSON.stringify(node));
            this.classList.add('drag');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragend',
          function (e) {
            this.classList.remove('drag');
            return false;
          },
          false
        );
      }
    }
  }

  function OrchestratorDroppablePanelDirective() {
    return {
      scope: {
        drop: '&',
        bin: '='
      },
      link: function(scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
          'dragover',
          function(e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');

            return false;
          },
          false
        );

        el.addEventListener(
          'dragenter',
          function(e) {
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragleave',
          function(e) {
            this.classList.remove('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'drop',
          function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();

            this.classList.remove('over');

            var node = e.dataTransfer.getData('application/json+keti-iotvtool-orchestrator-item')
            node = JSON.parse(node);

            // call the passed drop function
            scope.$apply(function(scope) {
              var fn = scope.drop();
              if ('undefined' !== typeof fn) {
                fn(node.nodeType, node.nodeData, e.offsetX, e.offsetY);
              }
            });

            return false;
          },
          false
        );
      }
    }
  }


})();
