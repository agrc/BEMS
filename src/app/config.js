/* jshint maxlen:false */
define(['dojo/has', 'esri/config'], function(has, esriConfig) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('basemaps.utah.gov');

    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '1.7.0',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        //      acquire at developer.mapserv.utah.gov
        apiKey: '',

        urls: {
            vector: 'http://basemaps.utah.gov/arcgis/rest/services/BaseMaps/Vector/MapServer',
            boundaries: '/arcgis/rest/services/BEMS/Boundaries/MapServer/0',
            exportWebMap: '/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
            redline: 'http://mapserv.utah.gov/BEMS'
        },

        filters: {
            serviceType: 'SERVICE_TYPE = \'{0}\'',
            serviceLevel: 'SERVICE_LEVEL = \'{0}\'',
            agency: 'NAME = \'{0}\'',
            county: 'COUNTY = \'{0}\''
        },

        topics: {
            map: {
                enableLayer: 'app.addLayer',
                layerOpacity: 'app.layerOpacityChange',
                highlight: 'app.hightlight',
                zoom: 'app.zoom',
                setExpression: 'app.definitionExpression'
            },
            events: {
                search: 'app.search',
                setTitle: 'app.updatePrinterTitle',
                filter: 'app.filtering',
                updateEnd: 'app.layerUpdateing'
            }
        }
    };

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-810ECA1C598895';
        window.AGRC.urls.boundaries = window.AGRC.urls.boundaries.replace('http://localhost', 'http://mapserv.utah.gov');
        window.AGRC.urls.redline = 'http://mapserv.utah.gov/chalkdust';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
        window.AGRC.urls.boundaries = window.AGRC.urls.boundaries.replace('http://localhost', 'http://test.mapserv.utah.gov');
        window.AGRC.urls.redline = 'http://test.mapserv.utah.gov/chalkdust';

        esriConfig.defaults.io.corsEnabledServers.push('test.mapserv.utah.gov');
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-63E1FF17767822';
        window.AGRC.urls.redline = 'http://localhost/projects/git/chalkdust';
    }

    return window.AGRC;
});
