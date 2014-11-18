define([
    'dojo/text!app/templates/App.html',

    'dojo/_base/declare',
    'dojo/_base/array',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',

    'ijit/widgets/layout/SideBarToggler',

    'app/Print',
    'app/MapController',
    'app/OpacitySlider',
    'app/config',
    'app/ResultsGrid',

    'app/data/serviceTypes'
], function(
    template,

    declare,
    array,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    FindAddress,
    MagicZoom,

    SideBarToggler,

    Print,

    MapController,
    OpacitySlider,
    config,
    ResultsGrid,

    serviceTypes
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        // map: agrc.widgets.map.Basemap
        map: null,

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            MapController.init({
                mapDiv: this.mapDiv
            });

            MapController.addLayerAndMakeVisible({
                url: config.urls.boundaries,
                id: 'boundaries',
                serviceType: 'feature',
                outFields: ['OBJECTID', 'SERVICE_LEVEL', 'SERVICE_TYPE', 'NAME']
            });

            this.childWidgets.push(
                MapController,
                new SideBarToggler({
                    sidebar: this.sideBar,
                    map: MapController.map,
                    centerContainer: this.centerContainer
                }, this.sidebarToggle),
                new FindAddress({
                    map: MapController.map,
                    apiKey: config.apiKey
                }, this.geocodeNode),
                new MagicZoom({
                    map: MapController.map,
                    mapServiceURL: config.urls.vector,
                    searchLayerIndex: 4,
                    searchField: 'NAME',
                    placeHolder: 'point of interest',
                    maxResultsToDisplay: 10,
                    'class': 'first'
                }, this.gnisNode),
                this.printer = new Print({
                    map: MapController.map
                }, this.printNode),
                new OpacitySlider({
                    map: MapController.map
                }, this.sliderNode),
                new ResultsGrid({}, this.resultsGridDiv)
            );

            this.inherited(arguments);
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function(widget) {
                console.log(widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            MapController.addLayerFilter({
                id: 'boundaries',
                data: serviceTypes,
                node: this.filterNode
            });

            this.inherited(arguments);
        }
    });
});