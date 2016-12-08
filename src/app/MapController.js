define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/LayerFilter',

    'dojo/on',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/Color',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/graphic',
    'esri/graphicsUtils',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/FeatureLayer',
    'esri/symbols/SimpleLineSymbol',

    'layer-selector'
], function (
    BaseMap,

    config,
    LayerFilter,

    on,
    topic,
    array,
    Color,
    lang,

    Extent,
    Point,
    Graphic,
    graphicUtils,
    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    FeatureLayer,
    LineSymbol,

    BaseMapSelector
) {
    return {
        // description:
        //      Handles interaction between app widgets and the map. Mostly through pub/sub

        // handles: Object[]
        //      container to track handles for this object
        handles: [],

        // filters: []
        //      keep track of filters
        filters: [],

        // childWidgets: array
        // summary:
        //      holds child widgets
        childWidgets: null,

        // Properties to be sent into constructor
        // map: agrc/widgets/map/BaseMap
        map: null,

        init: function (params) {
            // summary:
            //      description
            console.log('app.MapController::init', arguments);

            lang.mixin(this, params);

            this.childWidgets = [];

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                showAttribution: false,
                extent: new Extent({
                    xmax: -12010849.397533866,
                    xmin: -12898741.918094235,
                    ymax: 5224652.298632992,
                    ymin: 4422369.249751998,
                    spatialReference: {
                        wkid: 3857
                    }
                })
            });

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    quadWord: config.quadWord,
                    baseLayers: ['Lite', 'Hybrid', 'Terrain', 'Topo', 'Color IR']
                }));

            var size = 3;
            this.symbol = new LineSymbol(LineSymbol.STYLE_SOLID, new Color('#F012BE'), size);

            this.layers = [];

            this.setUpSubscribes();
        },
        setUpSubscribes: function () {
            // summary:
            //      subscribes to topics
            console.log('app.MapController::setUpSubscribes', arguments);

            this.handles.push(
                topic.subscribe(config.topics.map.enableLayer,
                    lang.hitch(this, 'addLayerAndMakeVisible')),
                topic.subscribe(config.topics.map.layerOpacity,
                    lang.hitch(this, 'updateOpacity')),
                topic.subscribe(config.topics.map.highlight,
                    lang.hitch(this, 'highlight')),
                topic.subscribe(config.topics.map.zoom,
                    lang.hitch(this, 'zoom')),
                topic.subscribe(config.topics.map.setExpression,
                    lang.hitch(this, 'setExpression')),
                on.pausable(this.map, 'click', lang.partial(lang.hitch(this, 'query'), 'boundaries')),
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFind',
                                lang.partial(lang.hitch(this, 'query'), 'boundaries'))
            );
        },
        addLayerAndMakeVisible: function (props) {
            // summary:
            //      description
            // props: object
            //  { url, serviceType, layerIndex, layerProps }
            console.log('app.MapController::addLayerAndMakeVisible', arguments);

            // check to see if layer has already been added to the map
            var lyr;
            var alreadyAdded = array.some(this.map.graphicsLayerIds, function (id) {
                console.log('app.MapController::addLayerAndMakeVisible||looping ids ', id);

                return id === props.id;
            }, this);

            console.log('app.MapController::addLayerAndMakeVisible||already added ', alreadyAdded);

            if (!alreadyAdded) {
                var LayerClass;

                switch (props.serviceType || 'dynamic') {
                    case 'feature': {
                        LayerClass = FeatureLayer;
                        break;
                    }
                    case 'tiled': {
                        LayerClass = ArcGISTiledMapServiceLayer;
                        break;
                    }
                    default: {
                        LayerClass = ArcGISDynamicMapServiceLayer;
                        break;
                    }
                }

                lyr = new LayerClass(props.url, props);
                lyr.on('click', lang.hitch(this, 'highlight'));

                this.map.addLayer(lyr);
                this.map.addLoaderToLayer(lyr);

                this.layers.push({
                    id: props.id,
                    layer: lyr
                });

                this.activeLayer = lyr;

                return lyr;
            }
        },
        updateOpacity: function (opacity) {
            // summary:
            //      changes a layers opacity
            // opacity
            console.log('app.MapController::updateOpacity', arguments);

            var fullScale = 100;
            if (opacity !== undefined) {
                this.currentOpacity = opacity / fullScale;
            }

            if (!this.activeLayer) {
                // no layer selected yet return
                return;
            }

            this.activeLayer.setOpacity(this.currentOpacity);
        },
        startup: function () {
            // summary:
            //      startup once app is attached to dom
            console.log('app.MapController::startup', arguments);

            array.forEach(this.childWidgets, function (widget) {
                widget.startup();
            }, this);
        },
        highlight: function (geometry) {
            // summary:
            //      adds the clicked shape geometry to the graphics layer
            //      highlighting it
            // geometry - graphic topic publish
            console.log('app.MapController::highlight', arguments);

            this.clearGraphic(this.graphic);

            this.graphic = new Graphic(geometry, this.symbol);
            this.map.graphics.add(this.graphic);
        },
        zoom: function (args) {
            // summary:
            //      zoom to a geometry
            // args a geometry or an array of geometries
            console.log('app.MapController::zoom', arguments);

            var extent;

            if (args && args.length === 0) {
                this.map.setDefaultExtent();

                return;
            }

            if (Object.prototype.toString.call(args) === '[object Array]') {
                extent = graphicUtils.graphicsExtent(args);
            } else {
                extent = args.getExtent();
            }

            this.map.setExtent(extent, true);
        },
        clearGraphic: function (graphic) {
            // summary:
            //      removes the graphic from the map
            // graphic
            console.log('app.MapController::clearGraphic', arguments);

            if (graphic) {
                this.map.graphics.remove(graphic);
                this.graphic = null;
            }
        },
        showPopup: function () {
            // summary:
            //      shows the popup content for the graphic on the mouse over event
            // mouseEvent - mouse over event
            console.log('app.MapController::showPopup', arguments);
        },
        addLayerFilter: function (params) {
            // summary:
            //      description
            // params
            console.log('app.MapController::addLayerFilter', arguments);

            var layer = array.filter(this.layers, function (l) {
                return l.id === params.id;
            })[0];

            if (!layer) {
                console.error('cant find layer with id: ' + params.id);

                return;
            }

            var f = new LayerFilter({
                layer: layer.layer,
                values: params.data,
                filter: params.filter,
                ignoreFilterResets: params.ignoreFilterResets
            }, params.node);

            this.filters.push(f);
            this.childWidgets.push(f);
        },
        destroy: function () {
            // summary:
            //      destroys all handles
            console.log('app.MapControl::destroy', arguments);

            array.forEach(this.handles, function (hand) {
                hand.remove();
            });

            array.forEach(this.childWidgets, function (widget) {
                widget.destroy();
            }, this);
        },
        query: function (layerId, evt) {
            // summary:
            //      fires when a click on the layer occurs
            // evt
            console.log('app.MapControl::query', arguments);

            var layer = array.filter(this.layers, function (l) {
                return l.id === layerId;
            })[0].layer;

            var point = evt.mapPoint || new Point(evt[0].location.x, evt[0].location.y, this.map.spatialReference);

            topic.publish(config.topics.events.search, {
                point: point,
                layer: layer
            });
        },
        setExpression: function () {
            // summary:
            //      sets the definition expresson on the layer
            console.log('app.MapController::setExpression', arguments);

            var activeFilters = this.filters.filter(function (filter) {
                return filter.expression;
            });

            activeFilters = activeFilters.map(function (filter) {
                return {
                    expression: filter.expression,
                    layer: filter.layer
                };
            });

            var combinedFilters = {};

            activeFilters.forEach(function (filter) {
                if (combinedFilters[filter.layer.name]) {
                    combinedFilters[filter.layer.name] = combinedFilters[filter.layer.name].concat([filter]);
                } else {
                    combinedFilters[filter.layer.name] = [filter];
                }
            });

            var keys = Object.keys(combinedFilters);
            if (!keys || !keys.length) {
                var uniqueLayers = {};
                this.filters.forEach(function (filter) {
                    if (!uniqueLayers[filter.layer.name]) {
                        uniqueLayers[filter.layer.name] = filter.layer;
                    }
                });
                Object.keys(uniqueLayers).forEach(function (layer) {
                    uniqueLayers[layer].setDefinitionExpression('1=2');

                    uniqueLayers[layer].setVisibility(false);
                });
            } else {
                keys.forEach(function (key) {
                    var layer = combinedFilters[key][0].layer;
                    var expressions = combinedFilters[key].map(function (filter) {
                        return filter.expression;
                    });

                    layer.setDefinitionExpression(expressions.join(' AND '));
                    layer.setVisibility(true);

                    on.once(layer, 'update-end', function (e) {
                        topic.publish(config.topics.events.updateEnd, e);
                    });
                });
            }
        }
    };
});
