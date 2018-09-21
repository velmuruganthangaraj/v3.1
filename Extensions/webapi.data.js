var WebAPIDataSource = (function () {
    function WebAPIDataSource() {
        this.locale = 'en-US';
        this.urlTextArea = null;
        this.schemaArea = null;
        this.userNameField = null;
        this.passwordField = null;
        this.userNameRow = null;
        this.passwordRow = null;
        this.headerRow = null;
        this.id = 'webapi_Container';
        this.connectClick = $.proxy(this.connectDataSource, this);
        this.renderErrorToolTip(this.id);
    }
    WebAPIDataSource.prototype.renderConfig = function (targetTag, dataSource, isEdit) {
        this.renderConfiguration(targetTag);
        this.updateDataSource(dataSource);
        this.scrollerRefresh();
    };
    WebAPIDataSource.prototype.updateDataSource = function (dataSource) {
        if (!ej.isNullOrUndefined(dataSource)) {
            var connectionProperties = dataSource.ConnectionProperties;
            this.urlTextArea.val(connectionProperties.ConnectString);
            var securityType = 'None';
            var userName = '';
            var password = '';
            if (!ej.isNullOrUndefined(dataSource.ConnectionProperties.CustomProperties)) {
                for (var index = 0; index < dataSource.ConnectionProperties.CustomProperties.length; index++) {
                    var data = dataSource.ConnectionProperties.CustomProperties[index];
                    if (data.Name.indexOf('SchemaPath') !== -1) {
                        this.schemaArea.val(data.Value);
                    }
                    if (data.Name.indexOf('SecurityType') !== -1) {
                        securityType = data.Value;
                    }
                    if (data.Name.indexOf('Credential') !== -1) {
                        var credential = window.atob(data.Value);
                        userName = credential.split(':')[0];
                        password = credential.split(':')[1];
                    }
                    if (data.Name.indexOf('Headers') !== -1) {
                        this.populateHeaderModel(this.populateCustomHeaders(data.Value), 'headers');
                    }
                }
            }
            this.authTypeDropdown.selectItemByValue(securityType);
            this.userNameField.val(userName);
            this.passwordField.val(password);
        }
        this.scrollerRefresh();
    };
    WebAPIDataSource.prototype.populateCustomHeaders = function (headerString) {
        var headerInfo = [];
        if (!ej.isNullOrUndefined(headerString) && headerString.trim().length > 0
            && headerString.indexOf(';') > 0) {
            var headers = headerString.split(';');
            for (var index = 0; index < headers.length; index++) {
                if (!ej.isNullOrUndefined(headers[index]) && headers[index].indexOf(':') > 0) {
                    var header = headers[index].split(':');
                    headerInfo.push({ Key: header[0], Value: header[1] });
                }
            }
        }
        return headerInfo;
    };
    WebAPIDataSource.prototype.populateHeaderModel = function (headers, itemType) {
        if (!ej.isNullOrUndefined(headers) && headers.length > 0) {
            for (var index = 0; index < headers.length; index++) {
                var header = headers[index];
                var rowId = this.renderSetValueFields(itemType);
                var nameTag = $('#' + rowId + '_' + itemType + '_lbl_txt');
                var valTag = $('#' + rowId + '_' + itemType + '_value_txt');
                nameTag.removeClass('e-rptdesigner-txtmark').val(header.Key);
                valTag.removeClass('e-rptdesigner-txtmark').val(header.Value);
            }
        }
    };
    WebAPIDataSource.prototype.resetInputFields = function () {
        var headerContainer = $('#' + this.id + '_headers_container_div');
        this.hideValidationMsg(this.urlTextArea.attr('id'));
        this.hideValidationMsg(this.schemaArea.attr('id'));
        this.hideValidationMsg(this.userNameField.attr('id'));
        this.hideValidationMsg(this.passwordField.attr('id'));
        this.urlTextArea.val('');
        this.schemaArea.val('');
        this.userNameField.val('');
        this.passwordField.val('');
        headerContainer.empty();
        this.authTypeDropdown.setModel({ 'selectedIndex': 0 });
        this.scrollerRefresh(headerContainer);
        this.scrollerRefresh();
    };
    WebAPIDataSource.prototype.connectDataSource = function (args) {
        if (!args[0].isCancel) {
            args[0].data = this.getDatasourceInfo(args[0].name);
        }
    };
    WebAPIDataSource.prototype.showConfiguration = function (isShow) {
        this.webContainer.css('display', isShow ? 'table-row' : 'none');
    };
    WebAPIDataSource.prototype.renderConfiguration = function (targetTag) {
        if (targetTag.find('#' + this.id + '_web_datasource').length > 0) {
            this.resetInputFields();
        }
        else {
            this.webContainer = ej.buildTag('div', '', {
                'width': '100%',
                'height': '100%'
            }, { 'id': this.id + '_web_datasource' });
            targetTag.append(this.webContainer);
            this.renderWebDatasourcePanel();
        }
        this.showConfiguration(true);
    };
    WebAPIDataSource.prototype.renderWebDatasourcePanel = function () {
        var configTable = ej.buildTag('table.e-designer-dsconfig-table', '', {
            'width': '100%',
            'padding-left': '5px',
            'margin-left': '0px'
        }, {
            'unselectable': 'on',
            'id': this.id + '_web_basic_config'
        });
        this.webContainer.append(configTable);
        this.renderTextArea(this.getLocale('urltext'), this.id + '_webDs_url', configTable, '0px');
        this.renderTextBoxItem(this.getLocale('schematext'), this.id + '_webDs_schema', false, configTable, 210);
        var bodyRow = $('<tr id=\'' + this.id + '_webDs_body_type\' />');
        var bodyTable = $('<table />');
        bodyRow.append(bodyTable);
        configTable.append(bodyRow);
        this.renderDropDownItem(this.getLocale('authenticationtype'), this.id + '_webDs_authentication', configTable, this.getDropdownValues(), this.onAuthenticationChange, this);
        this.renderTextBoxItem(this.getLocale('username'), this.id + '_basic_auth_username', false, configTable, 210);
        this.renderTextBoxItem(this.getLocale('password'), this.id + '_basic_auth_pwd', true, configTable, 210);
        this.renderHeaderContainer(configTable, this.id + '_webapi_custom_headers', 'headers', this.getLocale('Headers'), '2px');
        this.urlTextArea = this.webContainer.find('#' + this.id + '_webDs_url');
        this.schemaArea = this.webContainer.find('#' + this.id + '_webDs_schema');
        this.userNameField = this.webContainer.find('#' + this.id + '_basic_auth_username');
        this.passwordField = this.webContainer.find('#' + this.id + '_basic_auth_pwd');
        this.userNameRow = this.webContainer.find('#' + this.id + '_basic_auth_username_tr');
        this.passwordRow = this.webContainer.find('#' + this.id + '_basic_auth_pwd_tr');
        this.headerRow = this.webContainer.find('#' + this.id + '_webapi_custom_headers_tr');
        if (this.webContainer.find('#' + this.id + '_webDs_authentication').length > 0) {
            this.authTypeDropdown = this.webContainer.find('#' + this.id + '_webDs_authentication').data('ejDropDownList');
            this.authTypeDropdown.selectItemsByIndices('0');
        }
        this.webContainer.find('#' + this.id + '_webDs_body_type').hide();
        this.urlTextArea.bind('keyup', $.proxy(this.textAreaKeyUp, this));
        this.schemaArea.bind('keyup', $.proxy(this.schemaAreaKeyUp, this));
        this.userNameField.bind('keyup', $.proxy(this.userNameFieldKeyUp, this));
        this.passwordField.bind('keyup', $.proxy(this.passwordFieldKeyUp, this));
        this.scrollerRefresh();
    };
    WebAPIDataSource.prototype.getDropdownValues = function () {
        var noneValue = 'None';
        var windowsValue = 'Windows';
        var basicHttpValue = 'Basic Http';
        var customHeader = 'Custom';
        var authTypeJson = [
            { id: noneValue.toLowerCase(), text: this.getLocale(noneValue.toLowerCase()), value: noneValue },
            { id: windowsValue.toLowerCase(), text: this.getLocale(windowsValue.toLowerCase()), value: windowsValue },
            { id: basicHttpValue.toLowerCase(), text: this.getLocale(basicHttpValue.toLowerCase()), value: basicHttpValue },
            { id: customHeader.toLowerCase(), text: this.getLocale(customHeader.toLowerCase()), value: customHeader }
        ];
        return authTypeJson;
    };
    WebAPIDataSource.prototype.renderDropDownItem = function (name, id, target, datasource, fnction, context) {
        var row = $('<tr id=' + id + '_tr/>');
        var col = $('<td unselectable=\'on\'/>');
        var bodyTable = $('<table unselectable=\'on\'></table>');
        bodyTable.append(this.getRowCaption(name, id));
        col.append(bodyTable);
        row.append(col);
        target.append(row);
        var rowtxt = $('<tr></tr>');
        var coltxt = ej.buildTag('td', '', {}, { 'colspan': '2', 'id': id + '_td' });
        var dropdown = ej.buildTag('input', '', {}, { 'id': id, 'value': '', 'spellcheck': 'false' });
        coltxt.append(dropdown);
        rowtxt.append(coltxt);
        bodyTable.append(rowtxt);
        var selectedIndex = (id !== this.id + '_webDs_authentication') ? '0' : '';
        dropdown.ejDropDownList({
            width: '221px',
            dataSource: datasource,
            fields: { id: 'id', text: 'text', value: 'value' },
            change: $.proxy(fnction, context),
            selectedIndex: selectedIndex,
            showRoundedCorner: true,
            cssClass: 'e-reportdesigner-dataset-selection'
        });
    };
    WebAPIDataSource.prototype.renderTextArea = function (name, id, target, marginLeft) {
        var row = $('<tr id=' + id + '_tr' + '/>');
        var col = $('<td unselectable=\'on\'/>');
        row.append(col);
        target.append(row);
        var bodyTable = $('<table unselectable=\'on\'></table>');
        col.append(bodyTable);
        bodyTable.append(this.getRowCaption(name, id));
        var rowtxt = $('<tr></tr>');
        var coltxt = ej.buildTag('td', '', {}, { 'colspan': '2', 'id': id + '_td' });
        bodyTable.append(rowtxt);
        rowtxt.append(coltxt);
        var txtbox = ej.buildTag('textarea.e-textarea e-ejinputtext e-designer-content-label e-designer-constr-textarea', '', {
            'width': '217px',
            'height': '65px',
            'margin-left': marginLeft,
            'padding': '5px 7px',
            'resize': 'none',
            'text-indent': '0px',
            'overflow': 'hidden'
        }, {
            'id': id, 'type': 'textarea', 'spellcheck': 'false'
        });
        coltxt.append(txtbox);
    };
    WebAPIDataSource.prototype.renderTextBoxItem = function (name, id, isPasswd, target, width) {
        var row = $('<tr id=' + id + '_tr' + '/>');
        var col = $('<td unselectable=\'on\'/>');
        var bodyTable = $('<table unselectable=\'on\'></table>');
        bodyTable.append(this.getRowCaption(name, id));
        col.append(bodyTable);
        row.append(col);
        target.append(row);
        var rowtxt = $('<tr></tr>');
        var coltxt = ej.buildTag('td', '', {}, { 'colspan': '2', 'id': id + '_td' });
        rowtxt.append(coltxt);
        bodyTable.append(rowtxt);
        var txtbox = ej.buildTag('input.e-textbox e-designer-content-label', '', {
            'height': '24px',
            'width': width + 'px'
        }, {
            'id': id,
            'type': isPasswd ? 'password' : 'text',
            'spellcheck': 'false'
        });
        coltxt.append(txtbox);
    };
    WebAPIDataSource.prototype.renderHeaderContainer = function (target, id, itemType, headerText, marginLeft) {
        var basicRow = ej.buildTag('tr', '', {}, { 'id': id + '_tr' });
        var basicCol = ej.buildTag('td', '', {}, {});
        var rootDiv = ej.buildTag('div', '', {
            'width': 'auto', 'height': '100%', 'display': 'block',
            'margin-top': '0px', 'overflow': 'auto', 'margin-left': '4px'
        }, { 'id': id });
        var bodyDiv = ej.buildTag('div', '', {}, {});
        var bodyTable = ej.buildTag('table', '', {}, {});
        var newRow = ej.buildTag('tr', '', {}, {});
        var newCol = ej.buildTag('td', '', { 'width': '222px' }, {});
        var lblHdrText = ej.buildTag('Label.e-designer-add-label e-designer-title-label', headerText, {}, {
            'type': 'label',
            'id': id + '_labelText'
        });
        var spanDiv = ej.buildTag('div', '', { 'cursor': 'pointer', 'float': 'right', 'margin-top': '2px' });
        var addSpan = ej.buildTag('span.e-chk-image e-icon e-plus e-rptdesigner-add-icon', '', {}, { 'id': this.id + '_' + itemType + '_add_span' });
        var addDiv = ej.buildTag('div', '', { 'cursor': 'pointer', 'float': 'right', 'padding-top': '2px' }, {});
        var textSpan = ej.buildTag('span.e-btntxt e-rptdesigner-add-btn', this.getLocale('Add'), {}, {});
        var containerDiv = ej.buildTag('div.e-reportdesigner-scroller e-designer-border-dialog', '', {
            'margin': '0px 0px 4px 0px',
            'height': '150px',
            'width': '226px',
            'padding': '5px 0px',
            'margin-left': marginLeft,
            'border': '1px solid #c9cbcc',
            'border-radius': '3px'
        }, {
            'id': this.id + '_' + itemType + '_val_parent'
        });
        var scrollDiv = ej.buildTag('div.e-items', '', {}, { 'id': this.id + '_' + itemType + '_container_div' });
        target.append(basicRow);
        basicRow.append(basicCol);
        basicCol.append(rootDiv);
        rootDiv.append(bodyDiv, containerDiv);
        bodyDiv.append(bodyTable);
        bodyTable.append(newRow);
        newRow.append(newCol);
        newCol.append(lblHdrText, addDiv, spanDiv);
        addDiv.append(textSpan);
        spanDiv.append(addSpan);
        containerDiv.append(scrollDiv);
        containerDiv.ejScroller({
            height: 150 + 'px',
            scrollerSize: 9,
            autoHide: false,
            enableTouchScroll: false
        });
        spanDiv.bind('click', $.proxy(this.renderSetValueFields, this, itemType));
        addDiv.bind('click', $.proxy(this.renderSetValueFields, this, itemType));
    };
    WebAPIDataSource.prototype.renderSetValueFields = function (itemType) {
        var containerId = this.webContainer.find('#' + this.id + '_' + itemType + '_container_div');
        var parentContainer = this.webContainer.find('#' + this.id + '_' + itemType + '_val_parent');
        var className = 'e-reportdesigner-webHeader-row';
        var rowId = ej.getGuid(this.id + '_row_');
        var divElement = ej.buildTag('div', '', {
            'padding': '4px'
        }, {
            'id': rowId,
            'rowId': rowId,
            'class': className
        });
        containerId.append(divElement);
        var containerTbl = ej.buildTag('table', '', {
            'width': '100%',
            'background': '#eeeeee',
            'border-radius': '2px',
            'box-sizing': 'border-box',
            '-moz-box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box'
        }, {});
        var container = ej.buildTag('tr', '', { 'height': '30px' }, {});
        var valueContainer = ej.buildTag('tr', '', { 'height': '30px' }, {});
        var lblCol = ej.buildTag('td', '', { 'width': '200px', 'padding-left': '4px' }, { 'id': rowId + '_' + itemType + '_lbl_txtCol' });
        var lblTxtBox = ej.buildTag('input.e-textbox e-designer-textbox-border e-designer-border e-designer-exclude e-rpt-textName', '', {
            'height': '20px',
            'width': '170px',
        }, {
            'type': 'text',
            'id': rowId + '_' + itemType + '_lbl_txt',
            'placeholder': this.getLocale('Name')
        });
        divElement.append(containerTbl);
        containerTbl.append(container).append(valueContainer);
        container.append(lblCol);
        lblCol.append(lblTxtBox);
        var deleteCol = ej.buildTag('td', '', {}, {});
        var deleteBtn = ej.buildTag('span.e-chk-image e-icon e-cross-circle e-designer-delete-icon', '', {
            'cursor': 'default',
            'padding-top': '4px',
            'float': 'right',
            'color': '#d9534f',
            'font-size': '13px'
        }, {
            'id': rowId + '_' + itemType + '_del_icon',
            'title': this.getLocale('Close')
        });
        var textCol = ej.buildTag('td', '', { 'width': '200px', 'padding-left': '4px' }, {});
        var txtBox = ej.buildTag('input.e-textbox e-designer-textbox-border e-designer-border e-designer-exclude e-rpt-textValue', '', {
            'height': '20px',
            'width': '170px'
        }, {
            'type': 'text',
            'id': rowId + '_' + itemType + '_value_txt',
            'placeholder': this.getLocale('Value')
        });
        var errorCol = ej.buildTag('td', '', { 'padding-top': '1px' }, { 'id': rowId + '_webHeader_error_td' });
        this.renderErrIndictor(errorCol, this.id);
        valueContainer.append(textCol);
        textCol.append(txtBox);
        container.append(errorCol);
        valueContainer.append(deleteCol);
        deleteCol.append(deleteBtn);
        deleteBtn.bind('click', $.proxy(this.deleteRow, this, divElement, parentContainer));
        var outerDivHeight = this.webContainer.find('#' + this.id + '_' + itemType + '_container_div').height();
        if (parentContainer.height() > outerDivHeight) {
            parentContainer.find('.e-content').removeClass('e-content');
        }
        else {
            this.scrollerRefresh(parentContainer);
        }
        return rowId;
    };
    WebAPIDataSource.prototype.deleteRow = function (rowInfo, parentContainer) {
        rowInfo.remove();
        this.scrollerRefresh(parentContainer);
    };
    WebAPIDataSource.prototype.getRowCaption = function (caption, id) {
        var row = ej.buildTag('tr', '', {});
        var labelCell = ej.buildTag('td', '', {});
        var label = ej.buildTag('label.editLabel e-designer-title-label', caption, {}, {
            'id': id + '_labelText'
        });
        var infoIcon = ej.buildTag('span.e-dbrd-info-icon', '', {
            'display': 'none',
        }, {});
        labelCell.append(label, infoIcon);
        row.append(labelCell);
        var errorCell = ej.buildTag('td', '', {}, { 'id': id + '_error_icon_td' });
        this.renderErrIndictor(errorCell, this.id);
        row.append(errorCell);
        return row;
    };
    WebAPIDataSource.prototype.renderErrIndictor = function (target, ctrlId) {
        var errorIcon = ej.buildTag('span.e-rptdesigner-error-icon e-rptdesigner-errorinfo e-error-tip', '', {
            'float': 'right',
            'display': 'none',
            'padding-right': '2px'
        }, {});
        target.append(errorIcon);
        errorIcon.bind('mouseover mousedown touchstart', $.proxy(this.showErrTip, this, ctrlId));
        errorIcon.bind('mouseleave touchleave', $.proxy(this.hideErrTip, this, ctrlId));
    };
    WebAPIDataSource.prototype.showErrIndictor = function (target, isEnable, errMsg) {
        var errorIcon = target.find('.e-error-tip');
        errorIcon.attr('e-errormsg', errMsg).css('display', isEnable ? 'block' : 'none');
    };
    WebAPIDataSource.prototype.renderErrorToolTip = function (id) {
        if ($('#' + id + '_error_tooltip').length === 0) {
            var toolTip = ej.buildTag('div.e-designer-right-tip e-tooltip-wrap e-widget e-designer-tooltip e-rptdesigner-error-tip', '', {
                'display': 'none'
            }, {
                'id': id + '_error_tooltip'
            });
            var tipContainer = ej.buildTag('div.e-tipContainer');
            var tipContent = ej.buildTag('div', '', {}, { 'id': id + '_error_tooltip_content' });
            $(document.body).append(toolTip);
            toolTip.append(tipContainer);
            tipContainer.append(tipContent);
        }
    };
    WebAPIDataSource.prototype.showErrTip = function (ctrlId, args) {
        args.preventDefault();
        var targetEle = $(args.currentTarget);
        var tooltip = $('#' + ctrlId + '_error_tooltip');
        $('#' + ctrlId + '_error_tooltip_content').text(targetEle.attr('e-errormsg'));
        var eleOffset = targetEle.offset();
        tooltip.css({
            left: (eleOffset.left + (targetEle.width() / 2)) - tooltip.width(),
            top: eleOffset.top + targetEle.height() + (targetEle.height() / 2),
            'display': 'block'
        });
    };
    WebAPIDataSource.prototype.hideErrTip = function (ctrlId, args) {
        $('#' + ctrlId + '_error_tooltip').css('display', 'none');
    };
    WebAPIDataSource.prototype.showValidationMsg = function (id, isShow, msg) {
        var target = $('#' + id + '_error_icon_td');
        var errContainer = $('#' + id + '_td').find('.e-designer-content-label');
        if (isShow) {
            this.showErrIndictor(target, true, msg);
            errContainer.addClass('e-rptdesigner-error');
        }
        else {
            this.showErrIndictor(target, false);
            errContainer.removeClass('e-rptdesigner-error');
        }
    };
    WebAPIDataSource.prototype.hideValidationMsg = function (id) {
        this.showValidationMsg(id, false);
    };
    WebAPIDataSource.prototype.textAreaKeyUp = function (event) {
        this.hideValidationMsg(this.urlTextArea.attr('id'));
    };
    WebAPIDataSource.prototype.schemaAreaKeyUp = function (event) {
        this.hideValidationMsg(this.schemaArea.attr('id'));
    };
    WebAPIDataSource.prototype.userNameFieldKeyUp = function (event) {
        this.hideValidationMsg(this.userNameField.attr('id'));
    };
    WebAPIDataSource.prototype.passwordFieldKeyUp = function (event) {
        this.hideValidationMsg(this.passwordField.attr('id'));
    };
    WebAPIDataSource.prototype.updateHighlighter = function (target, isUpdate) {
        isUpdate ? target.addClass('e-rptdesigner-error').addClass('e-rptdesigner-error-radius') :
            target.removeClass('e-rptdesigner-error').removeClass('e-rptdesigner-error-radius');
    };
    WebAPIDataSource.prototype.onAuthenticationChange = function (args) {
        this.hideValidationMsg(this.userNameField.attr('id'));
        this.hideValidationMsg(this.passwordField.attr('id'));
        this.userNameRow.hide();
        this.passwordRow.hide();
        this.headerRow.hide();
        if (args.selectedValue === 'Basic Http') {
            this.userNameRow.show();
            this.passwordRow.show();
        }
        else if (args.selectedValue === 'Custom') {
            this.headerRow.show();
        }
        this.scrollerRefresh();
    };
    WebAPIDataSource.prototype.getDatasourceInfo = function (dataSourceName) {
        var isValidCon = true;
        var urlText = this.urlTextArea.val();
        var schemaText = this.schemaArea.val();
        var authType = this.authTypeDropdown.getSelectedValue();
        var userName = this.userNameField.val();
        var password = this.passwordField.val();
        var headers = { hasErrors: false, headerValues: null };
        if (urlText.length === 0 || !this.isValidUrl(urlText)) {
            this.showValidationMsg(this.urlTextArea.attr('id'), true, this.getLocale('urlvalidation'));
            isValidCon = false;
        }
        else {
            this.hideValidationMsg(this.urlTextArea.attr('id'));
        }
        if (schemaText.trim().length > 0 && !this.isValidUrl(schemaText)) {
            this.showValidationMsg(this.schemaArea.attr('id'), true, this.getLocale('schemavalidation'));
            isValidCon = false;
        }
        else {
            this.hideValidationMsg(this.schemaArea.attr('id'));
        }
        if (authType === 'Basic Http') {
            if (userName.length === 0) {
                this.showValidationMsg(this.userNameField.attr('id'), true, this.getLocale('usernamevalidation'));
                isValidCon = false;
            }
            else {
                this.hideValidationMsg(this.userNameField.attr('id'));
            }
            if (password.length === 0) {
                this.showValidationMsg(this.passwordField.attr('id'), true, this.getLocale('passwordvalidation'));
                isValidCon = false;
            }
            else {
                this.hideValidationMsg(this.passwordField.attr('id'));
            }
        }
        if (authType === 'Custom') {
            headers = this.getCustomHeaders('headers');
        }
        if (isValidCon && !headers.hasErrors) {
            var reportData = this.createDataSource();
            reportData.Name = dataSourceName;
            reportData.ConnectionProperties.DataProvider = 'WebAPI';
            reportData.ConnectionProperties.ConnectString = urlText;
            reportData.ConnectionProperties.CustomProperties = this.getCustomProps(authType, userName, password, schemaText, headers.headerValues);
            return reportData;
        }
        return null;
    };
    WebAPIDataSource.prototype.getCustomProps = function (authType, userName, password, schemaText, headers) {
        var customProps = [];
        if (!ej.isNullOrUndefined(schemaText)) {
            customProps.push({
                __type: 'Syncfusion.RDL.DOM.CustomProperty',
                Name: 'SchemaPath',
                Value: schemaText
            });
        }
        if (!ej.isNullOrUndefined(authType)) {
            customProps.push({
                __type: 'Syncfusion.RDL.DOM.CustomProperty',
                Name: 'SecurityType',
                Value: authType
            });
        }
        if (authType === 'Basic Http' && !ej.isNullOrUndefined(userName) && userName.length > 0
            && !ej.isNullOrUndefined(password) && password.length > 0) {
            customProps.push({
                __type: 'Syncfusion.RDL.DOM.CustomProperty',
                Name: 'Credential',
                Value: window.btoa(userName + ':' + password)
            });
        }
        if (!ej.isNullOrUndefined(headers) && headers.length > 0) {
            customProps.push({
                __type: 'Syncfusion.RDL.DOM.CustomProperty',
                Name: 'Headers',
                Value: this.getHeaderString(headers)
            });
        }
        return customProps;
    };
    WebAPIDataSource.prototype.getHeaderString = function (headers) {
        var header = '';
        for (var index = 0; index < headers.length; index++) {
            header += headers[index].Key + ':' + headers[index].Value;
            if (index !== (headers.length - 1)) {
                header += ';';
            }
        }
        return header;
    };
    WebAPIDataSource.prototype.getCustomHeaders = function (itemType) {
        var _this = this;
        var headers = [];
        var errorContent = '';
        var hasErrors = false;
        var availableRows = this.webContainer.find('#' + this.id + '_' + itemType + '_container_div .e-reportdesigner-webHeader-row');
        availableRows.each(function (index, obj) {
            var rowId = $(obj).attr('id');
            var nameText = _this.getValues($('#' + rowId + '_' + itemType + '_lbl_txt'));
            var valueText = _this.getValues($('#' + rowId + '_' + itemType + '_value_txt'));
            errorContent += _this.validateValues(nameText, errorContent, $('#' + rowId + '_' + itemType + '_lbl_txt'));
            errorContent += _this.validateValues(valueText, errorContent, $('#' + rowId + '_' + itemType + '_value_txt'));
            if (!ej.isNullOrUndefined(errorContent) && errorContent.length !== 0) {
                _this.showErrIndictor($('#' + rowId + '_webHeader_error_td'), true, errorContent);
                errorContent = '';
                hasErrors = true;
            }
            else {
                headers.push({ Key: nameText, Value: valueText });
                _this.showErrIndictor($('#' + rowId + '_webHeader_error_td'), false, errorContent);
            }
        });
        if (!hasErrors) {
            return { hasErrors: false, headerValues: headers };
        }
        return { hasErrors: true, headerValues: headers };
    };
    WebAPIDataSource.prototype.getValues = function (targetTag) {
        var targetTagTxt = targetTag.val();
        var value;
        if (targetTag.hasClass('e-rptdesigner-txtmark')) {
            value = '';
        }
        else {
            value = targetTagTxt;
        }
        return value;
    };
    WebAPIDataSource.prototype.validateValues = function (value, errorContent, id) {
        var content = '';
        if (((!ej.isNullOrUndefined(value) && value.length === 0) || ej.isNullOrUndefined(value))) {
            content += this.getLocale('specifyValueInFields');
            this.updateHighlighter(id, true);
        }
        else {
            this.updateHighlighter(id, false);
        }
        if (this.contains(errorContent, content, true)) {
            content = '';
        }
        return content;
    };
    WebAPIDataSource.prototype.contains = function (actual, expected, ignoreCase) {
        if (ignoreCase) {
            return !this.isNull(actual)
                && !this.isNull(expected)
                && this.toLowerCase(actual).indexOf(this.toLowerCase(expected)) !== -1;
        }
        return !this.isNull(actual)
            && !this.isNull(expected)
            && actual.toString().indexOf(expected) !== -1;
    };
    WebAPIDataSource.prototype.isNull = function (actual) {
        return actual === null;
    };
    WebAPIDataSource.prototype.toLowerCase = function (val) {
        return val ? val.toLowerCase ?
            val.toLowerCase() :
            val.toString().toLowerCase() :
            (val === 0 || val === false) ? val.toString() : '';
    };
    WebAPIDataSource.prototype.isValidUrl = function (url) {
        var regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regex.test(url);
    };
    WebAPIDataSource.prototype.createDataSource = function () {
        var dataSource = {
            __type: 'Syncfusion.RDL.DOM.DataSource',
            Name: '',
            Transaction: false,
            DataSourceReference: null,
            SecurityType: 'None',
            ConnectionProperties: {
                __type: 'Syncfusion.RDL.DOM.ConnectionProperties',
                ConnectString: '',
                EmbedCredentials: false,
                DataProvider: '',
                IsDesignState: false,
                IntegratedSecurity: false,
                UserName: '',
                PassWord: '',
                Prompt: '',
                CustomProperties: []
            }
        };
        return dataSource;
    };
    WebAPIDataSource.prototype.scrollerRefresh = function (scrollerTag) {
        var scrollContainer = $('#' + this.id + '_dsConfigBodyContainer');
        if (!ej.isNullOrUndefined(scrollerTag)) {
            scrollContainer = scrollerTag;
        }
        if (!ej.isNullOrUndefined(scrollContainer) && scrollContainer.length > 0
            && !ej.isNullOrUndefined(scrollContainer.data('ejScroller'))) {
            scrollContainer.data('ejScroller').refresh();
        }
    };
    WebAPIDataSource.prototype.getLocale = function (text) {
        var webapiLocale;
        var defaultLocale = WebAPIDataSource.Locale['en-US'];
        if (!ej.isNullOrUndefined(WebAPIDataSource.Locale[this.locale])) {
            webapiLocale = WebAPIDataSource.Locale[this.locale];
        }
        switch (text.toLowerCase()) {
            case 'urltext':
                if (webapiLocale && webapiLocale.urlText) {
                    return webapiLocale.urlText;
                }
                return defaultLocale.urlText;
            case 'schematext':
                if (webapiLocale && webapiLocale.schemaText) {
                    return webapiLocale.schemaText;
                }
                return defaultLocale.schemaText;
            case 'authenticationtype':
                if (webapiLocale && webapiLocale.AuthenticationTypeText) {
                    return webapiLocale.AuthenticationTypeText;
                }
                return defaultLocale.AuthenticationTypeText;
            case 'username':
                if (webapiLocale && webapiLocale.userNameText) {
                    return webapiLocale.userNameText;
                }
                return defaultLocale.userNameText;
            case 'password':
                if (webapiLocale && webapiLocale.passwordText) {
                    return webapiLocale.passwordText;
                }
                return defaultLocale.passwordText;
            case 'urlvalidation':
                if (webapiLocale && webapiLocale.urlValidationText) {
                    return webapiLocale.urlValidationText;
                }
                return defaultLocale.urlValidationText;
            case 'schemavalidation':
                if (webapiLocale && webapiLocale.schemaValidationText) {
                    return webapiLocale.schemaValidationText;
                }
                return defaultLocale.schemaValidationText;
            case 'usernamevalidation':
                if (webapiLocale && webapiLocale.userNameValidationText) {
                    return webapiLocale.userNameValidationText;
                }
                return defaultLocale.userNameValidationText;
            case 'passwordvalidation':
                if (webapiLocale && webapiLocale.passwordValidationText) {
                    return webapiLocale.passwordValidationText;
                }
                return defaultLocale.passwordValidationText;
            case 'none':
                if (webapiLocale && webapiLocale.noneText) {
                    return webapiLocale.noneText;
                }
                return defaultLocale.noneText;
            case 'windows':
                if (webapiLocale && webapiLocale.windowsText) {
                    return webapiLocale.windowsText;
                }
                return defaultLocale.windowsText;
            case 'basic http':
                if (webapiLocale && webapiLocale.basicHttpText) {
                    return webapiLocale.basicHttpText;
                }
                return defaultLocale.basicHttpText;
            case 'custom':
                if (webapiLocale && webapiLocale.customText) {
                    return webapiLocale.customText;
                }
                return defaultLocale.customText;
            case 'headers':
                if (webapiLocale && webapiLocale.headersText) {
                    return webapiLocale.headersText;
                }
                return defaultLocale.headersText;
            case 'add':
                if (webapiLocale && webapiLocale.addbuttonText) {
                    return webapiLocale.addbuttonText;
                }
                return defaultLocale.addbuttonText;
            case 'close':
                if (webapiLocale && webapiLocale.closeButtonToolTip) {
                    return webapiLocale.closeButtonToolTip;
                }
                return defaultLocale.closeButtonToolTip;
            case 'name':
                if (webapiLocale && webapiLocale.nameText) {
                    return webapiLocale.nameText;
                }
                return defaultLocale.nameText;
            case 'value':
                if (webapiLocale && webapiLocale.valueText) {
                    return webapiLocale.valueText;
                }
                return defaultLocale.valueText;
            case 'specifyvalueinfields':
                if (webapiLocale && webapiLocale.specifyValueInFields) {
                    return webapiLocale.specifyValueInFields;
                }
                return defaultLocale.specifyValueInFields;
        }
        return text;
    };
    WebAPIDataSource.prototype.updateCulture = function (culture) {
        var _this = this;
        this.locale = culture;
        var urlLabel = this.webContainer.find('#' + this.id + '_webDs_url_labelText');
        var schemaLabel = this.webContainer.find('#' + this.id + '_webDs_schema_labelText');
        var authendicationLabel = this.webContainer.find('#' + this.id + '_webDs_authentication_labelText');
        var userNameLabel = this.webContainer.find('#' + this.id + '_basic_auth_username_labelText');
        var passWordLabel = this.webContainer.find('#' + this.id + '_basic_auth_pwd_labelText');
        var urlErorIcon = this.webContainer.find('#' + this.id + '_webDs_url_error_icon_td');
        var schemaErorIcon = this.webContainer.find('#' + this.id + '_webDs_schema_error_icon_td');
        var userNameErrorIcon = this.webContainer.find('#' + this.id + '_basic_auth_username_error_icon_td');
        var passWordErrorIcon = this.webContainer.find('#' + this.id + '_basic_auth_pwd_error_icon_td');
        var headersLabel = this.webContainer.find('#' + this.id + '_webapi_custom_headers_labelText');
        if (!ej.isNullOrUndefined(urlLabel) && urlLabel.length > 0) {
            urlLabel.text(this.getLocale('urltext'));
        }
        if (!ej.isNullOrUndefined(schemaLabel) && schemaLabel.length > 0) {
            schemaLabel.text(this.getLocale('schematext'));
        }
        if (!ej.isNullOrUndefined(authendicationLabel) && authendicationLabel.length > 0) {
            authendicationLabel.text(this.getLocale('authenticationtype'));
        }
        if (!ej.isNullOrUndefined(userNameLabel) && userNameLabel.length > 0) {
            userNameLabel.text(this.getLocale('username'));
        }
        if (!ej.isNullOrUndefined(passWordLabel) && passWordLabel.length > 0) {
            passWordLabel.text(this.getLocale('password'));
        }
        if (!ej.isNullOrUndefined(urlErorIcon) && urlErorIcon.length > 0) {
            urlErorIcon.find('.e-error-tip').attr('e-errormsg', this.getLocale('urlvalidation'));
        }
        if (!ej.isNullOrUndefined(schemaErorIcon) && schemaErorIcon.length > 0) {
            schemaErorIcon.find('.e-error-tip').attr('e-errormsg', this.getLocale('schemavalidation'));
        }
        if (!ej.isNullOrUndefined(userNameErrorIcon) && userNameErrorIcon.length > 0) {
            userNameErrorIcon.find('.e-error-tip').attr('e-errormsg', this.getLocale('usernamevalidation'));
        }
        if (!ej.isNullOrUndefined(passWordErrorIcon) && passWordErrorIcon.length > 0) {
            passWordErrorIcon.find('.e-error-tip').attr('e-errormsg', this.getLocale('passwordvalidation'));
        }
        if (!ej.isNullOrUndefined(headersLabel) && headersLabel.length > 0) {
            headersLabel.text(this.getLocale('Headers'));
        }
        this.webContainer.find('.e-rptdesigner-add-btn').each(function (index, element) {
            $(element).text(_this.getLocale('Add'));
        });
        this.webContainer.find('.e-rpt-textName').each(function (index, element) {
            $(element).attr('placeholder', _this.getLocale('name'));
        });
        this.webContainer.find('.e-rpt-textValue').each(function (index, element) {
            $(element).attr('placeholder', _this.getLocale('value'));
        });
        this.webContainer.find('.e-designer-delete-icon').each(function (index, element) {
            $(element).attr('title', _this.getLocale('Close'));
        });
        this.webContainer.find('.e-reportdesigner-webHeader-row').each(function (index, element) {
            $(element).find('.e-error-tip').attr('e-errormsg', _this.getLocale('specifyvalueinfields'));
        });
        var selectedValue = this.authTypeDropdown.getSelectedValue();
        this.authTypeDropdown.setModel({ 'dataSource': this.getDropdownValues() });
        this.authTypeDropdown.selectItemByValue(selectedValue);
    };
    WebAPIDataSource.prototype.dispose = function () {
        if (!ej.isNullOrUndefined(this.webContainer) && this.webContainer.length > 0) {
            this.destroyEjObjects(this.webContainer);
            this.webContainer.remove();
        }
    };
    WebAPIDataSource.prototype.destroyEjObjects = function (ejObjects, isRootEle) {
        var elements = isRootEle ? $(ejObjects) : $(ejObjects).find('.e-js');
        for (var i = 0; i < elements.length; i++) {
            var data = elements.eq(i).data();
            var wds = data['ejWidgets'];
            if (wds && wds.length) {
                for (var j = 0; j < wds.length; j++) {
                    if (data[wds[j]] && data[wds[j]].destroy) {
                        data[wds[j]].destroy();
                    }
                }
            }
        }
    };
    return WebAPIDataSource;
}());
WebAPIDataSource.Locale = {};
WebAPIDataSource.Locale['en-US'] = {
    urlText: 'URL',
    schemaText: 'Schema',
    AuthenticationTypeText: 'Authentication Type',
    userNameText: 'Username',
    passwordText: 'Password',
    urlValidationText: 'URL is not valid',
    schemaValidationText: 'Schema url is not valid',
    userNameValidationText: 'Specify the User Name',
    passwordValidationText: 'Specify the Password',
    noneText: 'None',
    windowsText: 'Windows',
    basicHttpText: 'Basic Http',
    customText: 'Custom',
    headersText: 'Headers',
    addbuttonText: 'Add',
    nameText: 'Name',
    valueText: 'Value',
    closeButtonToolTip: 'Close',
    specifyValueInFields: 'Specify value in Fields'
};
WebAPIDataSource.Locale['fr-FR'] = {
    urlText: 'URL',
    schemaText: 'Schéma',
    AuthenticationTypeText: 'type d\'identification',
    userNameText: 'Nom d\'utilisateur',
    passwordText: 'Mot de passe',
    urlValidationText: 'L\'URL n\'est pas valide',
    schemaValidationText: 'L\'URL du schéma n\'est pas valide',
    userNameValidationText: 'Précisez le nom d\'utilisateur',
    passwordValidationText: 'Spécifiez le mot de passe',
    noneText: 'Aucun',
    windowsText: 'Windows',
    basicHttpText: 'Http de base',
    customText: 'Douane',
    headersText: 'Les entêtes',
    addbuttonText: 'Ajouter',
    nameText: 'prénom',
    valueText: 'Valeur',
    closeButtonToolTip: 'Fermer',
    specifyValueInFields: 'Spécifiez la valeur dans les champs'
};
