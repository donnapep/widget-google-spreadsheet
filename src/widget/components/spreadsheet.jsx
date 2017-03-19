/* global gadgets */

/**
 * External dependencies
 */
import React, { Component, PropTypes } from "react";
require( "fixed-data-table/dist/fixed-data-table.css" );
require( "../css/fixed-data-table-overrides.css" );

/**
 * Internal dependencies
 */
import Common from "../../components/widget-common/dist/common";
import Config from "../../config/config";
import Logger from "../../components/widget-common/dist/logger";
import Scroll from "./scroll";
import TableHeader from "../components/table-header";

/**
 * Module variables
 */
const prefs = new gadgets.Prefs();
const sheet = document.querySelector( "rise-google-sheet" );
const BODY_CLASS = "body_font-style";
const API_KEY_DEFAULT = Config.apiKey;

class Spreadsheet extends Component {
  static propTypes = {
    format: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired,
    scroll: PropTypes.object.isRequired,
    spreadsheet: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
  };

  constructor() {
    super();

    this.state = {
      data: null,
      message: "",
    };

    this.errorFlag = false;
    this.isLoading = true;
    this.totalCols = 0;
    this.viewerPaused = true;
  }

  componentDidMount() {
    const id = new gadgets.Prefs().getString( "id" );

    if ( id ) {
      const rpc = gadgets.rpc;

      rpc.register( `rscmd_play_${ id }`, this.play );
      rpc.register( `rscmd_pause_${ id }`, this.pause );
      rpc.register( `rscmd_stop_${ id }`, this.stop );
    }

    const {
      height,
      width,
    } = this.props;

    document.getElementById( "mainContainer" ).style.width = width + "px";
    document.getElementById( "mainContainer" ).style.height = height + "px";

    this.addRowStyle();
    this.addSeparatorStyle();

    if ( Common.isLegacy() ) {
      this.setError( "This version of Spreadsheet Widget is not supported on this version of Rise Player. " +
        "Please use the latest Rise Player version available from https://help.risevision.com/user/create-a-display" );

      this.isLoading = false;
      this.ready();

      return;
    }

    // show wait message while Storage initializes
    this.setState( { message: "Please wait while your google sheet is loaded." } );
    this.loadFonts();
    this.addVerticalAlignmentStyle();
    this.initRiseGoogleSheet();
  }

  componentWillUnmount() {
    sheet.removeEventListener( "rise-google-sheet-response", this.onGoogleSheetResponse );
    sheet.removeEventListener( "rise-google-sheet-error", this.onGoogleSheetError );
    sheet.removeEventListener( "rise-google-sheet-quota", this.onGoogleSheetQuota );
  }

  addRowStyle() {
    const {
      evenRowColor,
      oddRowColor,
    } = this.props.format;

    Common.addCSSRules( [
      `.even .fixedDataTableCellGroupLayout_cellGroup {background-color: ${ evenRowColor } !important }`,
      `.odd .fixedDataTableCellGroupLayout_cellGroup {background-color: ${ oddRowColor } !important }`
    ] );
  }

  addSeparatorStyle() {
    const {
      color,
      showColumn,
      showRow,
    } = this.props.format.separator;
    let rules = [];

    if ( !showRow && !showColumn ) {
      // rely on default css overrides which have all borders transparent but also remove any border that was added
      rules.push( ".fixedDataTableCellLayout_main {border: none;}" );
    } else {
      // colors
      rules = [
        `.fixedDataTableCellLayout_main {border-color: ${ color }; }`,
        `.public_fixedDataTableCell_main {border-color: ${ color }; }`
      ];

      // row and column separators (border widths of either 1 or 0)
      let columnBorderW = showColumn ? "1px" : "0";
      let rowBorderW = showRow ? "1px" : "0";

      rules.push( `.fixedDataTableCellLayout_main {border-style: solid; border-width: 0 ${ columnBorderW } ${ rowBorderW } 0; }` );

      const { hasHeader } = this.props.spreadsheet;

      if ( hasHeader ) {
        // fill in gap between header and data tables
        rules.push( ".fixedDataTableLayout_main, .public_fixedDataTable_main {margin-bottom: -2px; }" );

        if ( showRow ) {
          // apply border color to the border that visually shows to the top of the first row of the data table
          rules.push( `.public_fixedDataTable_header, .public_fixedDataTable_hasBottomBorder {border-color: ${ color }; }` );
        }
      }
    }

    Common.addCSSRules( rules );
  }

