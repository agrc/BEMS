define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/dom-construct',

    'dojo/topic',

    'dojo/text!app/templates/LayerFilter.html',

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
                var options = {
                    innerHTML: null,
                    value: null
                };

                if (item.name) {
                    options.innerHTML = item.name;
                    options.value = item.value;
                }
                else
                {
                    options.innerHTML = item;
                    options.value = item;
                }

                domConstruct.create('option', options, this.selectNode);
            }, this);

            this.own(
                topic.subscribe(config.topics.events.filter, lang.hitch(this, 'reset'))
            );

            this.inherited(arguments);
        },
        reset: function(node) {
            // summary:
            //      resets the state of the dropdown
            //      if it is not the sender and ignores any attached events
            // node: the node sending the event
            console.log('app.LayerFilter::reset', arguments);

            if(this.domNode === node){
                return;
            }

            this.selectNode.selectedIndex = 0;
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
            topic.publish(config.topics.events.filter, this.domNode);
        }
    });
});