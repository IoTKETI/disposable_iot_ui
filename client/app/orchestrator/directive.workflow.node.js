/**
 * [description]
 *
 *
 *
 *  Utilitiy service to help send and listen event between controllers
 *
 */
(function(){
  'use strict';

  angular
    .module('iotvtool')
    .directive('workflowNode', WorkflowNodeDirective)
    ;


  WorkflowNodeDirective.$inject = [];


  function WorkflowNodeDirective() {

    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        orchestrationId: '=',
        node: '=',
        fnInitNode: '=',
        fnDeleteNode: '=',
        fnDetailNode: '=',
      },
      templateUrl: './app/orchestrator/directive.workflow.node.html',
      link: function(scope, element, attrs, controller) {
        var position = scope.node.nodePosition;
        var style = {top: position.y, left: position.x};
        element.css(style);

        setTimeout( function(el, nodeObj) {
          scope.fnInitNode(el, nodeObj);
        }, 100, element, scope.node);
      }
    };
  }


})();