  addVerticalAlignmentStyle() {
    const { hasHeader } = this.props.spreadsheet;

    if ( hasHeader ) {
      const { verticalAlign } = this.props.format.header.fontStyle;

      Common.addCSSRules( [
        `.header_font-style .fixedDataTableCellLayout_wrap3 {vertical-align: ${ verticalAlign } }`
      ] );
    }

    const { verticalAlign } = this.props.format.body.fontStyle;

    Common.addCSSRules( [
      `.body_font-style .fixedDataTableCellLayout_wrap3 {vertical-align: ${ verticalAlign } }`
    ] );
  }

  loadFonts() {
    const {
      body,
      columns,
      header,
    } = this.props.format;
    const fontSettings = [];

    fontSettings.push( {
      "class": "header_font-style",
      "fontStyle": header.fontStyle
    } );

    fontSettings.push( {
      "class": BODY_CLASS,
      "fontStyle": body.fontStyle
    } );

    fontSettings.push( {
      "class": BODY_CLASS,
      "fontStyle": body.fontStyle
    } );

    columns.forEach( ( { id, fontStyle } ) => {
      fontSettings.push( {
        // CSS class can't start with a number.
        "class": `_${ id }`,
        "fontStyle": fontStyle
      } );
    } );

    Common.loadFonts( fontSettings );
  }

  initRiseGoogleSheet() {
    const {
      apiKey,
      cells,
      fileId,
      refresh,
      sheetName,
    } = this.props.spreadsheet;

    sheet.addEventListener( "rise-google-sheet-response", this.onGoogleSheetResponse );
    sheet.addEventListener( "rise-google-sheet-error", this.onGoogleSheetError );
    sheet.addEventListener( "rise-google-sheet-quota", this.onGoogleSheetQuota );

    sheet.setAttribute( "key", fileId );
    sheet.setAttribute( "sheet", sheetName );
    sheet.setAttribute( "refresh", refresh );

    if ( "range" === cells ) {
      const {
        endCell,
        startCell,
      } = this.props.spreadsheet.range;

      if ( startCell && endCell ) {
        sheet.setAttribute( "range", `${ startCell}:${ endCell }` );
      }
    }

    // set the API key to the default first
    sheet.setAttribute( "apikey", API_KEY_DEFAULT );

    if ( apiKey ) {
      sheet.setAttribute( "apikey", apiKey );
    } else if ( refresh < 60 ) {
      sheet.setAttribute( "refresh", 60 );
    }

    sheet.go();
  }

  onGoogleSheetResponse = ( { detail } ) => {
    this.setState( { message: "" } );

    if ( detail && detail.results ) {
      this.setState( { data: detail.results } );
    }

    if ( this.isLoading ) {
      this.isLoading = false;
      this.ready();
    } else {
      // in case refresh fixed previous error
      this.errorFlag = false;
    }
  }

  onGoogleSheetError = ( { detail } ) => {
    const { url } = this.props.spreadsheet;
    let errorMessage = "The request failed with status code: 0";
    let statusCode = 0;

    if ( detail.error && detail.error.message ) {
      errorMessage = detail.error.message;
      statusCode = +detail.error.message.substring( errorMessage.indexOf( ":" ) + 2 );
    }

    let message = "Error when accessing Spreadsheet.";
    let eventDetails = "spreadsheet not reachable";

    // Show a different message if there is a 403 or 404
    if ( "403" == statusCode ) {
      message = "To use this Google Spreadsheet it must be publicly accessible. To do this, open " +
        "the Google Spreadsheet and select File > Share > Advanced, then select On - Anyone with the link.";
      eventDetails = "spreadsheet not public";
    } else if ( "404" == statusCode ) {
      message = "Spreadsheet does not exist.";
      eventDetails = "spreadsheet not found";
    }

    this.setError( message );

    this.logEvent( {
      "event": "error",
      "event_details": eventDetails,
      "error_details": errorMessage,
      "url": url,
      "request_url": detail.request ? detail.request.url : "",
      "api_key": this.getApiKey()
    }, true );

    this.setState( { data: null } );

    if ( this.isLoading ) {
      this.isLoading = false;
      this.ready();
    }
  }

