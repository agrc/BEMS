define([
    'dojo/text!app/templates/OpacitySlider.html',

    'dojo/_base/declare',

    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/config',


    'dijit/form/HorizontalSlider'
], function (
    template,

    declare,

    topic,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Let's you adjust the opacity of a layer in the js api

        templateString: template,
        baseClass: 'opacity-slider',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.OpacitySlider::postCreate', arguments);

            this.inherited(arguments);
        },
        notifyMap: function (opacity) {
            // summary:
            //      tell the map controller to do stuff
            // opacity: Number
            //      the opacity to make the layer
            console.log('app.OpacitySlider::notifyMap', arguments);

            topic.publish(config.topics.map.layerOpacity, opacity);
        }
    });
});
