/**
 * External dependencies
 */
import React, { PropTypes } from "react";
import { Table } from "fixed-data-table";
import { Column, Cell } from "fixed-data-table";
require( "fixed-data-table/dist/fixed-data-table.min.css" );

const TableHeader = ( {
  align,
  columnFormats,
  data,
  height,
  width,
} ) => {
  const renderColumns = () => {
    let cols = [];

    for ( let i = 0; i < data.length; i++ ) {
      cols.push(
        <Column
          align={ align ? align : "left" }
          header={
            <Cell className={ "header_font-style" }>
              { data[ i ] }
            </Cell>
          }
          key={ i }
          width={ columnFormats[ i ].width } />
      );
    }

    return cols;
  };

  return (
    <Table
      headerHeight={ height }
      height={ height }
      overflowX="hidden"
      overflowY="hidden"
      rowHeight={ 1 }
      rowsCount={ 0 }
      width={ width }>
      { renderColumns() }
    </Table>
  );
};

TableHeader.propTypes = {
  align: PropTypes.string,
  columnFormats: PropTypes.array,
  data: PropTypes.array,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default TableHeader;
