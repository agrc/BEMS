define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',

    'app/ClearReset',
    'app/config',
    'app/data/agencies',
    'app/data/counties',
    'app/data/serviceLevels',
    'app/data/serviceTypes',
    'app/LegendButton',
    'app/MapController',
    'app/OpacitySlider',
    'app/Print',
    'app/ResultsGrid',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/on',
    'dojo/text!app/templates/App.html',
    'dojo/_base/array',
    'dojo/_base/declare',

    'ijit/widgets/layout/SideBarToggler',
    'ijit/widgets/notify/ChangeRequest'
], function(
    FindAddress,
    MagicZoom,

    ClearReset,
    config,
    agencies,
    counties,
    serviceLevels,
    serviceTypes,
    LegendButton,
    MapController,
    OpacitySlider,
    Print,
    ResultsGrid,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    on,
    template,
    array,
    declare,

    SideBarToggler,
    ChangeRequest
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
        postCreate: function () {
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
                mode: 0,
                outFields: ['OBJECTID', 'SERVICE_LEVEL', 'SERVICE_TYPE', 'NAME']
            });

            this.changeRequest = new ChangeRequest({
                map: MapController.map,
                redliner: config.urls.redline,
                toIds: [8, 9, 10]
            }, this.suggestChangeDiv);

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
                new ResultsGrid({}, this.resultsGridDiv),
                this.changeRequest,
                new LegendButton({}).placeAt(MapController.map.root, 'last')
            );

            domClass.add(this.changeRequest.domNode, 'hidden');

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events
            // param or return
            console.log('app.App:setupConnections', arguments);

            var that = this;
            this.own(
                on(this.showChange, 'click', function () {
                    domClass.toggle(that.changeRequest.domNode, 'hidden');
                }),
                on(this.changeRequest, 'drawStart', function () {
                    MapController.handles.forEach(function (handle) {
                        if (handle.pause) {
                            handle.pause();
                        }
                    });
                }),
                on(this.changeRequest, 'drawEnd', function () {
                    MapController.handles.forEach(function (handle) {
                        if (handle.resume) {
                            handle.resume();
                        }
                    });
                })
            );
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
                node: this.filterNode,
                filter: config.filters.serviceType
            });

            MapController.addLayerFilter({
                id: 'boundaries',
                data: serviceLevels,
                node: this.filterLevelsNode,
                filter: config.filters.serviceLevel
            });

            MapController.addLayerFilter({
                id: 'boundaries',
                data: agencies,
                node: this.filterAgencyNode,
                filter: config.filters.agency
            });

            MapController.addLayerFilter({
                id: 'boundaries',
                data: counties,
                node: this.countyNode,
                filter: config.filters.county
            });

            var clearReset = new ClearReset({}, this.clearNode);
            this.childWidgets.push(clearReset);

            this.own(clearReset);
            clearReset.startup();

            this.inherited(arguments);
        }
    });
});
