angular.module('angularChartSVG', [])
    .directive('barChart', function () {
        'use strict';
        var defaults = {
            barHeight: 20,
            barGap: 2,
            barAnimate: true,
            barAnimateDuration: '0.5s',
            label: true,
            labelPadding: 5,
            labelAlign: 'left'
        };

        function applyDefaults(scope) {
            for (var key in defaults) {
                if (key !== 'barHeight' && defaults.hasOwnProperty(key)) {
                    if (scope[key] === undefined) {
                        scope[key] = defaults[key];
                    }
                }
            }
        }

        function barVerticalHeight(numBars, barHeight, barGap, chartHeight) {
            // if no bar height specified
            if (barHeight === undefined || barHeight === null && chartHeight) {
                return parseInt(chartHeight / numBars, 0);
            }
            return (barHeight || defaults.barHeight) + barGap;
        }

        function buildChart(scope, elem) {
            // svg elements need document.createElementNS()
            var svgNS = "http://www.w3.org/2000/svg",
                svg,
                barGroup,
                labelGroup,
                bar,
                barHeightTotal,
                label,
                labelXPos,
                labelTextAnchor,
                barMaxWidth,
                animate;

            // Empty the element
            angular.element(elem[0]).html('');
            // Create the svg element
            svg = angular.element(document.createElementNS(svgNS, "svg"));
            svg.attr('width', scope.chartWidth);
            svg.attr('height', scope.chartHeight);

            // Apply Defaults
            console.log(scope);
            applyDefaults(scope);
            console.log(scope);

            // Groupings for Chart Bars and Labels
            barGroup = angular.element(document.createElementNS(svgNS, "g"));
            barGroup.addClass('bars');
            if (scope.label) {
                labelGroup = angular.element(document.createElementNS(svgNS, "g"));
                labelGroup.attr('fill', 'white');
                labelGroup.addClass('labels');
            }

            // Get Bar Height with Gap
            barHeightTotal = barVerticalHeight(scope.chartData.length, scope.barHeight, scope.barGap, scope.chartHeight);
            barMaxWidth = 0;
            for (var i = 0; i < scope.chartData.length; i++) {
                if (scope.chartData[i].value > barMaxWidth) {
                    barMaxWidth = scope.chartData[i].value;
                }
            }

            // Figure Out Label Placement
            if (scope.labelAlign === 'right') {
                console.log('align right');
                labelTextAnchor = 'end';
                labelXPos = scope.chartWidth - scope.labelPadding;
            } else if (scope.labelAlign === 'middle') {
                console.log('align middle');

                labelTextAnchor = 'middle';
                labelXPos = scope.chartWidth / 2;
            } else {
                labelTextAnchor = 'start';
                labelXPos = scope.labelPadding;
            }

            // Iterate Data and Create Bars, Labels
            for (var i = 0; i < scope.chartData.length; i++) {
                var from = 0,
                    to = scope.chartData[i].value / barMaxWidth * scope.chartWidth;
                // Bar
                bar = angular.element(document.createElementNS(svgNS, "rect"));
                bar.attr('x', from);
                bar.attr('y', i * barHeightTotal);
                bar.attr('width', to);
                bar.attr('height', barHeightTotal - scope.barGap);
                bar.attr('fill', '#cccccc');
                if (scope.barAnimate) {
                    animate = angular.element(document.createElementNS(svgNS, "animate"));
                    animate.attr('attributeName', 'width');
                    animate.attr('from', from);
                    animate.attr('to', to);
                    animate.attr('dur', scope.barAnimateDuration);
                    bar.append(animate);
                }


                barGroup.append(bar);

                // Labels if desired
                if (scope.label) {
                    label = angular.element(document.createElementNS(svgNS, "text"));
                    label.attr('alignment-baseline', 'middle');
                    label.attr('text-anchor', labelTextAnchor);
                    label.attr('x', labelXPos);
                    label.attr('y', parseInt(i * barHeightTotal + scope.barHeight / 2), 0);
                    label.html(scope.chartData[i].key);
                    labelGroup.append(label);
                }
            }
            // Append Groupings to SVG
            svg.append(barGroup);
            if (labelGroup) {
                svg.append(labelGroup);
            }

            // Append to Element
            elem.append(svg);
        }


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
                labelAlign: '=?',
                labelPadding: '=?',
                chartEvents: '=?'

            },
            link: function (scope, elem, attrs) {
                buildChart(scope, elem);
                scope.$watch('chartData', function (value) {
                    buildChart(scope, elem);
                }, true);
                scope.$on('charts.redraw', function (e) {
                    buildChart(scope, elem);

                });
            }

        };
    });