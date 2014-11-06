/* jshint maxlen:false */
define(['dojo/has', 'esri/config'], function (has, esriConfig) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');

    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '1.0.1',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        // exportWebMapUrl: String
        //      print task url
        exportWebMapUrl: '/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

        urls: {
            vector: 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Vector/MapServer',
            boundaries: '/arcgis/rest/services/BEMS/Boundaries/MapServer'
        },

        filters: {
            serviceType: 'SERVICE_TYPE = \'{0}\''
        },

        topics: {
            map: {
                enableLayer: 'app.addLayer',
                layerOpacity: 'app.layerOpacityChange'
            },
            events: {
                search: 'app.search'
            }
        }
    };

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-A94B063C533889';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-63E1FF17767822';
    }

    return window.AGRC;
});