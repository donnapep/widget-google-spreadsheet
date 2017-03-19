/* global describe, beforeEach, it  */

import React from "react";
import { mount, shallow } from "enzyme";
import { expect } from "chai";
import { Column } from "fixed-data-table";
import ResponsiveFixedDataTable from "../../../src/components/responsive-fixed-data-table/lib/responsive-fixed-data-table";
import Table from "../../../src/widget/components/table";
import TableCell from "../../../src/widget/components/table-cell";

describe( "<Table />", () => {
  const align = "center",
    cellClassName = "body_font-style",
    data = [
      [ "I am the<br> walrus!", "1", "-3" ],
      [ "John is dead!", "500", "-32" ]
    ],
    height = 50,
    rowHeight = 50,
    width = 600;

  let columnFormats =
    [
      { "width": 100 },
      { "width": 200 },
      { "width": 300 }
    ],
    wrapper;

  describe( "<ResponsiveFixedDataTable />", () => {
    let props;

    beforeEach( () => {
      wrapper = shallow(
        <Table
          align={ align }
          className={ cellClassName }
          columnFormats={ columnFormats }
          data={ data }
          height={ height }
          rowHeight={ rowHeight }
          width={ width } />
      );

      props = wrapper.props();
    } );

    it( "Should contain a ResponsiveFixedDataTable component", () => {
      expect( wrapper.find( ResponsiveFixedDataTable ) ).to.exist;
    } );

    it( "Should have headerHeight prop", () => {
      expect( props.headerHeight ).to.equal( 0 );
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
      expect( props.rowHeight ).to.be.equal( rowHeight );
    } );

    it( "Should have rowsCount prop", () => {
      expect( props.rowsCount ).to.equal( data.length );
    } );

    it( "Should have width prop", () => {
      expect( props.width ).to.equal( width );
    } );

    it( "Should have correct number of columns as children", () => {
      expect( props.children.length ).to.equal( 3 );
    } );
  } );

  describe( "<Column />", () => {
    let props;

    beforeEach( () => {
      wrapper = shallow(
        <Table
          align={ align }
          className={ cellClassName }
          columnFormats={ columnFormats }
          data={ data }
          height={ height }
          rowHeight={ rowHeight }
          width={ width } />
      );

      props = wrapper.props().children[ 0 ].props;
    } );

    it( "Should have correct number of columns", () => {
      expect( wrapper.find( Column ).length ).to.equal( data[ 0 ].length );
    } );

    describe( "Alignment", () => {
      it( "Should use alignment from align prop", () => {
        expect( props.align ).to.equal( align );
      } );

      it( "Should use default alignment if neither align nor columnFormats.alignment props exist", () => {
        wrapper = shallow(
          <Table
            className={ cellClassName }
            columnFormats={ columnFormats }
            data={ data }
            height={ height }
            rowHeight={ rowHeight }
            width={ width } />
        );

        expect( wrapper.props().children[ 0 ].props.align ).to.equal( "left" );
      } );

      it( "Should use alignment from columnFormats prop", () => {
        columnFormats = [
          { "alignment": "right", "width": 100 },
          { "width": 200 },
          { "width": 300 }
        ];

        wrapper = shallow(
          <Table
            align={ align }
            className={ cellClassName }
            columnFormats={ columnFormats }
            data={ data }
            height={ height }
            rowHeight={ rowHeight }
            width={ width } />
        );

        expect( wrapper.props().children[ 0 ].props.align ).to.equal( columnFormats[ 0 ].alignment );
      } );

    } );

    it( "Should have cell prop", () => {
      expect( props.cell ).to.be.a( "function" );
    } );

    it( "Should have columnKey prop", () => {
      expect( props.columnKey ).to.equal( 0 );
    } );

    it( "Should have key prop", () => {
      expect( wrapper.props().children[ 0 ].key ).to.equal( "0" );
    } );

    it( "Should have width prop", () => {
      expect( props.width ).to.equal( columnFormats[ 0 ].width );
    } );
  } );

  describe( "<TableCell />", () => {
    beforeEach( () => {
      wrapper = mount(
        <Table
          align={ align }
          className={ cellClassName }
          columnFormats={ columnFormats }
          data={ data }
          height={ height }
          rowHeight={ rowHeight }
          width={ width } />
      );
    } );

    it( "Should have correct number of table cells", () => {
      expect( wrapper.find( TableCell ).length ).to.equal( data[ 0 ].length );
    } );

    it( "Should have className prop", () => {
      expect( wrapper.find( TableCell ).first().props().className ).to.equal( cellClassName );
    } );

    it( "Should have columnFormats prop", () => {
      expect( wrapper.find( TableCell ).first().props().columnFormats ).to.equal( columnFormats );
    } );

    it( "Should have columnKey prop", () => {
      expect( wrapper.find( TableCell ).first().props().columnKey ).to.equal( 0 );
    } );

    it( "Should have data prop", () => {
      expect( wrapper.find( TableCell ).first().props().data ).to.equal( data[ 0 ][ 0 ] );
    } );

    it( "Should have height prop", () => {
      expect( wrapper.find( TableCell ).first().props().height ).to.equal( height );
    } );

    it( "Should have width prop", () => {
      expect( wrapper.find( TableCell ).first().props().width ).to.equal( columnFormats[ 0 ].width );
    } );
  } );
} );
