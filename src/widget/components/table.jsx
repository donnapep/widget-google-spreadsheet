require("fixed-data-table/dist/fixed-data-table.min.css");

import React from "react";
import { Column, Cell } from "fixed-data-table";
import ResponsiveFixedDataTable from "responsive-fixed-data-table";

var $ = require("jquery");

const Table = React.createClass({

  contentHeightChangeVal: 0,

  createMarkup: function(html) {
    return {
      __html: html
    }
  },

  getAlignment: function(index) {
    var { align, columnFormats } = this.props;

    // Column formatting overrides header formatting.
    if (columnFormats[index].alignment) {
      return columnFormats[index].alignment;
    }
    else if (align) {
      return align;
    }
    else {
      return "left";
    }
  },

  getRowClassName: function(index) {
    // add 1 to index value so the first row is considered odd
    return ((index + 1) % 2) ? "odd" : "even";
  },

  getCellClassName: function(columnIndex, value) {
    const { columnFormats } = this.props;

    let classes = "",
      columnFormat = columnFormats[columnIndex];

    // Column formatting overrides header formatting.
    if (columnFormat.id) {
      classes = columnFormats[columnIndex].id;
    }
    else {
      classes = this.props.class;
    }

    // Color conditions
    if (columnFormat.numeric && (columnFormat.colorCondition !== "none")) {
      classes += this.getColorConditionClass(value, columnFormat.colorCondition);
    }

    return classes;
  },

  getColorConditionClass: function(value, colorCondition) {
    const positiveValue = "value-positive",
      negativeValue = "value-negative";

    value = parseFloat(value);

    if (!isNaN(value)) {
      // Check if value is positive or negative.
      if ((colorCondition === positiveValue) || (colorCondition === negativeValue)) {
        if (value > 0) {
          return colorCondition === positiveValue ? " green" : " red";
        }
        else if (value < 0) {
          return colorCondition === positiveValue ? " red" : " green";
        }
      }
    }

    return "";
  },

  handleContentHeightChange: function(height) {
    console.log("handleContentHeightChange", height);
    this.contentHeightChangeVal = height;
  },

  getRowHeight: function(index) {
    var $cells = $(".fixedDataTableLayout_rowsContainer div .fixedDataTableRowLayout_rowWrapper").eq(index).find(".public_fixedDataTableCell_cellContent"),
      height = this.props.rowHeight,
      that = this;

    $cells.each(function () {
      if ($(this).outerHeight() > that.props.rowHeight) {
        height = $(this).outerHeight();
        return false;
      }
    });

    return height;
  },

  render: function() {
    var cols = [];

    // Create the columns.
    for (var i = 0; i < this.props.totalCols; i++) {
      cols.push(
        <Column
          key={i}
          columnKey={i}
          align={this.getAlignment(i)}
          width={this.props.columnFormats[i].width}
          cell={ props => (
            <Cell
              width={props.width}
              height={props.height}
              className={this.getCellClassName(props.columnKey, this.props.data[props.rowIndex][props.columnKey])}
              columnKey={props.columnKey}>
              <span dangerouslySetInnerHTML={this.createMarkup(this.props.data[props.rowIndex][props.columnKey])}></span>
            </Cell>
          )}
        />
      );
    }

    return(
      <ResponsiveFixedDataTable
        rowHeight={this.props.rowHeight}
        rowHeightGetter={this.getRowHeight}
        onContentHeightChange={this.handleContentHeightChange}
        rowsCount={this.props.data.length}
        rowClassNameGetter={this.getRowClassName}
        width={this.props.width}
        height={this.props.height}
        headerHeight={0}
        overflowY="hidden">
        {cols}
      </ResponsiveFixedDataTable>
    );
  }
});

export default Table;
