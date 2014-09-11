// angularChartsSVG
// author: Justin Poehnelt

'use strict';

angular.module('angularChartSVG', [])
    .directive('barChart', function ($window, $timeout) {
        var defaults = {
            barHeight: 20,
            barGap: 2,
            barAnimate: true,
            barAnimateDuration: '0.5s',
            label: true,
            labelPadding: 5,
            labelAlign: 'left'
        };

        function applyDefaults(scope, elem) {
            for (var key in defaults) {
                if (key !== 'barHeight' && defaults.hasOwnProperty(key)) {
                    if (scope[key] === undefined) {
                        scope[key] = defaults[key];
                    }
                }
            }
        }

        function getValue(data, func) {
            if (func) {
                return func(data);
            } else if (data.value) {
                return data.value;
            } else {
                return 0;
            }
        }

        function getLabel(data, func) {
            if (func) {
                return func(data);
            } else if (data.key) {
                return data.key;
            } else {
                return '';
            }
        }

        function intToHexStr(int) {
            // return two byte hex string
            var str = int.toString(16);
            if (str.length === 1) {
                str = '0' + str;
            }
            return str;
        }

        function buildColorArray(colors, count) {
            var r, g, b, rStart, gStart, bStart, colorArray = [];
            if (colors instanceof Array && colors.length === 2) {
                rStart = parseInt(colors[0].slice(1, 3), 16);
                gStart = parseInt(colors[0].slice(3, 5), 16);
                bStart = parseInt(colors[0].slice(5), 16);

                r = Math.round((parseInt(colors[1].slice(1, 3), 16) - rStart) / (count - 1));
                g = Math.round((parseInt(colors[1].slice(3, 5), 16) - gStart) / (count - 1));
                b = Math.round((parseInt(colors[1].slice(5), 16) - bStart) / (count - 1));

                for (var i = 0; i < count; i++) {
                    colorArray.push('#' + intToHexStr(rStart + (r * i)) + intToHexStr(gStart + (g * i)) + intToHexStr(bStart + (b * i)));

                }
                return colorArray;
            }
        }

        function getColor(colors, i, numBars) {
            if (colors === undefined || colors[i] === undefined) {
                return '#312C22';
            } else if (colors instanceof Array) {
                return colors[i];
            } else {
                return colors;
            }

        }

        function buildChart(scope, elem) {
            // svg elements need document.createElementNS()
            var svgNS = "http://www.w3.org/2000/svg",
                svg,
                chartHeightActual,
                chartWidthActual,
                barEvents,
                barGroup,
                labelGroup,
                bar,
                barHeightTotal,
                label,
                labelXPos,
                labelTextAnchor,
                barMaxValue,
                animate,
                colors;

            if (scope.chartData === undefined || scope.chartData.length === 0) {
                angular.element(elem[0]).html('');
                return;
            }

            // Apply Defaults
            applyDefaults(scope, elem);
            colors = buildColorArray(scope.barColors, scope.chartData.length);

            //////////////////////////
            // Do Some Calculations //
            //////////////////////////

            // Chart Width
            if (scope.chartWidth === undefined || scope.chartWidth === null) {
                // try using jquery for more accurate width
                try {
                    chartWidthActual = elem.parent().width(); // jquery
                }
                catch (e) {
                    console.log('Warning: bar chart does not account for padding of parent element, ' +
                        'use jquery for more accurate width or wrap in 100% div')
                    // doesn't account for padding
                    chartWidthActual = elem.parent()[0].offsetWidth; // jqlite
                    // cannot read computed padding using jqlite:
                    // https://github.com/angular/angular.js/pull/8161 - no plans to include
                }
            } else {
                chartWidthActual = scope.chartWidth;
            }

            // Bar Total Height and Chart Height
            // No bar height set, chart height is set
            if ((scope.barHeight === undefined || scope.barHeight === null ) && scope.chartHeight) {
                if (scope.barAxis) {
                    barHeightTotal = parseInt(scope.chartHeight / (scope.chartData.length + 1), 10);
                } else {
                    barHeightTotal = parseInt(scope.chartHeight / scope.chartData.length, 10);
                }
                chartHeightActual = scope.chartHeight;

            } // No Chart Height Set
            else if (scope.chartHeight === undefined || scope.chartHeight === null) {
                barHeightTotal = (scope.barHeight || defaults.barHeight) + scope.barGap;
                if (scope.barAxis) {
                    chartHeightActual = (scope.chartData.length + 1) * barHeightTotal;
                } else {
                    chartHeightActual = (scope.chartData.length) * barHeightTotal;
                }
            } // Both Set
            else {
                console.log("Warning: Using bar height and chart height is not recommended. ")
                barHeightTotal = (scope.barHeight || defaults.barHeight) + scope.barGap;
                chartHeightActual = scope.chartHeight;
            }

            // Need Maximum Value for Width of Bars
            barMaxValue = 0;
            for (var i = 0; i < scope.chartData.length; i++) {
                var val = getValue(scope.chartData[i], scope.barValue);
                if (val > barMaxValue) {
                    barMaxValue = val;
                }
            }

            // Figure Out Label Placement
            if (scope.labelAlign === 'right') {
                labelTextAnchor = 'end';
                labelXPos = '99%';
//                labelXPos = scope.chartWidth - scope.labelPadding;
            } else if (scope.labelAlign === 'middle') {
                labelTextAnchor = 'middle';
                labelXPos = scope.chartWidth / 2;
            } else {
                labelTextAnchor = 'start';
                labelXPos = scope.labelPadding;
            }

            //////////////////////////////
            // Start Building SVG Chart //
            //////////////////////////////

            // Empty the element
            angular.element(elem[0]).html('');

            // Chart Events //
            if (scope.chartEvents && scope.chartEvents.chart) {
                var chartEvents;
                for (var key in scope.chartEvents.chart) {
                    if (scope.chartEvents.chart.hasOwnProperty(key)) {
                        chartEvents += key + ' ';
                    }
                }
                // Bind Chart Events
                elem.bind(chartEvents, function (e) {
                    try {
                        e.preventDefault();
                        scope.chartEvents.chart[e.type](e);
                    }
                    catch (exception) {
                        console.log('Error: ' + String(exception) + ' Event: ' + e.type);
                    }
                });
            }
            // Bar Events //
            if (scope.chartEvents && scope.chartEvents.bar) {
                var barEvents = '';
                for (var key in scope.chartEvents.bar) {
                    if (scope.chartEvents.bar.hasOwnProperty(key)) {
                        barEvents += key + ' ';
                    }
                }
            }


            // Create the svg element
            svg = angular.element(document.createElementNS(svgNS, "svg"));
            svg.attr('width', '100%');
            svg.attr('height', chartHeightActual);

            // Groupings for Chart Bars and Labels
            barGroup = angular.element(document.createElementNS(svgNS, "g"));
            barGroup.attr('class', 'bars');
            if (scope.label) {
                labelGroup = angular.element(document.createElementNS(svgNS, "g"));
                labelGroup.attr('fill', 'white');
                labelGroup.attr('class', 'labels');
            }

            // Iterate Data and Create Bars, Labels
            for (var i = 0; i < scope.chartData.length; i++) {
                var value = getValue(scope.chartData[i], scope.barValue);
                var from = 0,
                    to = (getValue(scope.chartData[i], scope.barValue) / barMaxValue * 100).toString() + '%';
                // Bar
                bar = angular.element(document.createElementNS(svgNS, "rect"));
                bar.attr('id', 'chart-' + Math.random().toString(36).substring(7) + '-' + i.toString(10))
                bar.attr('x', from);
                bar.attr('y', i * barHeightTotal + 1);
                bar.attr('width', to);
                bar.attr('height', barHeightTotal - scope.barGap);
                bar.attr('fill', getColor(colors, i, scope.chartData.length));

                // Bind Bar Events
                if (barEvents) {
                    bar.bind(barEvents, function (e) {
                        var id = e.target.id.split('-')[2];
                        e.preventDefault();
                        try {
                            scope.chartEvents.bar[e.type](e, id, scope.chartData[id]);
                        }
                        catch (exception) {
                            console.log('Error: ' + String(exception) + ' Event: ' + e.type);
                        }
                    });
                }


                // Animation Settings
                if (scope.barAnimate) {
                    animate = angular.element(document.createElementNS(svgNS, "animate"));
                    // jquery doesn't play nice with camelCase attributes in svg
                    animate[0].setAttribute('attributeName', 'width');
                    animate.attr('from', from);
                    animate.attr('to', to);
                    animate.attr('dur', scope.barAnimateDuration);
                    bar.append(animate);
                }
                // Add Bar to Group
                barGroup.append(bar);

                // Labels if desired
                if (scope.label) {
                    label = angular.element(document.createElementNS(svgNS, "text"));
                    label.attr('alignment-baseline', 'middle');
                    label.attr('text-anchor', labelTextAnchor);
                    label.attr('x', labelXPos);
                    label.attr('y', parseInt(i * barHeightTotal + (barHeightTotal - scope.barGap) / 2 + 2), 0);
                    label.html(getLabel(scope.chartData[i], scope.labelValue));
                    labelGroup.append(label);
                }
            }
            // Append Groupings to SVG
            svg.append(barGroup);
            if (labelGroup) {
                svg.append(labelGroup);
            }

            // Axis
            if (scope.barAxis) {
                var axis,
                    tick,
                    tickCount = 4,
                    tickLabel,
                    tickX,
                    tickY,
                    tickHeight,
                    tickWidth = 2,
                    intervals = barMaxValue / tickCount,
                    digits = barMaxValue.toString(10).length,
                    tickValue;

                // Create Axis Group
                axis = angular.element(document.createElementNS(svgNS, "g"));
                axis.attr('class', 'axis');

                for (var i = 0; i <= tickCount; i++) {
                    // Create Axis Tick and Label
                    tick = angular.element(document.createElementNS(svgNS, "rect"));
                    tickLabel = angular.element(document.createElementNS(svgNS, "text"));

                    // Calculate Positions
                    tickValue = Math.floor(i * intervals / Math.pow(10, digits - 2)) * (Math.pow(10, digits - 2));
                    tickX = (tickValue / barMaxValue * 100).toString() + '%';
                    tickY = chartHeightActual - barHeightTotal + scope.barGap;
                    tickHeight = parseInt(barHeightTotal / (tickCount + 1), 10);

                    // Apply Attributes to tick
                    tick.attr('x', tickX);
                    tick.attr('y', tickY);
                    tick.attr('width', tickWidth);
                    tick.attr('height', tickHeight);

                    // Apply Attributes to tickLabel
                    tickLabel.attr('x', tickX);
                    tickLabel.attr('y', tickY + tickHeight);
                    tickLabel.attr('alignment-baseline', 'hanging');
                    tickLabel.attr('text-anchor', 'middle');
                    tickLabel.html(tickValue.toString(10));

                    // First tick label needs to be moved inside
                    if (i == 0) {
                        tickLabel.attr('text-anchor', 'start');
                    }

                    // Last tick cannot be at 100% of width since origin is top left of rect
                    if (i === tickCount) {
                        tick.attr('transform', 'translate(-' + tickWidth.toString(10) + ',0)');
                        tickLabel.attr('text-anchor', 'end');
                    }

                    // Add tick to axis
                    axis.append(tick);
                    axis.append(tickLabel)
                }

                // Horizontal Part
                tick = angular.element(document.createElementNS(svgNS, "rect"));
                tick.attr('x', 0);
                tick.attr('y', chartHeightActual - barHeightTotal + scope.barGap);
                tick.attr('width', '100%');
                tick.attr('height', 1);
                axis.append(tick);
                svg.append(axis);

            }

            // Append to Element
            elem.append(svg);
        }


        return {
            restrict: 'E',
            scope: {
                chartData: '=chartData',
                chartWidth: '=?',
                chartHeight: '=?',
                chartEvents: '=chartEvents',
                barGap: '=?',
                barHeight: '=?',
                barAnimate: '@',
                barAnimateDuration: '@',
                barValue: '=?',
                barColors: '=?',
                barAxis: '=?',
                label: '=?',
                labelValue: '=?',
                labelText: '&',
                labelAlign: '=?',
                labelPadding: '=?'
            },
            link: function (scope, elem, attrs) {
                var dataWatchPromise;

//                buildChart(scope, elem);

                scope.$watch('chartData', function (value) {
                    if (dataWatchPromise) {
                        $timeout.cancel(dataWatchPromise);
                    }
                    dataWatchPromise = $timeout(function () {
                        buildChart(scope, elem);
                    }, 300);
                }, true);

                scope.$on('charts.redraw', function (e) {
                    buildChart(scope, elem);
                });
            }
        };
    });