  onGoogleSheetQuota = ( e ) => {
    const { url } = this.props.spreadsheet;

    // log the event
    this.logEvent( {
      "event": "error",
      "event_details": "api quota exceeded",
      "url": url,
      "api_key": this.getApiKey()
    }, true );

    if ( e.detail && e.detail.results ) {
      // cached data provided, process as normal response
      this.onGoogleSheetResponse( e );
      return;
    }

    this.setError( "The API Key used to retrieve data from the Spreadsheet has exceeded the daily quota. Please use a different API Key." )
    this.setState( { data: null } );

    if ( this.isLoading ) {
      this.isLoading = false;
      this.ready();
    }
  }

  ready() {
    gadgets.rpc.call( "", "rsevent_ready", null, prefs.getString( "id" ), true, true, true, true, true );
  }

  play = () => {
    const { url } = this.props.spreadsheet;

    this.viewerPaused = false;

    this.logEvent( {
      "event": "play",
      "url": url,
      "api_key": this.getApiKey()
    } );

    if ( this.errorFlag ) {
      this.startErrorTimer();
    }

    if ( this.scrollComponent && this.scrollComponent.canScroll() ) {
      this.scrollComponent.play();
    } else {
      this.startPUDTimer();
    }
  }

  pause = () => {
    this.viewerPaused = true;

    if ( this.scrollComponent ) {
      this.scrollComponent.pause();
    }

    if ( this.pudTimer ) {
      clearTimeout( this.pudTimer );
    }
  }

  stop = () => this.pause();

  done = () => {
    const { url } = this.props.spreadsheet;

    gadgets.rpc.call( "", "rsevent_done", null, prefs.getString( "id" ) );

    if ( this.errorLog ) {
      this.logEvent( this.errorLog, true );
    }

    this.logEvent( {
      "event": "done",
      "url": url,
      "api_key": this.getApiKey()
    } );
  }

  setScrollInstance = ref => this.scrollComponent = ref;

  setError( messageVal ) {
    this.errorFlag = true;
    this.setState( { message: messageVal } );

    // if Widget is playing right now, run the timer
    if ( !this.viewerPaused ) {
      this.startErrorTimer();
    }
  }

  startErrorTimer() {
    this.clearErrorTimer();

    this.errorTimer = setTimeout( () => {
      // notify Viewer widget is done
      this.done();
    }, 5000 );
  }

  clearErrorTimer() {
    if ( this.errorTimer ) {
      clearTimeout( this.errorTimer );
    }

    this.errorTimer = null;
  }

  startPUDTimer() {
    const { pud } = this.props.scroll;
    let delay;

    if ( ( undefined === pud ) || ( pud < 1 ) ) {
      delay = 10000;
    } else {
      delay = pud * 1000;
    }

    this.pudTimer = setTimeout( () => this.done(), delay );
  }

  logEvent( params, isError ) {
    if ( isError ) {
      this.errorLog = params;
    }

    Logger.logEvent( "spreadsheet_events", params );
  }

  getApiKey() {
    const { apiKey } = this.props.spreadsheet;

    return apiKey ? apiKey : API_KEY_DEFAULT;
  }

  // Calculate the width that is taken up by rendering columns with an explicit width.
  getColumnWidthObj() {
    const { columns } = this.props.format;
    let numCols = 0;
    let width = 0;

    if ( undefined !== columns ) {
      // For every column formatting option...
      for ( let j = 0; j < columns.length; j++ ) {
        const { width: colWidth } = columns[ j ];

        if ( ( undefined !== colWidth ) && ( "" !== colWidth ) ) {
          width += parseInt( colWidth, 10 );
          numCols++;
        }
      }
    } else {
      width = 0;
    }

    return { width, numCols };
  }

  getColumnWidth( { width } ) {
    if ( ( undefined !== width ) && ( "" !== width ) ) {
      return parseInt( width, 10 );
    }

    return this.getDefaultColumnWidth();
  }

  getDefaultColumnWidth() {
    const { numCols, width } = this.getColumnWidthObj();

    return ( this.props.width - width ) / ( this.totalCols - numCols );
  }

  getColumnAlignment( { fontStyle } ) {
    const { align } = fontStyle;

    if ( ( undefined !== fontStyle ) && ( undefined !== align ) && ( "" !== align ) ) {
      return align;
    }

    return "left";
  }

