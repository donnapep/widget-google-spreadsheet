/* global gadgets */

/**
 * External Dependencies
 */
import React from "react"
import ReactDom from "react-dom";

/**
 * Internal Dependencies
 */
import Logger from "../components/widget-common/dist/logger";
import Spreadsheet from "./components/spreadsheet";
require( "./css/spreadsheet.css" );

( ( window, document ) => {
  "use strict";

  // Disable context menu (right click menu)
  window.oncontextmenu = () => {
    return false;
  };

  const id = new gadgets.Prefs().getString( "id" );

  if ( id ) {
    const rpc = gadgets.rpc;

    rpc.register( `rsparam_set_${ id }`, configure );
    rpc.call( "", "rsparam_get", null, id, [ "companyId", "displayId", "additionalParams" ] );
  }

  function configure( names, values ) {
    if ( !Array.isArray( names ) || !names.length || !Array.isArray( values ) || !values.length ) {
      return;
    }

    let companyId = "";
    let displayId = "";

    if ( "companyId" === names[ 0 ] ) {
      companyId = values[ 0 ];
    }

    if ( "displayId" === names[ 1 ] ) {
      if ( values[ 1 ] ) {
        displayId = values[ 1 ];
      } else {
        displayId = "preview";
      }
    }

    Logger.setIds( companyId, displayId );

    let additionalParams = null;

    if ( "additionalParams" === names[ 2 ] ) {
      additionalParams = JSON.parse( values[ 2 ] );

      setParams( additionalParams );
    }
  }

  function setParams( additionalParams ) {
    const prefs = new gadgets.Prefs(),
      params = JSON.parse( JSON.stringify( additionalParams ) );

    params.width = prefs.getInt( "rsW" );
    params.height = prefs.getInt( "rsH" );

    ReactDom.render( <Spreadsheet { ...params } />, document.getElementById( "mainContainer" ) );
  }
} )( window, document );
