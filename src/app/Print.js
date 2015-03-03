define([
    'dojo/text!app/templates/Print.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/dom-style',

    'dojo/topic',
    'dojo/on',

    'esri/dijit/Print',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/config'
], function(
    template,

    declare,
    array,
    lang,

    domStyle,

    topic,
    on,

    Print,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Print the page with a title

        templateString: template,
        baseClass: 'print',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        map: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Print::postCreate', arguments);

            this.childWidgets = [];

            this.printer = new Print({
                map: this.map,
                url: config.urls.exportWebMap,
                templates: [{
                    label: 'Portrait (PDF)',
                    format: 'PDF',
                    layout: 'Letter ANSI A Portrait',
                    options: {
                        legendLayers: []
                    }
                }, {
                    label: 'Landscape (PDF)',
                    format: 'PDF',
                    layout: 'Letter ANSI A Landscape',
                    options: {
                        legendLayers: []
                    }
                }]
            }, this.printDiv);

            this.childWidgets.push(this.printer);

            this.setupConnections();
            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.Print::setupConnections', arguments);

            var self = this;
            this.printer.on('print-complete', function() {
                domStyle.set(self.popupBlurb, 'display', 'block');
            });

            on(this.titleNode, 'input, keyup, paste', function(){
                array.forEach(self.printer.templates, function(template){
                    lang.setObject('layoutOptions.titleText', self.titleNode.value, template);
                }, self);
            });

            topic.subscribe(config.topics.events.setTitle, function(args) {
                self.titleNode.value = args;
            });
        },

        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.Print:startup', arguments);

            var self = this;
            array.forEach(this.childWidgets, function(widget) {
                console.log(widget.declaredClass);
                self.own(widget);
                widget.startup();
            });
        }
    });
});