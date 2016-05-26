/* jshint maxlen:false */
define([
    'dojo/has',
    'dojo/request/xhr',

    'esri/config'
], function(
    has,
    xhr,

    esriConfig
) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('basemaps.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('discover.agrc.utah.gov');

    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.1.3',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        //      acquire at developer.mapserv.utah.gov
        apiKey: '',

        urls: {
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
        window.AGRC.quadWord = 'alfred-plaster-crystal-dexter';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
        window.AGRC.urls.boundaries = window.AGRC.urls.boundaries.replace('http://localhost', 'http://test.mapserv.utah.gov');
        window.AGRC.urls.redline = 'http://test.mapserv.utah.gov/chalkdust';
        window.AGRC.quadWord = 'opera-event-little-pinball';

        esriConfig.defaults.io.corsEnabledServers.push('test.mapserv.utah.gov');
    } else {
        // localhost
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            window.AGRC.quadWord = secrets.quadWord;
            window.AGRC.apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting quad word!';
        });
        window.AGRC.urls.redline = 'http://localhost/projects/git/chalkdust';
    }

    return window.AGRC;
});
