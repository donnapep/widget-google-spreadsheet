/* global describe, beforeEach, it  */

import React from "react";
import { mount, shallow } from "enzyme";
import { expect } from "chai";
import { Cell } from "fixed-data-table";
import TableCell from "../../../src/widget/components/table-cell";

describe( "<TableCell />", () => {
  const cellClassName = "body_font-style",
    columnKey = 2,
    data = "I am the walrus!",
    height = 50,
    width = 100;

  let columnFormats = [
      { "width": 100 },
      { "width": 200 },
      { "width": 300 }
    ],
    wrapper;

  describe( "<Cell />", () => {
    let cell;

    beforeEach( () => {
      wrapper = shallow(
        <TableCell
          className={ cellClassName }
          columnFormats={ columnFormats }
          columnKey={ columnKey }
          data={ data }
          height={ height }
          width={ width } />
      );

      cell = wrapper.find( Cell );
    } );

    describe( "className", () => {
      it( "Should have className prop", () => {
        expect( cell.props().className ).to.equal( cellClassName );
      } );

      it( "Should use className from columnFormats prop", () => {
        columnFormats = [
          { "width": 100 },
          { "width": 200 },
          { "id": "2", "width": 300 }
        ];

        wrapper = shallow(
          <TableCell
            className={ cellClassName }
            columnFormats={ columnFormats }
            columnKey={ columnKey }
            data={ data }
            height={ height }
            width={ width } />
        );

        expect( wrapper.find( Cell ).props().className ).to.equal( "_" + columnFormats[ columnKey ].id );
      } );

      it( "Should add 'green' class for a positive number when condition is 'value-positive'", () => {
        columnFormats = [
          { width: 100 },
          { id: "1", width: 200, numeric: true, colorCondition: "value-positive" },
          { width: 300 }
        ];

        wrapper = shallow(
          <TableCell
            className={ cellClassName }
            columnFormats={ columnFormats }
            columnKey={ 1 }
            data={ "5" }
            height={ height }
            width={ width } />
        );

        expect( wrapper.find( Cell ).props().className ).to.equal( "_" + columnFormats[ 1 ].id + " green" );
      } );

      it( "Should add 'red' class for a negative number when condition is 'value-positive'", () => {
        columnFormats = [
          { width: 100 },
          { width: 200 },
          { id: "2", width: 300, numeric: true, colorCondition: "value-positive" }
        ];

        wrapper = shallow(
          <TableCell
            className={ cellClassName }
            columnFormats={ columnFormats }
            columnKey={ 2 }
            data={ "-5" }
            height={ height }
            width={ width } />
        );

        expect( wrapper.find( Cell ).props().className ).to.equal( "_" + columnFormats[ 2 ].id + " red" );
      } );


      it( "Should add 'red' class for a positive number when condition is 'value-negative'", () => {
        columnFormats = [
          { width: 100 },
          { id: "1", width: 200, numeric: true, colorCondition: "value-negative" },
          { width: 300 }
        ];

        wrapper = shallow(
          <TableCell
            className={ cellClassName }
            columnFormats={ columnFormats }
            columnKey={ 1 }
            data={ "5" }
            height={ height }
            width={ width } />
        );

        expect( wrapper.find( Cell ).props().className ).to.equal( "_" + columnFormats[ 1 ].id + " red" );
      } );

      it( "Should add 'green' class for a negative number when condition is 'value-negative'", () => {
        columnFormats = [
          { width: 100 },
          { width: 200 },
          { id: "2", width: 300, numeric: true, colorCondition: "value-negative" }
        ];

        wrapper = shallow(
          <TableCell
            className={ cellClassName }
            columnFormats={ columnFormats }
            columnKey={ 2 }
            data={ "-5" }
            height={ height }
            width={ width } />
        );

        expect( wrapper.find( Cell ).props().className ).to.equal( "_" + columnFormats[ 2 ].id + " green" );
      } );

      it( "Should not add color condition class if value is not a number", () => {
        columnFormats = [
          { id: "0", width: 100, numeric: true, colorCondition: "value-positive" },
          { width: 200 },
          { width: 300 }
        ];

        wrapper = shallow(
          <TableCell
            className={ cellClassName }
            columnFormats={ columnFormats }
            columnKey={ 0 }
            data={ "Not a number" }
            height={ height }
            width={ width } />
        );

        expect( wrapper.find( Cell ).props().className ).to.equal( "_" + columnFormats[ 0 ].id );
      } );
    } );

    it( "Should have columnKey prop", () => {
      expect( cell.first().props().columnKey ).to.equal( columnKey );
    } );

    it( "Should have height prop", () => {
      expect( cell.first().props().height ).to.equal( height );
    } );

    it( "Should have width prop", () => {
      expect( cell.first().props().width ).to.equal( width );
    } );

    it( "Should set cell text", () => {
      wrapper = mount(
        <TableCell
          className={ cellClassName }
          columnFormats={ columnFormats }
          columnKey={ columnKey }
          data={ data }
          height={ height }
          width={ width } />
      );

      expect( wrapper.find( "span" ).at( 0 ).text() ).to.equal( data );
    } );
  } );
} );
