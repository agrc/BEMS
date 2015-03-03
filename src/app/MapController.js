define([
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/Color',

    'dojo/topic',

    'esri/graphic',
    'esri/graphicsUtils',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/FeatureLayer',

    'esri/symbols/SimpleLineSymbol',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/map/BaseMapSelector',

    'app/config',
    'app/LayerFilter'
], function(
    lang,
    array,
    Color,

    topic,

    Graphic,
    graphicUtils,

    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    FeatureLayer,

    LineSymbol,

    BaseMap,
    BaseMapSelector,

    config,
    LayerFilter
) {
    return {
        // description:
        //      Handles interaction between app widgets and the map. Mostly through pub/sub

        // handles: Object[]
        //      container to track handles for this object
        handles: [],

        // childWidgets: array
        // summary:
        //      holds child widgets
        childWidgets: null,

        // Properties to be sent into constructor
        // map: agrc/widgets/map/BaseMap
        map: null,

        init: function(params) {
            // summary:
            //      description
            console.log('app.MapController::init', arguments);

            lang.mixin(this, params);

            this.childWidgets = [];

            this.map = new BaseMap(this.mapDiv, {
                useDefaultExtent: true,
                useDefaultBaseMap: false,
                router: true,
                showAttribution: false
            });

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    id: 'claro',
                    position: 'TR',
                    defaultThemeLabel: 'Lite'
                }));

            this.symbol = new LineSymbol(LineSymbol.STYLE_SOLID, new Color('#F012BE'), 3);

            this.layers = [];

            this.setUpSubscribes();
        },
        setUpSubscribes: function() {
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
                this.map.on('click', lang.partial(lang.hitch(this, 'query'), 'boundaries'))
            );
        },
        addLayerAndMakeVisible: function(props) {
            // summary:
            //      description
            // props: object
            //  { url, serviceType, layerIndex, layerProps }
            console.log('app.MapController::addLayerAndMakeVisible', arguments);

            // check to see if layer has already been added to the map
            var lyr;
            var alreadyAdded = array.some(this.map.graphicsLayerIds, function(id) {
                console.log('app.MapController::addLayerAndMakeVisible||looping ids ', id);
                return id === props.id;
            }, this);

            console.log('app.MapController::addLayerAndMakeVisible||already added ', alreadyAdded);

            if (!alreadyAdded) {
                var LayerClass;

                switch (props.serviceType || 'dynamic') {
                    case 'feature':
                        {
                            LayerClass = FeatureLayer;
                            break;
                        }
                    case 'tiled':
                        {
                            LayerClass = ArcGISTiledMapServiceLayer;
                            break;
                        }
                    default:
                        {
                            LayerClass = ArcGISDynamicMapServiceLayer;
                            break;
                        }
                }

                lyr = new LayerClass(props.url, props);
                lyr.on('click', lang.hitch(this, 'highlight'));
                //lyr.on('click', lang.hitch(this, 'query'));

                this.map.addLayer(lyr);
                this.map.addLoaderToLayer(lyr);

                this.layers.push({
                    id: props.id,
                    layer: lyr
                });

                this.activeLayer = lyr;
            }

            // this.activeLayer = array.filter(this.layers, function(container) {
            //     console.log('app.MapController::addLayerAndMakeVisible||hiding layer ', container.id);
            //     container.layer.hide();
            //     return container.id === props.id;
            // }, this)[0];

            // if (this.activeLayer) {
            //     this.clearGraphic(this.graphic);
            //     this.updateOpacity();
            //     this.activeLayer.layer.show();
            // }
        },
        updateOpacity: function(opacity) {
            // summary:
            //      changes a layers opacity
            // opacity
            console.log('app.MapController::updateOpacity', arguments);

            if (opacity !== undefined) {
                this.currentOpacity = opacity / 100;
            }

            if (!this.activeLayer) {
                //no layer selected yet return
                return;
            }

            this.activeLayer.setOpacity(this.currentOpacity);
        },
        startup: function() {
            // summary:
            //      startup once app is attached to dom
            console.log('app.MapController::startup', arguments);

            array.forEach(this.childWidgets, function(widget) {
                widget.startup();
            }, this);
        },
        highlight: function(geometry) {
            // summary:
            //      adds the clicked shape geometry to the graphics layer
            //      highlighting it
            // geometry - graphic topic publish
            console.log('app.MapController::highlight', arguments);

            this.clearGraphic(this.graphic);

            this.graphic = new Graphic(geometry, this.symbol);
            this.map.graphics.add(this.graphic);
        },
        zoom: function(args) {
            // summary:
            //      zoom to a geometry
            // args a geometry or an array of geometries
            console.log('app.MapController::zoom', arguments);

            var extent;

            if (Object.prototype.toString.call(args) === '[object Array]') {
                extent = graphicUtils.graphicsExtent(args);
            } else {
                extent = args.getExtent();
            }

            this.map.setExtent(extent, true);
        },
        clearGraphic: function(graphic) {
            // summary:
            //      removes the graphic from the map
            // graphic
            console.log('app.MapController::clearGraphic', arguments);

            if (graphic) {
                this.map.graphics.remove(graphic);
                this.graphic = null;
            }
        },
        showPopup: function() {
            // summary:
            //      shows the popup content for the graphic on the mouse over event
            // mouseEvent - mouse over event
            console.log('app.MapController::showPopup', arguments);
        },
        addLayerFilter: function(params) {
            // summary:
            //      description
            // params
            console.log('app.MapController::addLayerFilter', arguments);

            var layer = array.filter(this.layers, function(layer) {
                return layer.id === params.id;
            })[0];

            if (!layer) {
                console.error('cant find layer with id: ' + params.id);
                return;
            }

            this.childWidgets.push(
                new LayerFilter({
                    layer: layer.layer,
                    values: params.data,
                    filter: params.filter
                }, params.node)
            );
        },
        destroy: function() {
            // summary:
            //      destroys all handles
            console.log('app.MapControl::destroy', arguments);

            array.forEach(this.handles, function(hand) {
                hand.remove();
            });

            array.forEach(this.childWidgets, function(widget) {
                widget.destroy();
            }, this);
        },
        query: function(layerId, evt) {
            // summary:
            //      fires when a click on the layer occurs
            // evt
            console.log('app.MapControl::query', arguments);

            var layer = array.filter(this.layers, function(layer) {
                return layer.id === layerId;
            })[0].layer;

            topic.publish(config.topics.events.search, {
                point: evt.mapPoint,
                layer: layer
            });
        },
        setExpression: function(layer, filter) {
            // summary:
            //      sets the definition expresson on the layer
            // layer, filters
            console.log('app.MapController::setExpression', arguments);

            layer.setDefinitionExpression(filter);
        }
    };
});