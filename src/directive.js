angular.module('angularChartSVG', [])
    .directive('barChart', function ($compile) {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                chartData: '=chartData',
                chartWidth: '=chartWidth',
                chartHeight: '=chartHeight',
                barGap: '=?',
                barHeight: '=?',
                barAnimate: '@',
                barAnimateDuration: '@',
                barValue: '&',
                label: '=?',
                labelText: '&',
                labelAlign: '@',
                labelPadding: '=?',
                chartEvents: '=?'

            },
            link: function (scope, elem, attrs) {
                // Defaults
                scope.barAnimate = scope.barAnimate || false;
                scope.barAnimateDuration = scope.barAnimateDuration || '0.5s';
                scope.barHeight = scope.barHeight || 20;
                scope.barGap = scope.barGap || 1;
                scope.label = scope.label || true;
                scope.labelPadding = scope.labelPadding || 5;
                scope.labelAlign = scope.labelAlign || 'right';

                function alignLabels() {
                    // Label Float
                    if (scope.labelAlign === 'right') {
                        scope.labelTextAnchor = 'end';
                        scope.labelXPos = scope.chartWidth - scope.labelPadding;
                    } else if (scope.labelAlign === 'center') {
                        scope.labelTextAnchor = 'middle';
                        scope.labelXPos = scope.chartWidth / 2;
                    } else {
                        scope.labelTextAnchor = 'start';
                        scope.labelXPos = scope.labelPadding;
                    }
                }

                function getMaxValue() {
                    scope.maxValue = 0;
                    for (var i = 0; i < scope.chartData.length; ++i) {
                        if (scope.chartData[i].value > scope.maxValue) {
                            scope.maxValue = scope.chartData[i].value;
                        }
                    }
                }


                function buildChart() {
                    console.log(elem);
                }


                // Init
                console.log(scope);
                alignLabels();
                getMaxValue();

                // Watch/Observe Attributes
                attrs.$observe('chartWidth', function (newValue) {
                    getMaxValue();
                });
                scope.$watch('labelPadding', function (newValue) {
                    alignLabels();
                });
                scope.$watch('chartData', function (value) {
                    getMaxValue();
                }, true);


            },
            templateUrl: function (element, attr) {
                return attr.templateUrl || '../templates/barchart.html';
            }

        };
    });