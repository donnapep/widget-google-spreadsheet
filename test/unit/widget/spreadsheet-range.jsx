/* global describe, before, beforeEach, after, afterEach, it, sinon  */

import React from "react";
import { shallow } from "enzyme";
import { expect } from "chai";
import Spreadsheet from "../../../src/widget/components/spreadsheet";
import Scroll from "../../../src/widget/components/scroll";
import "../../data/spreadsheet-range";

describe( "Spreadsheet Range", () => {
  let server,
    wrapper;

  const additionalParams = window.gadget.settings.additionalParams,
    data = [ [ "Column 1", "Column 2", "Column 3" ], [ "A2", "B2", "C2" ] ];

  before( () => {
    server = sinon.fakeServer.create();
    server.respondImmediately = true;
    server.respondWith( "GET", "https://sheets.googleapis.com/v4/spreadsheets/xxxxxxxxxx?key=abc123",
      [ 200, { "Content-Type": "application/json" },
        "{ \"sheets\": [{ \"properties\": { \"title\": \"Sheet1\" } }] }" ] );
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

  describe( "<Scroll />", () => {
    beforeEach( () => {
      wrapper.setState( { data, message: "" } );
    } );

    it( "Should contain a Scroll component", () => {
      expect( wrapper.find( Scroll ) ).to.have.length( 1 );
    } );

    it( "Should have data prop", () => {
      expect( wrapper.find( Scroll ).props().data ).to.deep.equal( [ data[ 1 ] ] );
    } );
  } );

  describe( "Don't Use First Row As Header", () => {
    beforeEach( () => {
      additionalParams.spreadsheet.hasHeader = false;
      wrapper = shallow(
        <Spreadsheet
          { ...additionalParams }
          height={ window.innerHeight }
          width={ window.innerWidth } />
      );
      wrapper.setState( { data, message: "" } );
    } );

    afterEach( () => {
      additionalParams.spreadsheet.hasHeader = true;
    } );

    it( "Should have data prop", () => {
      expect( wrapper.find( Scroll ).props().data ).to.deep.equal( data );
    } );
  } );

  describe( "Single cell range", () => {

    beforeEach( () => {
      wrapper = shallow(
        <Spreadsheet
          { ...additionalParams }
          height={ window.innerHeight }
          width={ window.innerWidth } />
      );
      wrapper.setState( { data: [ [ "Cell B3" ] ], message: "" } );
    } );

    it( "Should not contain a Scroll component", () => {
      expect( wrapper.find( Scroll ) ).to.have.length( 0 );
    } );
  } );

  describe( "Single cell range without first row as header", () => {

    beforeEach( () => {
      additionalParams.spreadsheet.hasHeader = false;
      wrapper = shallow(
        <Spreadsheet
          { ...additionalParams }
          height={ window.innerHeight }
          width={ window.innerWidth } />
      );
      wrapper.setState( { data: [ [ "B3" ] ], message: "" } );
    } );

    afterEach( () => {
      additionalParams.spreadsheet.hasHeader = true;
    } );

    it( "Should contain a Scroll component", () => {
      expect( wrapper.find( Scroll ) ).to.have.length( 1 );
    } );

    it( "Should have data prop", () => {
      expect( wrapper.find( Scroll ).props().data ).to.deep.equal( [ [ "B3" ] ] );
    } );

  } );

} );
