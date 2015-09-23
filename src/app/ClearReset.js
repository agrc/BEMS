define([
    'app/MapController',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/text!app/templates/ClearReset.html',
    'dojo/_base/declare'
], function (
    MapController,

    registry,
    _TemplatedMixin,
    _WidgetBase,

    domClass,
    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Clears all the filters and resets the map selections/extent
        templateString: template,
        baseClass: 'clear-reset',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.ClearReset::postCreate', arguments);

            this.inherited(arguments);
        },
        clear: function () {
            // summary:
            //      wire events, and such
            console.log('app.ClearReset::clear', arguments);

            var activeFilters = this.layerFilters.filter(function (filter) {
                return filter.selectNode.selectedIndex !== 0;
            });

            if (!activeFilters || activeFilters.length === 0) {
                // no filter is active
                return;
            }

            activeFilters.forEach(function (filter) {
                filter.reset();
                filter.notify();
            });
        },
        reset: function () {
            // summary:
            //      wire events, and such
            console.log('app.ClearReset::reset', arguments);

            MapController.map.graphics.clear();

            MapController.map.setDefaultExtent();
            domClass.add(this.resultGrid.domNode, 'hide');
        },
        startup: function () {
            // summary:
            //      startup method
            console.log('app.ClearReset:startup', arguments);

            this.layerFilters = registry.toArray().filter(function (y) {
                return y.baseClass === 'layer-filter';
            });

            this.resultGrid = registry.toArray().filter(function (y) {
                return y.baseClass === 'results-grid';
            })[0];
        }
    });
});
