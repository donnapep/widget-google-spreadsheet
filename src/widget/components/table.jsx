/**
 * External dependencies
 */
import React, { PropTypes } from "react";
import { Column } from "fixed-data-table";
import ResponsiveFixedDataTable from "../../components/responsive-fixed-data-table/lib/responsive-fixed-data-table";
require( "fixed-data-table/dist/fixed-data-table.min.css" );

/**
 * Internal dependencies
 */
import TableCell from "../components/table-cell";

const Table = ( {
  align,
  className,
  columnFormats,
  data,
  height,
  rowHeight,
  width,
} ) => {
  const getAlignment = index => {
    // Column formatting overrides header formatting.
    if ( columnFormats[ index ].alignment ) {
      return columnFormats[ index ].alignment;
    }

    return align ? align : "left";
  };

  const getRowClassName = index => ( ( index + 1 ) % 2 ) ? "odd" : "even";

  const renderColumns = () => {
    let cols = [],
      totalCols = data[ 0 ].length;

    // Create the columns.
    for ( let i = 0; i < totalCols; i++ ) {
      cols.push(
        <Column
          align={ getAlignment( i ) }
          cell={ ( { columnKey, height, rowIndex, width } ) => (
            <TableCell
              className={ className }
              columnFormats={ columnFormats }
              columnKey={ columnKey }
              data={ data[ rowIndex ][ columnKey ] }
              height={ height }
              width={ width } />
          ) }
          columnKey={ i }
          key={ i }
          width={ columnFormats[ i ].width } />
      );
    }

    return cols;
  };

  return (
    <ResponsiveFixedDataTable
      headerHeight={ 0 }
      height={ height }
      overflowX="hidden"
      overflowY="hidden"
      rowClassNameGetter={ getRowClassName }
      rowHeight={ rowHeight }
      rowsCount={ data.length }
      width={ width }>
      { renderColumns() }
    </ResponsiveFixedDataTable>
  );
};

Table.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  columnFormats: PropTypes.array,
  data: PropTypes.array,
  height: PropTypes.number,
  rowHeight: PropTypes.number,
  width: PropTypes.number,
};

export default Table;
