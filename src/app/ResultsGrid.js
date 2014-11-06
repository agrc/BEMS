define([
    'dojo/text!app/templates/ResultsGrid.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/store/Memory',
    'dojo/topic',
    'dojo/on',

    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'dgrid/OnDemandGrid',

    'esri/tasks/QueryTask',
    'esri/tasks/query',

    'app/config'
], function(
    template,

    declare,
    array,
    lang,

    Memory,
    topic,
    on,

    domClass,

    _WidgetBase,
    _TemplatedMixin,

    Grid,

    QueryTask,
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

            this.qt = new QueryTask(config.urls.boundaries + '/0');
            this.query = new Query();

            this.query.returnGeometry = true;
            this.query.outFields = ['SERVICE_LEVEL', 'SERVICE_TYPE', 'NAME'];
        },
        search: function(point) {
            // summary:
            //      queries the data and displays features in a grid
            // point - the map point click geometry
            console.log('app.ResultsGrid::search', arguments);

            domClass.remove(this.domNode, 'hide');

            if (this.grid) {
                this.grid.store.data = null;
                this.grid.refresh();
            } else {
                this.grid = new(declare([Grid]))({
                    bufferRows: Infinity,
                    store: this.store,
                    columns: {
                        name: 'Boundary Name',
                        service: 'Type of Service',
                        level: 'Level of Service',
                        geometry: 'shape'
                    }
                }, this.domNode);

                this.grid.startup();

                this.grid.styleColumn('geometry', 'display: none;');
            }

            var self = this;
            this.query.geometry = point;

            this.qt.execute(this.query, function(results) {
                var data = array.map(results.features, function(feature) {
                    return {
                        // property names used here match those used when creating the dgrid
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