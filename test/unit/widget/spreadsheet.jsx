/* global describe, before, beforeEach, after, afterEach, it, sinon, xit  */

import React from "react";
import { mount, shallow } from "enzyme";
import { expect } from "chai";
import LoggerUtils from "../../../src/components/widget-common/dist/logger";
import Scroll from "../../../src/widget/components/scroll";
import Spreadsheet from "../../../src/widget/components/spreadsheet";
import TableHeader from "../../../src/widget/components/table-header";
import "../../data/spreadsheet";

describe( "<Spreadsheet />", () => {
  let server,
    wrapper;

  const additionalParams = window.gadget.settings.additionalParams,
    columnsParam = additionalParams.format.columns,
    data = [
      [ "Column 1", "Column 2", "Column 3" ],
      [ "A2", "B2", "C2" ]
    ];

  before( () => {
    server = sinon.fakeServer.create();
    server.respondImmediately = true;
    server.respondWith( "GET", "https://sheets.googleapis.com/v4/spreadsheets/xxxxxxxxxx?key=abc123",
      [ 200, { "Content-Type": "application/json" },
        "{ \"sheets\": [{ \"properties\": { \"title\": \"Sheet1\" } }] }" ] );
    server.respondWith( "POST", "https://www.googleapis.com/oauth2/v3/token", [ 200, { "Content-Type": "text/html" }, "OK" ] );
  } );

  beforeEach( () => {
    wrapper = shallow(
      <Spreadsheet
        { ...additionalParams }
        height={ window.innerHeight }
        width={ window.innerWidth } />
    );
  } );

  after( () => {
    server.restore();
  } );

  it( "Should have an initial data state", () => {
    expect( wrapper.state() ).to.deep.equal( { data: null, message: "" } );
  } );

  describe( "<TableHeader />", () => {
    beforeEach( () => {
      wrapper.setState( { data } );
    } );

    it( "Should contain a TableHeader component", () => {
      expect( wrapper.find( TableHeader ) ).to.have.length( 1 );
    } );

    it( "Should have align prop", () => {
      expect( wrapper.find( TableHeader ).props().align ).to.equal( additionalParams.format.header.fontStyle.align );
    } );

    it( "Should have columnFormats prop", () => {
      const expected = [
        {
          id: additionalParams.format.columns[ 0 ].id,
          numeric: false,
          alignment: "left",
          width: additionalParams.format.columns[ 0 ].width,
          colorCondition: "none"
        },
        {
          width: 250
        },
        {
          width: 250
        }
      ];

      expect( wrapper.find( TableHeader ).props().columnFormats ).to.deep.equal( expected );
    } );

    it( "Should have data prop", () => {
      const expected = [ additionalParams.format.columns[ 0 ].headerText, "Column 2", "Column 3" ];

      expect( wrapper.find( TableHeader ).props().data ).to.deep.equal( expected );
    } );

    it( "Should have height prop", () => {
      expect( wrapper.find( TableHeader ).props().height ).to.equal( additionalParams.format.rowHeight );
    } );

    it( "Should have width prop", () => {
      expect( wrapper.find( TableHeader ).props().width ).to.equal( window.innerWidth );
    } );
  } );

  describe( "No <TableHeader />", () => {
    beforeEach( () => {
      additionalParams.spreadsheet.hasHeader = false;
      wrapper = shallow(
        <Spreadsheet
          { ...additionalParams }
          height={ window.innerHeight }
          width={ window.innerWidth } />
      );

      wrapper.setState( { data } );
    } );

    afterEach( () => {
      additionalParams.spreadsheet.hasHeader = true;
    } );

    it( "Should not contain a TableHeader component", () => {
      expect( wrapper.find( TableHeader ) ).to.have.length( 0 );
    } );

    it( "Should pass the correct height prop for the Scroll component", () => {
      expect( wrapper.find( Scroll ).props().height ).to.equal( window.innerHeight );
    } );
  } );

  describe( "<Scroll />", () => {
    beforeEach( () => {
      wrapper.setState( { data } );
    } );

    it( "Should contain a Scroll component", () => {
      expect( wrapper.find( Scroll ) ).to.have.length( 1 );
    } );

    it( "Should have columnFormats prop", () => {
      const expected = [
        {
          id: additionalParams.format.columns[ 0 ].id,
          numeric: false,
          alignment: "left",
          width: additionalParams.format.columns[ 0 ].width,
          colorCondition: "none"
        },
        {
          width: 250
        },
        {
          width: 250
        }
      ];

      expect( wrapper.find( Scroll ).props().columnFormats ).to.deep.equal( expected );
    } );
  } );

  describe( "Messaging", () => {
    it( "Should not show a message", () => {
      wrapper.setState( { data, message: "" } );

      expect( wrapper.find( ".messageContainer" ) ).to.have.length( 0 );
    } );

    it( "Should show a message", () => {
      const message = "This is a message";

      wrapper.setState( { data, message } );

      expect( wrapper.html() ).to.equal( `<div class="main"><div class="messageContainer"><p class="message">${ message }</p></div></div>` );
    } );
  } );

  describe( "Refreshing", () => {
    beforeEach( () => {
      wrapper = mount(
        <Spreadsheet
          { ...additionalParams }
          height={ window.innerHeight }
          width={ window.innerWidth } />
      );

      wrapper.setState( { data } );
    } );

    it( "should update the state", () => {
      const event = document.createEvent( "Event" ),
        sheet = document.getElementById( "rise-google-sheet" ),
        newData = [ [ "Column 1" ], [ "Test data" ] ];

      event.initEvent( "rise-google-sheet-response", true, true );
      event.detail = {};
      event.detail.results = newData;

      sheet.dispatchEvent( event );

      expect( wrapper.state().data ).to.deep.equal( newData );
    } );
  } );

  describe( "Handling error", () => {
    const sheet = document.getElementById( "rise-google-sheet" );

    beforeEach( () => {
      wrapper = mount(
        <Spreadsheet
          { ...additionalParams }
          height={ window.innerHeight }
          width={ window.innerWidth } />
      );

      wrapper.setState( { data } );
    } );

    it( "should revert state back to initial value", () => {
      const event = document.createEvent( "Event" );

      event.initEvent( "rise-google-sheet-error", true, true );
      event.detail = {};

      sheet.dispatchEvent( event );

      expect( wrapper.state().data ).to.be.null;
    } );

    it( "should ensure state is initial value when quota error and no cached data provided", () => {
      const event = document.createEvent( "Event" );

      event.initEvent( "rise-google-sheet-quota", true, true );
      event.detail = {};

      sheet.dispatchEvent( event );

      expect( wrapper.state().data ).to.be.null;
    } );

    it( "should ensure state is updated when quota error and cached data is provided", () => {
      const event = document.createEvent( "Event" );

      event.initEvent( "rise-google-sheet-quota", true, true );
      event.detail = { results: [ [ "1", "2", "3" ] ] };

      sheet.dispatchEvent( event );

      expect( wrapper.state().data ).to.deep.equal( [ [ "1", "2", "3" ] ] );
    } );

  } );

  describe( "Logging", () => {
    let stub;
    const table = "spreadsheet_events",
      params = {
        "event": "play",
        "url": additionalParams.spreadsheet.url,
        "api_key": "abc123"
      },
      sheet = document.getElementById( "rise-google-sheet" );

    beforeEach( () => {
      stub = sinon.stub( LoggerUtils, "logEvent" );

      wrapper = mount(
        <Spreadsheet
          { ...additionalParams }
          height={ window.innerHeight }
          width={ window.innerWidth } />
      );
    } );

    afterEach( () => {
      LoggerUtils.logEvent.restore();
    } );

    it( "should log the play event", () => {
      const event = document.createEvent( "Event" ),
        sheet = document.getElementById( "rise-google-sheet" );

      event.initEvent( "rise-google-sheet-response", true, true );
      event.detail = {
        results: data
      };

      sheet.dispatchEvent( event );

      expect( stub.withArgs( table, params ).called ).to.equal( true );
    } );

    xit( "should log the done event", () => {
      // TODO: Needs auto-scroll first.
    } );

    it( "should log the default error event", () => {
      const event = document.createEvent( "Event" ),
        params = {
          "event": "error",
          "event_details": "spreadsheet not reachable",
          "error_details": "The request failed with status code: 0",
          "url": additionalParams.spreadsheet.url,
          "request_url": "",
          "api_key": "abc123"
        };

      event.initEvent( "rise-google-sheet-error", true, true );
      event.detail = {
        "error": {
          "message": ""
        }
      };
      sheet.dispatchEvent( event );

      expect( stub.withArgs( table, params ).called ).to.equal( true );
    } );

    it( "should log the error event when spreadsheet is not reachable", () => {
      let event = document.createEvent( "Event" ),
        params = {
          "event": "error",
          "event_details": "spreadsheet not reachable",
          "error_details": "The request failed with status code: 503",
          "url": additionalParams.spreadsheet.url,
          "request_url": "https://sheets.googleapis.com/v4/spreadsheets/xxxxxxxxxx/values/Sheet1?key=abc123&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE",
          "api_key": "abc123"
        };

      event.initEvent( "rise-google-sheet-error", true, true );
      event.detail = {
        "error": {
          "message": "The request failed with status code: 503"
        },
        "request": {
          "url": params.request_url
        }
      };
      sheet.dispatchEvent( event );

      expect( stub.withArgs( table, params ).called ).to.equal( true );
    } );

    it( "should log the error event when spreadsheet is not public ", () => {
      const event = document.createEvent( "Event" ),
        params = {
          "event": "error",
          "event_details": "spreadsheet not public",
          "error_details": "The request failed with status code: 403",
          "url": additionalParams.spreadsheet.url,
          "request_url": "https://sheets.googleapis.com/v4/spreadsheets/xxxxxxxxxx/values/Sheet1?key=abc123&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE",
          "api_key": "abc123"
        };

      event.initEvent( "rise-google-sheet-error", true, true );
      event.detail = {
        "error": {
          "message": "The request failed with status code: 403"
        },
        "request": {
          "url": params.request_url
        }
      };
      sheet.dispatchEvent( event );

      expect( stub.withArgs( table, params ).called ).to.equal( true );
    } );

    it( "should log the error event when spreadsheet is not found ", () => {
      const event = document.createEvent( "Event" ),
        params = {
          "event": "error",
          "event_details": "spreadsheet not found",
          "error_details": "The request failed with status code: 404",
          "url": additionalParams.spreadsheet.url,
          "request_url": "https://sheets.googleapis.com/v4/spreadsheets/xxxxxxxxxx/values/Sheet1?key=abc123&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE",
          "api_key": "abc123"
        };

      event.initEvent( "rise-google-sheet-error", true, true );
      event.detail = {
        "error": {
          "message": "The request failed with status code: 404"
        },
        "request": {
          "url": params.request_url
        }
      };
      sheet.dispatchEvent( event );

      expect( stub.withArgs( table, params ).called ).to.equal( true );
    } );

    it( "should log the quota error event", () => {
      const event = document.createEvent( "Event" ),
        params = {
          "event": "error",
          "event_details": "api quota exceeded",
          "url": additionalParams.spreadsheet.url,
          "api_key": "abc123"
        };

      event.initEvent( "rise-google-sheet-quota", true, true );
      event.detail = {};
      sheet.dispatchEvent( event );

      expect( stub.withArgs( table, params ).called ).to.equal( true );
    } );
  } );


  describe( "Column formatting", () => {

    afterEach( () => {
      additionalParams.format.columns = columnsParam;
    } );

    describe( "Header text", () => {
      it( "Should use default header text if custom header text is empty", () => {
        const expected = [ "Column 1", "Column 2", "Column 3" ];

        additionalParams.format.columns[ 0 ].headerText = "";
        wrapper = shallow(
          <Spreadsheet
            { ...additionalParams }
            height={ window.innerHeight }
            width={ window.innerWidth } />
        );

        wrapper.setState( { data, message: "" } );

        expect( wrapper.find( TableHeader ).props().data ).to.deep.equal( expected );
      } );

      it( "should use default header text if column formatting is not defined", () => {
        const expected = [ "Column 1", "Column 2", "Column 3" ];

        additionalParams.format.columns = [];
        wrapper = shallow(
          <Spreadsheet
            { ...additionalParams }
            height={ window.innerHeight }
            width={ window.innerWidth } />
        );

        wrapper.setState( { data, message: "" } );

        expect( wrapper.find( TableHeader ).props().data ).to.deep.equal( expected );
      } );
    } );

    describe( "columnFormats prop", () => {
      it( "Should set all properties for those columns with formatting applied and should set the " +
        "width of all other columns", () => {
        const expected = [
          {
            id: additionalParams.format.columns[ 0 ].id,
            numeric: false,
            alignment: "left",
            width: 100,
            colorCondition: "none"
          },
          {
            width: 250
          },
          {
            width: 250
          }
        ];

        wrapper = shallow(
          <Spreadsheet
            { ...additionalParams }
            height={ window.innerHeight }
            width={ window.innerWidth } />
        );

        wrapper.setState( { data, message: "" } );

        expect( wrapper.find( TableHeader ).props().columnFormats ).to.deep.equal( expected );
        expect( wrapper.find( Scroll ).props().columnFormats ).to.deep.equal( expected );
      } );

      it( "Should return equal width columns if column formatting is not defined on any " +
        "columns", () => {
        const expected = [ { width: 200 }, { width: 200 }, { width: 200 } ];

        additionalParams.format.columns = [];

        wrapper = shallow(
          <Spreadsheet
            { ...additionalParams }
            height={ window.innerHeight }
            width={ window.innerWidth } />
        );

        wrapper.setState( { data, message: "" } );

        expect( wrapper.find( TableHeader ).props().columnFormats ).to.deep.equal( expected );
        expect( wrapper.find( Scroll ).props().columnFormats ).to.deep.equal( expected );
      } );

      it( "Should return numeric property as defined by params", () => {
        const expected = [
          {
            id: additionalParams.format.columns[ 0 ].id,
            numeric: true,
            alignment: "left",
            width: 100,
            colorCondition: "none"
          },
          {
            width: 250
          },
          {
            width: 250
          }
        ];

        additionalParams.format.columns[ 0 ].numeric = true;

        wrapper = shallow(
          <Spreadsheet
            { ...additionalParams }
            height={ window.innerHeight }
            width={ window.innerWidth } />
        );

        wrapper.setState( { data, message: "" } );

        expect( wrapper.find( TableHeader ).props().columnFormats ).to.deep.equal( expected );
        expect( wrapper.find( Scroll ).props().columnFormats ).to.deep.equal( expected );
      } );

    } );

  } );
} );
