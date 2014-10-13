describe('test', function () {
    var $timeout, $scope, $compile, sandbox, elm, data;

    data = [
        {key: 'One', value: 1},
        {key: 'Two', value: 2},
        {key: 'Three', value: 3},
        {key: 'Four', value: 4},
        {key: 'Five', value: 5},
        {key: 'Six', value: 6}
    ];

    // Load Module
    beforeEach(module('angularChartSVG'));


    // Store references to $rootScope and $compile
    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $scope = _$rootScope_;
        $timeout = _$timeout_;
        sandbox = angular.element('<div id="sandbox"></div>');
    }));

    // Remove scope and sandbox
    afterEach(function () {
        sandbox.remove();
        $scope.$destroy();
    });

    function compileDirective(template) {
        angular.extend($scope, template.scope);
        var element = sandbox.append(angular.element(template.element));
        element = $compile(element)($scope);
        element.scope().$apply();
        $scope.$digest();
        return element;
    }

    it('Bar Chart: No Data', function () {
        var template = {
            element: '<bar-chart chart-data="data"></bar-chart>',
            scope: {}
        };

        elm = compileDirective(template);

        expect($(elm).children().length).toBe(1);
        expect($(elm).children()[0].tagName).toBe('BAR-CHART');
        expect($(elm).children().children().length).toBe(0);
    });

    it('Bar Chart: Number of Bars', function () {
        var template = {
            element: '<bar-chart chart-data="data"></bar-chart>',
            scope: { data: data}
        };

        elm = compileDirective(template);
        $timeout( function () {
//            console.log($(elm).find('.bars').children());

            expect($(elm).children().children()[0].tagName).toBe('svg');
            expect($(elm).find('.bars').children().length).toBe($scope.data.length);
        }, 500);

    });

    it('Bar Chart: No Chart Width Specified', function () {
        var template = {
            element: '<bar-chart chart-data="data"></bar-chart>',
            scope: { data: data}
        };

        elm = compileDirective(template);
            expect($(elm).children().children()[0].tagName).toBe('svg');
            expect($(elm).find('.bars').children().length).toBe($scope.data.length);

    });

});