  /* Get per column formatting as an object.
   * Object format: [{id: 0, alignment: "left", width: 100}]
   * 'width' is always returned; 'id' and 'alignment' are optionally returned.
   */
  getColumnFormats() {
    const { columns } = this.props.format;
    let columnFormats = [];

    if ( undefined !== columns ) {
      let found = false;

      // Iterate over every column.
      for ( let i = 0; i < this.totalCols; i++ ) {
        found = false;
        columnFormats[ i ] = {};

        // Iterate over every column format setting.
        for ( let j = 0; j < columns.length; j++ ) {
          const { colorCondition, id, numeric } = columns[ j ];

          // Map column to formatted column using column id (i.e. column index).
          if ( i == id ) {
            const columnFormat = columnFormats[ i ];

            columnFormat.id = parseInt( id, 10 );
            columnFormat.numeric = numeric ? numeric : false;
            columnFormat.alignment = this.getColumnAlignment( columns[ j ] );
            columnFormat.width = this.getColumnWidth( columns[ j ] );
            columnFormat.colorCondition = colorCondition;
            found = true;

            break;
          }
        }

        // No column formatting option for just this column.
        if ( !found ) {
          columnFormats[ i ].width = this.getDefaultColumnWidth();
        }
      }
    } else {
      const { width } = this.props;

      // No per column format settings.
      for ( let i = 0; i < this.totalCols; i++ ) {
        columnFormats[ i ] = {};
        // Equal width columns.
        columnFormats[ i ].width = width / this.totalCols;
      }
    }

    return columnFormats;
  }

  getHeaders() {
    const { columns } = this.props.format;
    let headers = [];
    let matchFound = false;

    // Iterate over every column header.
    for ( let i = 0; i < this.totalCols; i++ ) {
      matchFound = false;

      // Iterate over every column formatting option.
      if ( undefined !== columns ) {
        for ( let j = 0; j < columns.length; j++ ) {
          const { headerText, id } = columns[ j ];

          // Map column to formatted column using column id (i.e. column index).
          if ( i == id ) {
            if ( ( undefined !== headerText ) && ( "" !== headerText ) ) {
              headers.push( headerText );
              matchFound = true;
            }

            break;
          }
        }
      }

      // Use the header from the spreadsheet.
      if ( !matchFound ) {
        headers.push( this.state.data[ 0 ][ i ] );
      }
    }

    return headers;
  }

  getRows() {
    const { data } = this.state;

    if ( this.props.spreadsheet.hasHeader ) {
      return data.slice( 1 );
    }

    return data;
  }

  shouldRenderTable( hasHeader, data ) {
    if ( !hasHeader ) {
      return true;
    }

    return data.length > 1;
  }

  renderTableHeader( columnFormats ) {
    const { align } = this.props.format.header.fontStyle;
    const { rowHeight } = this.props.format;
    const { width } = this.props;

    return (
      <TableHeader
        align={ align }
        columnFormats={ columnFormats }
        data={ this.getHeaders() }
        height={ rowHeight }
        width={ width } />
    );
  }

  renderTable( hasHeader, columnFormats ) {
    const {
      body,
      rowHeight,
    } = this.props.format;
    const {
      height,
      scroll,
      width,
    } = this.props;
    const data = this.getRows();

    return (
      <Scroll
        align={ body.fontStyle.align }
        className={ BODY_CLASS }
        columnFormats={ columnFormats }
        data={ data }
        hasHeader={ hasHeader }
        height={ hasHeader ? height - rowHeight : height }
        onDone={ this.done }
        ref={ this.setScrollInstance }
        rowHeight={ rowHeight }
        scroll={ scroll }
        width={ width } />
    );
  }

  render() {
    const {
      data,
      message,
    } = this.state;

    this.totalCols = data ? data[ 0 ].length : 0;

    const { hasHeader } = this.props.spreadsheet;
    const columnFormats = this.getColumnFormats();

    return (
      <div className="main">
        { data && !message &&
          <div className="spreadsheetContainer">
            <div className="table">
              { hasHeader && this.renderTableHeader( columnFormats ) }
              { this.shouldRenderTable( hasHeader, data ) && this.renderTable( hasHeader, columnFormats ) }
            </div>
          </div>
        }

        { message &&
          <div className="messageContainer">
            <p className="message">{ message }</p>
          </div>
        }
      </div>
    );
  }
}

export default Spreadsheet;
