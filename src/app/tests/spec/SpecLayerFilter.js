require([
    'app/LayerFilter',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/LayerFilter', function () {
        var widget;
        var destroy = function (w) {
            w.destroyRecursive();
            w = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a LayerFilter', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
