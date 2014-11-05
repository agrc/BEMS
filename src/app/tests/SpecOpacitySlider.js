require([
    'app/OpacitySlider',
    'app/config',

    'dojo/_base/window',

    'dojo/dom-construct',

    'matchers/Topics'
], function(
    WidgetUnderTest,
    config,

    win,

    domConstruct,

    topics
) {
    describe('app/OpacitySlider', function() {
        var widget;
        var destroy = function(widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a OpacitySlider', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('Topics', function() {
            beforeEach(function() {
                topics.listen(config.topics.map.layerOpacity);
            });

            it('publishes a topic with the new opaity when the slider changes', function() {
                widget.notifyMap(1);
                expect(config.topics.map.layerOpacity).toHaveBeenPublishedWith(1);
            });
        });
    });
});