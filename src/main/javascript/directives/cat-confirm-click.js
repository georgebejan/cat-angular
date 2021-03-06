'use strict';
angular.module('cat')
    .directive('catConfirmClick', function CatConfirmClickDirective() {
        return {
            restrict: 'A',
            link: function CatConfirmClickLink(scope, element, attr) {
                var msg = attr.catConfirmClick || 'Are you sure?';
                var clickAction = attr.catOnConfirm;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction);
                    }
                });
            }
        };
    });
