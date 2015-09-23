require([
    'app/MapController'
], function (
    WidgetUnderTest
) {
    describe('app/MapController', function () {
        var widget;

        beforeEach(function () {
            widget = WidgetUnderTest;
        });

        afterEach(function () {
            if (widget) {
                widget = null;
            }
        });

        describe('setExpression', function () {
            it('should set visibility to false when no expression is set', function () {
                var layer = {
                    name: 'layer',
                    setDefinitionExpression: jasmine.createSpy('def'),
                    setVisibility: jasmine.createSpy('vis')
                };

                var filters = [{
                    expression: '',
                    layer: layer
                }];

                widget.filters = filters;

                widget.setExpression();

                expect(layer.setDefinitionExpression.calls.count()).toEqual(1);
                expect(layer.setVisibility.calls.count()).toEqual(1);
                expect(layer.setDefinitionExpression).toHaveBeenCalledWith('1=2');
                expect(layer.setVisibility).toHaveBeenCalledWith(false);
            });

            it('should set visibility to true when there is an expression is set', function () {
                var layer = {
                    name: 'layer',
                    setDefinitionExpression: jasmine.createSpy('def'),
                    setVisibility: jasmine.createSpy('vis'),
                    addEventListener: function () {}
                };
                var filters = [{
                    expression: 'a = b',
                    layer: layer
                }];

                widget.filters = filters;

                widget.setExpression();

                expect(layer.setDefinitionExpression.calls.count()).toEqual(1);
                expect(layer.setVisibility.calls.count()).toEqual(1);
                expect(layer.setDefinitionExpression).toHaveBeenCalledWith('a = b');
                expect(layer.setVisibility).toHaveBeenCalledWith(true);
            });

            it('should combine multiple expressions', function () {
                var layer = {
                    name: 'layer',
                    setDefinitionExpression: jasmine.createSpy('def'),
                    setVisibility: jasmine.createSpy('vis'),
                    addEventListener: function () {}
                };
                var filters = [{
                    expression: 'a = b',
                    layer: layer
                },{
                    expression: 'b = c',
                    layer: layer
                }];

                widget.filters = filters;

                widget.setExpression();

                expect(layer.setDefinitionExpression.calls.count()).toEqual(1);
                expect(layer.setVisibility.calls.count()).toEqual(1);
                expect(layer.setDefinitionExpression).toHaveBeenCalledWith('a = b AND b = c');
                expect(layer.setVisibility).toHaveBeenCalledWith(true);
            });

            it('should only use active filter expression', function () {
                var layer = {
                    name: 'layer',
                    setDefinitionExpression: jasmine.createSpy('def'),
                    setVisibility: jasmine.createSpy('vis'),
                    addEventListener: function () {}
                };
                var filters = [{
                    expression: '',
                    layer: layer
                },{
                    expression: 'b = c',
                    layer: layer
                }];

                widget.filters = filters;

                widget.setExpression();

                expect(layer.setDefinitionExpression.calls.count()).toEqual(1);
                expect(layer.setVisibility.calls.count()).toEqual(1);
                expect(layer.setDefinitionExpression).toHaveBeenCalledWith('b = c');
                expect(layer.setVisibility).toHaveBeenCalledWith(true);
            });

            it('should remove filters', function () {
                var layer = {
                    name: 'layer',
                    setDefinitionExpression: jasmine.createSpy('def'),
                    setVisibility: jasmine.createSpy('vis'),
                    addEventListener: function () {}
                };
                var filters = [{
                    expression: 'a = b',
                    layer: layer
                },{
                    expression: 'b = c',
                    layer: layer
                }];

                widget.filters = filters;

                widget.setExpression();

                widget.filters[0].expression = 'c = d';

                widget.setExpression();

                expect(layer.setDefinitionExpression.calls.count()).toEqual(2);
                expect(layer.setVisibility.calls.count()).toEqual(2);

                expect(layer.setDefinitionExpression.calls.argsFor(0)).toEqual(['a = b AND b = c']);
                expect(layer.setVisibility.calls.argsFor(0)).toEqual([true]);
                expect(layer.setDefinitionExpression.calls.argsFor(1)).toEqual(['c = d AND b = c']);
                expect(layer.setVisibility.calls.argsFor(1)).toEqual([true]);
            });
        });
    });
});
