/**
 * External dependencies
 */
import React, { Component, PropTypes } from "react";
import { Cell } from "fixed-data-table";
require( "fixed-data-table/dist/fixed-data-table.min.css" );

/**
 * Module variables
 */
const changeUp = "change-up";
const changeDown = "change-down";

class TableCell extends Component {
  static propTypes = {
    className: PropTypes.string,
    columnFormats: PropTypes.array,
    columnKey: PropTypes.number,
    data: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
  };

  constructor() {
    super();

    this.numericValueChange = "none";
  }

  componentWillUpdate( nextProps ) {
    const {
      columnFormats,
      columnKey,
      data,
    } = this.props;
    const {
      colorCondition,
      numeric,
    } = columnFormats[ columnKey ];

    if ( nextProps.data === data ) {
      // no numeric value change
      this.numericValueChange = "none";
      return;
    }

    if ( !numeric || ( ( changeUp !== colorCondition ) && ( changeDown !== colorCondition ) ) ) {
      return;
    }

    let nextVal = parseFloat( nextProps.data );
    let currentVal = parseFloat( data );

    if ( !isNaN( nextVal ) && !isNaN( currentVal ) ) {
      // value went up or down
      this.numericValueChange = ( nextVal > currentVal ) ? "up" : "down";
    }
  }

  getClassName( columnKey ) {
    const {
      className,
      columnFormats,
      data,
    } = this.props;
    let {
      colorCondition,
      id,
      numeric,
    } = columnFormats[ columnKey ];
    let classes = className;

    // Column formatting overrides header formatting.
    if ( undefined !== id ) {
      classes = "_" + id;
    }

    // Color conditions
    if ( numeric && ( colorCondition !== "none" ) ) {
      classes += this.getColorConditionClass( data, colorCondition );
    }

    return classes;
  }

  getColorConditionClass( value, colorCondition ) {
    const positiveValue = "value-positive";
    const negativeValue = "value-negative";

    value = parseFloat( value );

    if ( isNaN( value ) ) {
      return "";
    }

    // Check if value is positive or negative.
    if ( ( colorCondition === positiveValue ) || ( colorCondition === negativeValue ) ) {
      if ( value > 0 ) {
        return colorCondition === positiveValue ? " green" : " red";
      }

      if ( value < 0 ) {
        return colorCondition === positiveValue ? " red" : " green";
      }
    }

    // apply change conditions if value changed
    if ( ( colorCondition === changeUp ) && ( "none" !== this.numericValueChange ) ) {
      return this.numericValueChange === "up" ? " green" : " red";
    }

    if ( ( colorCondition === changeDown ) && ( "none" !== this.numericValueChange ) ) {
      return this.numericValueChange === "up" ? " red" : " green";
    }
  }

  createMarkup = html => {
    return { __html: html };
  }

  render() {
    const {
      columnKey,
      data,
      height,
      width,
    } = this.props;

    return (
      <Cell
        className={ this.getClassName( columnKey ) }
        columnKey={ columnKey }
        height={ height }
        width={ width }>
        <span dangerouslySetInnerHTML={ this.createMarkup( data ) }></span>
      </Cell>
    );
  }
}

export default TableCell;
