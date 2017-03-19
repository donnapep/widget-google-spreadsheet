/* global describe, before, beforeEach, it, sinon  */

import React from "react";
import { shallow } from "enzyme";
import { expect } from "chai";
import Scroll from "../../../src/widget/components/scroll";
import Table from "../../../src/widget/components/table";

describe( "<Scroll />", () => {
  let server;
  const align = "center",
    className = "body_font-style",
    columnFormats = [ { "width": 100 }, { "width": 200 }, { "width": 300 } ],
    data = [
      [ "I am the walrus!", "1", "3" ],
      [ "John is dead!", "500", "32" ]
    ],
    hasHeader = true,
    height = 50,
    onDone = () => {},
    rowHeight = 50,
    scroll = {},
    width = 600;

  let wrapper;

  before( () => {
    server = sinon.fakeServer.create();
    server.respondImmediately = true;
    server.respondWith( "POST", "https://www.googleapis.com/oauth2/v3/token", [ 200, { "Content-Type": "text/html" }, "OK" ] );
  } );

  beforeEach( () => {
    const component =
      <Scroll
        align={ align }
        className={ className }
        columnFormats={ columnFormats }
        data={ data }
        hasHeader={ hasHeader }
        height={ height }
        onDone={ onDone }
        rowHeight={ rowHeight }
        scroll={ scroll }
        width={ width } />;

    wrapper = shallow( component );
  } );

  describe( "Page", () => {
    it( "Should set the page class to the section element", () => {
      expect( wrapper.find( "section" ).props().className ).to.equal( "page" );
    } );
  } );


  describe( "<Table />", () => {
    it( "Should contain a Table component", () => {
      expect( wrapper.find( Table ) ).to.have.length( 1 );
    } );

    it( "Should have align prop", () => {
      expect( wrapper.find( Table ).props().align ).to.equal( align );
    } );

    it( "Should have className prop", () => {
      expect( wrapper.find( Table ).props().className ).to.equal( className );
    } );

    it( "Should have columnFormats prop", () => {
      expect( wrapper.find( Table ).props().columnFormats ).to.deep.equal( columnFormats );
    } );

    it( "Should have data prop", () => {
      const expected = [
        [ "I am the walrus!", "1", "3" ],
        [ "John is dead!", "500", "32" ]
      ];

      expect( wrapper.find( Table ).props().data ).to.deep.equal( expected );
    } );

    it( "Should have height prop", () => {
      expect( wrapper.find( Table ).props().height ).to.equal( height );
    } );

    it( "Should have rowHeight prop", () => {
      expect( wrapper.find( Table ).props().rowHeight ).to.equal( rowHeight );
    } );

    it( "Should have width prop", () => {
      expect( wrapper.find( Table ).props().width ).to.equal( width );
    } );
  } );
} );
