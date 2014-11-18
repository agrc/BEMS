define([
    'dojo/text!app/templates/ResultsGrid.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/store/Memory',
    'dojo/topic',

    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'dgrid/OnDemandGrid',
    'dgrid/Selection',

    'esri/tasks/query',

    'app/config'
], function(
    template,

    declare,
    array,
    lang,

    Memory,
    topic,

    domClass,

    _WidgetBase,
    _TemplatedMixin,

    Grid,
    Selection,

    Query,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Sorts and displays the search results.

        templateString: template,
        baseClass: 'results-grid',

        // grid: Grid
        //      the main grid
        grid: null,

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app.ResultsGrid::postCreate', arguments);

            this.setupConnections();
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.ResultsGrid::setupConnections', arguments);

            this.own(
                //     topic.subscribe(config.topics.appSearch.searchStarted,
                //         lang.hitch(this, 'clear')),
                //     topic.subscribe(config.topics.appSearch.clear,
                //         lang.hitch(this, 'clear')),
                topic.subscribe(config.topics.events.search,
                    lang.hitch(this, 'search'))
            );
        },
        startup: function() {
            // summary:
            //      creates the dgrid
            console.log('app.ResultsGrid::startup', arguments);
            this.store = new Memory({
                data: []
            });

            this.query = new Query();
        },
        search: function(args) {
            // summary:
            //      queries the data and displays features in a grid
            // args: { point - the map point click geometry, layer - the layer being queried }
            console.log('app.ResultsGrid::search', arguments);

            domClass.remove(this.domNode, 'hide');

            if (this.grid) {
                this.grid.store.data = null;
                this.grid.refresh();
            } else {
                this.grid = new(declare([Grid, Selection]))({
                    bufferRows: Infinity,
                    store: this.store,
                    columns: {
                        id: 'id',
                        name: 'Boundary Name',
                        service: 'Type of Service',
                        level: 'Level of Service',
                        geometry: 'shape'
                    },
                    selectionMode: 'single'
                }, this.domNode);

                this.grid.on('dgrid-select', function(events) {

                    var row = events.rows[0];
                    if (!row) {
                        return;
                    }

                    topic.publish(config.topics.map.highlight, row.data.geometry);
                    topic.publish(config.topics.map.zoom, row.data.geometry);
                    topic.publish(config.topics.events.setTitle, row.data.name);
                });

                this.grid.startup();

                this.grid.styleColumn('geometry', 'display: none;');
                this.grid.styleColumn('id', 'display: none;');
            }

            var self = this;
            this.query.geometry = args.point;
            if (args.layer.layerDefinitions) {
                this.query.where = args.layer.layerDefinitions[0];
            }

            args.layer.queryFeatures(this.query, function(results) {
                var data = array.map(results.features, function(feature) {
                    return {
                        // property names used here match those used when creating the dgrid
                        'id': feature.attributes.OBJECTID,
                        'name': feature.attributes.NAME,
                        'service': feature.attributes.SERVICE_TYPE,
                        'level': feature.attributes.SERVICE_LEVEL,
                        'geometry': feature.geometry
                    };
                });

                self.store.data = data;
                self.grid.refresh();
            });
        }
    });
});