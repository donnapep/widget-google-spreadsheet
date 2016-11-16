/* global gadgets, config */

require("fixed-data-table/dist/fixed-data-table.css");
require("../css/fixed-data-table-overrides.css");

import React from "react";
import Scroll from "./scroll";
import Table from "./table";
import TableHeaderContainer from "../containers/TableHeaderContainer";
import Logger from "../../components/widget-common/dist/logger";
import Common from "../../components/widget-common/dist/common";
import config from "../../config/config";

const prefs = new gadgets.Prefs();
const sheet = document.querySelector("rise-google-sheet");

var params = null;

const Spreadsheet = React.createClass({
  headerClass: "header_font-style",
  bodyClass: "body_font-style",
  isLoading: true,
  viewerPaused: true,
  errorFlag: false,
  errorTimer: null,
  pudTimer: null,
  errorLog: null,
  totalCols: 0,


  API_KEY_DEFAULT: config.apiKey,

  getInitialState: function() {
    return {
      data: null
    };
  },

  componentDidMount: function() {
    var id = new gadgets.Prefs().getString("id");

    if (id && id !== "") {
      gadgets.rpc.register("rscmd_play_" + id, this.play);
      gadgets.rpc.register("rscmd_pause_" + id, this.pause);
      gadgets.rpc.register("rscmd_stop_" + id, this.stop);
      gadgets.rpc.register("rsparam_set_" + id, this.configure);
      gadgets.rpc.call("", "rsparam_get", null, id, ["companyId", "displayId", "additionalParams"]);
    }
  },

  componentWillUnmount: function() {
    sheet.removeEventListener("rise-google-sheet-response", this.onGoogleSheetResponse);
    sheet.removeEventListener("rise-google-sheet-error", this.onGoogleSheetError);
  },

  configure: function(names, values) {
    var additionalParams = null,
      companyId = "",
      displayId = "";

    if (Array.isArray(names) && names.length > 0 && Array.isArray(values) && values.length > 0) {
      if (names[0] === "companyId") {
        companyId = values[0];
      }

      if (names[1] === "displayId") {
        if (values[1]) {
          displayId = values[1];
        }
        else {
          displayId = "preview";
        }
      }

      Logger.setIds(companyId, displayId);

      if (names[2] === "additionalParams") {
        additionalParams = JSON.parse(values[2]);

        this.setParams(additionalParams);
      }
    }
  },

  setParams: function(additionalParams) {
    params = JSON.parse(JSON.stringify(additionalParams));

    params.width = prefs.getInt("rsW");
    params.height = prefs.getInt("rsH");

    this.init();
  },

  init: function() {
    this.props.initSize(params.width, params.height);
    this.setRowStyle();
    this.setSeparator();

    if (Common.isLegacy()) {
      this.showError("This version of Spreadsheet Widget is not supported on this version of Rise Player. " +
        "Please use the latest Rise Player version available from https://help.risevision.com/user/create-a-display");

      this.isLoading = false;
      this.ready();

    } else {
      // show wait message while Storage initializes
      this.props.showMessage("Please wait while your google sheet is loaded.");

      this.loadFonts();
      this.setVerticalAlignment();

      this.initRiseGoogleSheet();
    }

  },

  setRowStyle: function() {
    Common.addCSSRules([
        ".even" + " div * {background-color: " + params.format.evenRowColor + " !important }",
        ".odd" + " div * {background-color: " + params.format.oddRowColor + " !important }"
      ]);
  },

  setVerticalAlignment: function() {
    if (params.spreadsheet.hasHeader ) {
      Common.addCSSRules([
        ".header_font-style .fixedDataTableCellLayout_wrap3 {vertical-align: " + params.format.header.fontStyle.verticalAlign + " }"
      ]);
    }

    Common.addCSSRules([
      ".body_font-style .fixedDataTableCellLayout_wrap3 {vertical-align: " + params.format.body.fontStyle.verticalAlign + " }"
    ]);
  },

  setSeparator: function() {
    var rules, columnBorderW, rowBorderW;

    if (!params.format.separator.showRow && !params.format.separator.showColumn) {
      // rely on default css overrides which have all borders transparent
      return;
    }

    // colors
    rules = [
      ".fixedDataTableCellLayout_main {border-color: " + params.format.separator.color + "; }",
      ".public_fixedDataTableCell_main {border-color: " + params.format.separator.color + "; }"
    ];

    // row and column separators (border widths of either 1 or 0)
    columnBorderW = (params.format.separator.showColumn) ? "1px" : "0";
    rowBorderW = (params.format.separator.showRow) ? "1px" : "0";

    rules.push(".fixedDataTableCellLayout_main {border-style: solid; border-width: 0 " + columnBorderW +
      " " + rowBorderW + " 0; }");

    if (params.spreadsheet.hasHeader) {
      // fill in gap between header and data tables
      rules.push(".fixedDataTableLayout_main, .public_fixedDataTable_main {margin-bottom: -2px; }");

      if (params.format.separator.showRow) {
        // apply border color to the border that visually shows to the top of the first row of the data table
        rules.push(".public_fixedDataTable_header, .public_fixedDataTable_hasBottomBorder {border-color: " +
          params.format.separator.color + "; }");
      }
    }

    Common.addCSSRules(rules);
  },

  initRiseGoogleSheet: function() {
    sheet.addEventListener("rise-google-sheet-response", this.onGoogleSheetResponse);
    sheet.addEventListener("rise-google-sheet-error", this.onGoogleSheetError);
    sheet.addEventListener("rise-google-sheet-quota", this.onGoogleSheetQuota);

    sheet.setAttribute("key", params.spreadsheet.fileId);
    sheet.setAttribute("sheet", params.spreadsheet.sheetName);
    sheet.setAttribute("refresh", params.spreadsheet.refresh);

    if (params.spreadsheet.cells === "range") {
      if (params.spreadsheet.range.startCell && params.spreadsheet.range.endCell) {
        sheet.setAttribute("range", params.spreadsheet.range.startCell + ":" +
          params.spreadsheet.range.endCell);
      }
    }

    // set the API key to the default first
    sheet.setAttribute("apikey", this.API_KEY_DEFAULT);

    if (params.spreadsheet.apiKey) {
      sheet.setAttribute("apikey", params.spreadsheet.apiKey);
    } else if (params.spreadsheet.refresh < 60) {
      sheet.setAttribute("refresh", 60);
    }

    sheet.go();
  },

  onGoogleSheetResponse: function(e) {
    this.props.hideMessage();

    if (e.detail && e.detail.results) {
      this.setState({ data: e.detail.results });
    }

    if (this.isLoading) {
      this.isLoading = false;
      this.ready();
    }
    else {
      // in case refresh fixed previous error
      this.errorFlag = false;
    }
  },

  onGoogleSheetError: function(e) {

    // Show a different message if there is a 403 or 404
    var statusCode = 0;
    var errorMessage = "The request failed with status code: 0";
    if (e.detail.error && e.detail.error.message) {
      errorMessage = e.detail.error.message;
      statusCode = +e.detail.error.message.substring(errorMessage.indexOf(":")+2);
    }

    var message = "Error when accessing Spreadsheet.";
    var event_details = "spreadsheet not reachable";
    if (statusCode == "403") {
      message = "To use this Google Spreadsheet it must be publicly accessible. To do this, open the Google Spreadsheet and select File > Share > Advanced, then select On - Anyone with the link."
      event_details = "spreadsheet not public";
    } else if (statusCode == "404") {
      message = "Spreadsheet does not exist."
      event_details = "spreadsheet not found";
    }

    this.showError(message);

    this.logEvent({
      "event": "error",
      "event_details": event_details,
      "error_details": errorMessage,
      "url": params.spreadsheet.url,
      "api_key": (params.spreadsheet.apiKey) ? params.spreadsheet.apiKey : this.API_KEY_DEFAULT
    }, true);

    this.setState({ data: null });

    if (this.isLoading) {
      this.isLoading = false;
      this.ready();
    }
  },

  onGoogleSheetQuota: function(e) {
    // log the event
    this.logEvent({
      "event": "error",
      "event_details": "api quota exceeded",
      "url": params.spreadsheet.url,
      "api_key": (params.spreadsheet.apiKey) ? params.spreadsheet.apiKey : this.API_KEY_DEFAULT
    }, true);

    if (e.detail && e.detail.results) {
      // cached data provided, process as normal response
      this.onGoogleSheetResponse(e);
    }
    else {
      this.showError("The API Key used to retrieve data from the Spreadsheet has exceeded the daily quota. Please use a different API Key.");

      this.setState({ data: null });

      if (this.isLoading) {
        this.isLoading = false;
        this.ready();
      }
    }

  },

  loadFonts: function() {
    const { columns } = params.format;

    var fontSettings = [];

    fontSettings.push({
      "class": this.headerClass,
      "fontStyle": params.format.header.fontStyle
    });

    fontSettings.push({
      "class": this.bodyClass,
      "fontStyle": params.format.body.fontStyle
    });

    fontSettings.push({
      "class": this.bodyClass,
      "fontStyle": params.format.body.fontStyle
    });

    columns.forEach(function (column, index, array) {
      fontSettings.push({
        "class": "_" + column.id, // CSS class can't start with a number.
        "fontStyle": column.fontStyle
      });
    });

    Common.loadFonts(fontSettings);
  },

  startPUDTimer: function() {
    let delay;

    if ((params.scroll.pud === undefined) || (params.scroll.pud < 1)) {
      delay = 10000;
    }
    else {
      delay = params.scroll.pud * 1000;
    }

    this.pudTimer = setTimeout(() => this.done(), delay);
  },

  ready: function() {
    gadgets.rpc.call("", "rsevent_ready", null, prefs.getString("id"), true, true, true, true, true);
  },

  done: function() {
    gadgets.rpc.call("", "rsevent_done", null, prefs.getString("id"));

    if (this.errorLog !== null) {
      this.logEvent(this.errorLog, true);
    }

    this.logEvent({
      "event": "done",
      "url": params.spreadsheet.url,
      "api_key": (params.spreadsheet.apiKey) ? params.spreadsheet.apiKey : this.API_KEY_DEFAULT
    });
  },

  play: function() {
    this.viewerPaused = false;

    this.logEvent({
      "event": "play",
      "url": params.spreadsheet.url,
      "api_key": (params.spreadsheet.apiKey) ? params.spreadsheet.apiKey : this.API_KEY_DEFAULT
    });

    if (this.errorFlag) {
      this.startErrorTimer();
    }

    if (this.refs.scrollComponent && this.refs.scrollComponent.canScroll()) {
      this.refs.scrollComponent.play();
    }
    else {
      this.startPUDTimer();
    }
  },

  pause: function() {
    this.viewerPaused = true;

    if (this.refs.scrollComponent) {
      this.refs.scrollComponent.pause();
    }

    if (this.pudTimer) {
      clearTimeout(this.pudTimer);
    }
  },

  stop: function() {
    this.pause();
  },

  getTableName: function() {
    return "spreadsheet_events";
  },

  clearErrorTimer: function() {
    clearTimeout(this.errorTimer);
    this.errorTimer = null;
  },

  startErrorTimer: function() {
    var self = this;

    this.clearErrorTimer();

    this.errorTimer = setTimeout(function () {
      // notify Viewer widget is done
      self.done();
    }, 5000);
  },

  logEvent: function(params, isError) {
    if (isError) {
      this.errorLog = params;
    }
    Logger.logEvent(this.getTableName(), params);
  },

  showError: function(messageVal) {
    this.errorFlag = true;

    this.props.showMessage(messageVal);

    // if Widget is playing right now, run the timer
    if (!this.viewerPaused) {
      this.startErrorTimer();
    }
  },

  // Calculate the width that is taken up by rendering columns with an explicit width.
  getColumnWidthObj: function() {
    const { columns } = params.format;

    var column = null,
      width = 0,
      numCols = 0;

    if (columns !== undefined) {
      // For every column formatting option...
      for (let j = 0; j < columns.length; j++) {
        column = columns[j];

        if ((column.width !== undefined) && (column.width !== "")) {
          width += parseInt(column.width, 10);
          numCols++;
        }
      }
    }
    else {
      width = 0;
    }

    return {
      width: width,
      numCols: numCols
    };
  },

  getColumnWidth: function(column) {
    if ((column.width !== undefined) && (column.width !== "")) {
      return parseInt(column.width, 10);
    }
    else {
      return this.getDefaultColumnWidth();
    }
  },

  getDefaultColumnWidth: function() {
    const columnWidthObj = this.getColumnWidthObj();

    return (params.width - columnWidthObj.width) / (this.totalCols - columnWidthObj.numCols);
  },

  getColumnAlignment: function(column) {
    var alignment = "";

    if ((column.fontStyle !== undefined) && (column.fontStyle.align !== undefined)
      && (column.fontStyle.align !== "")) {
      return column.fontStyle.align;
    }
    else {
      return this.getDefaultColumnAlignment();
    }
  },

  getDefaultColumnAlignment: function() {
    return "left";
  },

  /* Get per column formatting as an object.
   * Object format: [{id: 0, alignment: "left", width: 100}]
   * 'width' is always returned; 'id' and 'alignment' are optionally returned.
   */
  getColumnFormats: function() {
    const { columns } = params.format;

    var found = false,
      column = null,
      columnFormats = [];

    if (columns !== undefined) {
      // Iterate over every column.
      for (let i = 0; i < this.totalCols; i++) {
        found = false;
        columnFormats[i] = {};

        // Iterate over every column format setting.
        for (let j = 0; j < columns.length; j++) {
          column = columns[j];

          // Map column to formatted column using column id (i.e. column index).
          if (i == column.id) {
            const columnFormat = columnFormats[i];

            columnFormat.id = parseInt(column.id, 10);
            columnFormat.numeric = column.numeric ? column.numeric : false;
            columnFormat.alignment = this.getColumnAlignment(column);
            columnFormat.width = this.getColumnWidth(column);
            columnFormat.colorCondition = column.colorCondition;
            found = true;

            break;
          }
        }

        // No column formatting option for just this column.
        if (!found) {
          columnFormats[i].width = this.getDefaultColumnWidth();
        }
      }
    }
    // No per column format settings.
    else {
      for (let i = 0; i < this.totalCols; i++) {
        columnFormats[i] = {};
        // Equal width columns.
        columnFormats[i].width = params.width / this.totalCols;
      }
    }

    return columnFormats;
  },

  getHeaders: function() {
    var matchFound = false,
      column = null,
      headers = [],
      { columns } = params.format;

    // Iterate over every column header.
    for (let i = 0; i < this.totalCols; i++) {
      matchFound = false;

      // Iterate over every column formatting option.
      if (columns !== undefined) {
        for (let j = 0; j < columns.length; j++) {
          column = columns[j];

          // Map column to formatted column using column id (i.e. column index).
          if (i == column.id) {
            if ((column.headerText !== undefined) && (column.headerText !== "")) {
              headers.push(column.headerText);
              matchFound = true;
            }

            break;
          }
        }
      }

      // Use the header from the spreadsheet.
      if (!matchFound) {
        headers.push(this.state.data[0][i]);
      }
    }

    return headers;
  },

  getRows: function() {
    if (params.spreadsheet.hasHeader) {
      return this.state.data.slice(1);
    }
    else {
      return this.state.data;
    }
  },

  canRenderBody: function() {
    if (!params.spreadsheet.hasHeader) {
      return true;
    }

    return this.state.data.length > 1;
  },

  getTableHeight() {
    const data = this.getRows();
    const { format, spreadsheet } = params;

    return ( data.length * format.rowHeight ) + ( spreadsheet.hasHeader ? format.rowHeight : 0 );
  },

  render: function() {
    if (this.state.data) {
      const { format, scroll, spreadsheet, width } = params;
      const tableHeight = this.getTableHeight();

      this.totalCols = this.state.data[0].length;

      return(
        <div id="table">
        { spreadsheet.hasHeader ?
          <TableHeaderContainer
            align={ format.header.fontStyle.align }
            data={this.getHeaders()}
            width={ width }
            height={ format.rowHeight }
            columnFormats={this.getColumnFormats()} />
            : false}
          {this.canRenderBody() ?
            <Scroll
              ref="scrollComponent"
              height={ tableHeight }
              scroll={ scroll }
              onDone={ this.done }>
              <Table
                data={ this.getRows() }
                align={ format.body.fontStyle.align }
                class={ this.bodyClass }
                totalCols={ this.totalCols }
                rowHeight={ format.rowHeight }
                width={ width }
                height={ tableHeight }
                columnFormats={ this.getColumnFormats() } />
            </Scroll>
          : false}
        </div>
      );
    }
    else {
      return null;
    }
  }
});

export default Spreadsheet;
