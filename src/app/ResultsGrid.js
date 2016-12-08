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
], function (
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

        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app.ResultsGrid::postCreate', arguments);

            this.setupConnections();
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.log('app.ResultsGrid::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.events.search, lang.hitch(this, 'search')),
                topic.subscribe(config.topics.events.updateEnd, lang.hitch(this, 'showSearchResultsInGrid'))
            );
        },
        startup: function () {
            // summary:
            //      creates the dgrid
            console.log('app.ResultsGrid::startup', arguments);
            this.store = new Memory({
                data: []
            });

            this.query = new Query();

            this.grid = new(declare([Grid, Selection]))({
                bufferRows: Infinity,
                store: this.store,
                noDataMessage: 'No results found.',
                loadingMessage: 'Querying boundaries...',
                columns: {
                    id: 'id',
                    name: 'Boundary Name',
                    service: 'Type of Service',
                    level: 'Level of Service',
                    geometry: 'shape'
                },
                selectionMode: 'single'
            }, this.domNode);

            this.grid.on('dgrid-select', function (events) {
                var row = events.rows[0];
                if (!row) {
                    return;
                }

                topic.publish(config.topics.map.highlight, row.data.geometry);
                topic.publish(config.topics.map.zoom, row.data.geometry);
                topic.publish(config.topics.events.setTitle, row.data.name);
            });

            this.grid.styleColumn('geometry', 'display: none;');
            this.grid.styleColumn('id', 'display: none;');
        },
        showSearchResultsInGrid: function (result) {
            // summary:
            //      description
            // param or return
            console.log('app.ResultsGrid:showSearchResultsInGrid', arguments);

            this.store.data = null;
            this.grid.refresh();

            var data = result.target.graphics.map(function (feature) {
                return {
                    // property names used here match those used when creating the dgrid
                    id: feature.attributes.OBJECTID,
                    name: feature.attributes.NAME,
                    service: feature.attributes.SERVICE_TYPE,
                    level: feature.attributes.SERVICE_LEVEL,
                    geometry: feature.geometry
                };
            });

            this.store.data = data;
            this.grid.refresh();

            domClass.remove(this.domNode, 'hide');
            this.grid.startup();
        },
        search: function (args) {
            // summary:
            //      queries the data and displays features in a grid
            // args: { point - the map point click geometry, layer - the layer being queried }
            console.log('app.ResultsGrid::search', arguments);

            var that = this;
            this.query.geometry = args.point;
            if (args.layer.layerDefinitions) {
                this.query.where = args.layer.layerDefinitions[0];
            }

            var priorQuery = args.layer.getDefinitionExpression();
            if (priorQuery === '1=2') {
                args.layer.setVisibility(false);
                args.layer.setDefinitionExpression();
            }

            args.layer.queryFeatures(this.query, function (results) {
                args.layer.setDefinitionExpression(priorQuery);
                args.layer.setVisibility(true);

                var data = array.map(results.features, function (feature) {
                    return {
                        // property names used here match those used when creating the dgrid
                        id: feature.attributes.OBJECTID,
                        name: feature.attributes.NAME,
                        service: feature.attributes.SERVICE_TYPE,
                        level: feature.attributes.SERVICE_LEVEL,
                        geometry: feature.geometry
                    };
                });

                that.store.data = data;
                that.grid.refresh();

                domClass.remove(that.domNode, 'hide');
                that.grid.startup();
            }, function () {
                args.layer.setDefinitionExpression(priorQuery);
                args.layer.setVisibility(true);

                if (that.grid) {
                    that.grid.store.data = null;
                    that.grid.refresh();
                }
            });
        }
    });
});
