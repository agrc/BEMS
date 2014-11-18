define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/dom-construct',

    'dojo/topic',

    'dojo/text!app/templates/LayerFilter.html',

    'esri/tasks/Query',

    'app/config'
], function(
    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    lang,

    domConstruct,

    topic,

    template,

    Query,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Works with the MapController to set the layer filter definitions.
        //      LayerFilter takes some data and builds a list for the user to use to filter with.

        templateString: template,
        baseClass: 'layer-filter',

        // Properties to be sent into constructor

        // layer: esri/layer/*
        // summary:
        //      an esri layer to set a definition query on
        layer: null,

        // values: object
        // summary:
        //      {name,value}
        values: null,

        // field: string
        // summary:
        //      the field to filter on
        filter: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.LayerFilter::postCreate', arguments);

            array.forEach(this.values, function(item) {
                domConstruct.create('option', {
                    innerHTML: item.name,
                    value: item.value
                }, this.selectNode);
            }, this);

            this.inherited(arguments);

            this.query = new Query();
        },
        notifyDynamicService: function() {
            // summary:
            //      sets layer definition for map service
            console.log('app.LayerFilter::notify', arguments);

            var value = this.selectNode.value;
            var layerIndex = 0;
            var filters = [];


            if (value) {
                filters[layerIndex] = lang.replace(this.filter, [value]);
            }

            this.layer.setLayerDefinitions(filters, false);
        },
        notify: function() {
            // summary:
            //      sets layer definition for map service
            console.log('app.LayerFilter::notify', arguments);

            var value = this.selectNode.value;
            var filter;

            if (value) {
                filter = lang.replace(this.filter, [value]);
            }

            var handle = this.layer.on('update-end', function(args) {
                topic.publish(config.topics.map.zoom, args.target.graphics);
                handle.remove();
            });

            topic.publish(config.topics.map.setExpression, this.layer, filter);
        }
    });
});