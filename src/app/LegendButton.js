define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/request',
    'dojo/string',
    'dojo/text!app/templates/LegendButton.html',
    'dojo/text!app/templates/legendItem.html',
    'dojo/_base/declare',

    'xstyle/css!app/resources/LegendButton.css'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domConstruct,
    request,
    dojoString,
    template,
    legendItemTemplate,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      A button to show and hide a legend swatch
        templateString: template,
        baseClass: 'legend-button',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.LegendButton::postCreate', arguments);

            this.inherited(arguments);
        },
        toggle: function () {
            // summary:
            //      wire events, and such
            console.log('app.LegendButton::toggle', arguments);


            if (this.contentNode.children.length) {
                domClass.toggle(this.contentNode, 'hidden');

                return;
            }

            var that = this;
            request(config.urls.boundaries.replace('/0', '/Legend?f=json'),
                {
                    handleAs: 'json'
                }).then(function success(response) {
                    console.debug(response);
                    that.buildLegend(response.layers);
                },
                    function error(response) {
                        console.error(response);
                    }
                );
        },
        buildLegend: function (items) {
            // summary:
            //      builds the legend elements from the items array
            // items: Object[]
            console.log('app.LegendButton::buildLegend', arguments);

            var that = this;
            items.forEach(function (item) {
                item.legend.forEach(function (legendInfo) {
                    domConstruct.place(dojoString.substitute(legendItemTemplate, legendInfo), that.contentNode);
                }, this);
            }, this);

            this.emit('loaded');
        }
    });
});
