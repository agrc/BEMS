define([
    'app/MapController',

    'dojo/dom-class',
    'dojo/query',
    'dojo/request',
    'dojo/text!app/templates/ChangeRequest.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/validate/us',
    'dojox/validate/web',

    'ijit/widgets/notify/ChangeRequest'
], function (
    MapController,

    domClass,
    query,
    request,
    template,
    array,
    declare,
    lang,

    validate,
    webValidate,

    ChangeRequest
) {
    return declare(ChangeRequest, {
        // description:
        //      An enhanced change request with more fields
        templateString: template,
        baseClass: 'change-request',

        // Properties to be sent into constructor

        completed: function () {
            console.info('app.ChangeRequest::completed', arguments);

            this.txtAgency.value = '';
            this.txtName.value = '';
            this.txtEmail.value = '';
            this.txtPhone.value = '';

            this.inherited(arguments);
        },
        _validate: function () {
            // summary:
            //      validates the widget
            // description:
            //      makes sure everything is the way it needs to be
            // tags:
            //      private
            // returns:
            //      bool
            console.info('app.ChangeRequest::_validate', arguments);

            // hide error messages
            query('.help-inline.error', this.domNode).style('display', 'none');
            query('.control-group', this.domNode).removeClass('error');

            var isEmpty = array.every([
                this.txtName,
                this.txtEmail,
                this.txtPhone,
                this.txtDescription
            ],
                function (tb) {
                    return this._isValid(tb);
                }, this);

            if (!isEmpty) {
                return false;
            }

            var validEmail = webValidate.isEmailAddress(this.txtEmail.value);

            if (validEmail) {
                lang.setObject('AGRC.user.email', this.txtEmail.value, window);
            } else {
                query('span', this.txtEmail.parentElement).style('display', 'inline');
                domClass.add(this.txtEmail.parentElement.parentElement, 'error');
            }

            var validPhone = validate.isPhoneNumber(this.txtPhone.value);

            if (!validPhone) {
                query('span', this.txtPhone.parentElement).style('display', 'inline');
                domClass.add(this.txtPhone.parentElement.parentElement, 'error');
            }

            return validEmail && validPhone;
        },
        _invokeWebService: function () {
            // summary:
            //      calls the web service
            // description:
            //      sends the request to the service
            // tags:
            //      private
            // returns:
            //     Deferred
            console.info('app.ChangeRequest::_invokeWebService', arguments);

            var url = '/sendemailservice/notify';
            var ids = this.toIds || [2]; // eslint-disable-line no-magic-numbers

            if (ids.length < 1) {
                ids = [2]; // eslint-disable-line no-magic-numbers
            }

            var templateValues = this._getValues();

            var options = {
                email: {
                    toIds: ids,
                    fromId: 2
                },
                template: {
                    templateId: 3,
                    templateValues: {
                        description: templateValues.description,
                        application: window.location.href,
                        basemap: this.map.layerIds[0],
                        user: templateValues.name + ' (' +
                              templateValues.email + ', ' +
                              templateValues.phone + ') ' +
                              templateValues.agency
                    }
                }
            };

            if (this._graphic && this._graphic.geometry) {
                options.template.templateValues.link = this.redliner +
                    '?center={{center}}&level={{level}}&redline={{redline}}';
                options.template.templateValues.center = JSON.stringify(this.map.extent.getCenter().toJson());
                options.template.templateValues.level = this.map.getLevel();
                options.template.templateValues.redline = JSON.stringify(this._graphic.geometry.toJson());
            }

            return request.post(url, {
                data: JSON.stringify(options),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        /** gets the values from the form and formats them for the template.
         * @returns { name - string, email - string, phone - string, agency - string, description - string }
         */
        _getValues: function () {
            console.log('app:_getValues', arguments);

            var filterValues = array.filter(MapController.filters, function extractFilterValues(filter) {
                return filter.expression && filter.expression.length > 0;
            });

            var expression = 'None applied.';
            if (filterValues.length > 0) {
                var expressions = array.map(filterValues, function extractExpressions(filter) {
                    return filter.expression;
                });

                expression = expressions.join();
            }

            var values = {
                name: this.txtName.value,
                email: this.txtEmail.value,
                phone: this.txtPhone.value,
                description: this.txtDescription.value + ' FILTER: ' + expression,
                agency: this.txtAgency.value || ''
            };

            if (values.agency.length > 0) {
                values.agency = 'with ' + values.agency;
            }

            return values;
        }
    });
});
