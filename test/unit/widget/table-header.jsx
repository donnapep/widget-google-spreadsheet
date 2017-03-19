/* global describe, beforeEach, it */

import React from "react";
import { mount, shallow } from "enzyme";
import { expect } from "chai";
import { Cell, Column } from "fixed-data-table";
import Table from "../../../src/widget/components/table";
import TableHeader from "../../../src/widget/components/table-header";

describe( "<TableHeader />", () => {
  const align = "center",
    columnFormats = [
      { "width": 100 },
      { "width": 200 },
      { "width": 300 }
    ],
    data = [ "Column 1", "Column 2", "Column 3" ],
    height = 50,
    width = 600;

  let wrapper;

  describe( "<Table />", () => {
    let props;

    beforeEach( () => {
      wrapper = shallow(
        <TableHeader
          align={ align }
          columnFormats={ columnFormats }
          data={ data }
          height={ height }
          width={ width } />
      );

      props = wrapper.props();
    } );

    it( "Should contain a Table component", () => {
      expect( wrapper.find( Table ) ).to.exist;
    } );

    it( "Should have headerHeight prop", () => {
      expect( props.headerHeight ).to.equal( height );
    } );

    it( "Should have height prop", () => {
      expect( props.height ).to.equal( height );
    } );

    it( "Should have overflowX prop", () => {
      expect( props.overflowX ).to.equal( "hidden" );
    } );

    it( "Should have overflowY prop", () => {
      expect( props.overflowY ).to.equal( "hidden" );
    } );

    it( "Should have rowHeight prop", () => {
      expect( props.rowHeight ).to.equal( 1 );
    } );

    it( "Should have rowsCount prop", () => {
      expect( props.rowsCount ).to.equal( 0 );
    } );

    it( "Should have width prop", () => {
      expect( props.width ).to.equal( width );
    } );

    it( "Should have correct number of columns as children", () => {
      expect( props.children.length ).to.equal( data.length );
    } );
  } );

  describe( "<Column />", () => {
    let props;

    beforeEach( () => {
      wrapper = shallow(
        <TableHeader
          align={ align }
          columnFormats={ columnFormats }
          data={ data }
          height={ height }
          width={ width } />
      );

      props = wrapper.props().children[ 0 ].props;
    } );

    it( "Should have correct number of columns", () => {
      expect( wrapper.find( Column ).length ).to.equal( data.length );
    } );

    describe( "Alignment", () => {
      it( "Should use alignment from align prop", () => {
        expect( props.align ).to.equal( align );
      } );

      it( "Should use default alignment if align prop does not exist", () => {
        wrapper = shallow(
          <TableHeader
            columnFormats={ columnFormats }
            data={ data }
            height={ height }
            width={ width } />
        );

        expect( wrapper.props().children[ 0 ].props.align ).to.equal( "left" );
      } );
    } );

    it( "Should have header prop", () => {
      expect( props.header ).to.exist;
    } );

    it( "Should have key prop", () => {
      expect( wrapper.props().children[ 0 ].key ).to.equal( "0" );
    } );

    it( "Should have width prop", () => {
      expect( props.width ).to.equal( columnFormats[ 0 ].width );
    } );
  } );

  describe( "<Cell />", () => {
    beforeEach( () => {
      wrapper = mount(
        <TableHeader
          align={ align }
          columnFormats={ columnFormats }
          data={ data }
          height={ height }
          width={ width } />
      );
    } );

    it( "Should have correct number of cells", () => {
      expect( wrapper.find( Cell ).length ).to.equal( data.length );
    } );

    it( "Should have className prop", () => {
      expect( wrapper.find( Cell ).first().props().className ).to.equal( "header_font-style" );
    } );

    it( "Should set cell text", () => {
      expect( wrapper.find( Cell ).first().text() ).to.equal( data[ 0 ] );
    } );
  } );
} );
