/**
 * External dependencies
 */
import React, { Component, PropTypes } from "react";
import "../../components/gsap/src/uncompressed/TweenLite"
import "../../components/gsap/src/uncompressed/plugins/CSSPlugin";
import "../../components/gsap/src/uncompressed/utils/Draggable";
import "../../components/gsap/src/uncompressed/plugins/ScrollToPlugin";
import "../../components/auto-scroll/jquery.auto-scroll";
require( "fixed-data-table/dist/fixed-data-table.min.css" );

/**
 * Internal dependencies
 */
import Table from "./table";

/**
 * Module variables
 */
const $ = require( "jquery" );

class Scroll extends Component {
  static propTypes = {
    align: PropTypes.string,
    className: PropTypes.string,
    columnFormats: PropTypes.array,
    data: PropTypes.array,
    hasHeader: PropTypes.bool,
    height: PropTypes.number,
    onDone: PropTypes.func,
    rowHeight: PropTypes.number,
    scroll: PropTypes.object,
    width: PropTypes.number,
  };

  componentDidMount() {
    const {
      data,
      hasHeader,
      onDone,
      rowHeight,
      scroll,
    } = this.props;

    $( this.page ).height( ( data.length * rowHeight ) + ( ( hasHeader ) ? rowHeight : 0 ) );

    this.scroll.autoScroll( scroll ).on( "done", () => {
      onDone();
    } );
  }

  setScrollInstance = ref => this.scroll = $( ref );

  setPageInstance = ref => this.page = ref;

  hasScrollInstance() {
    return this.scroll && this.scroll.data( "plugin_autoScroll" );
  }

  canScroll() {
    return this.props.scroll.by !== "none" && this.hasScrollInstance() &&
      this.scroll.data( "plugin_autoScroll" ).canScroll();
  }

  play() {
    if ( !this.hasScrollInstance() ) {
      return;
    }

    this.scroll.data( "plugin_autoScroll" ).play();
  }

  pause() {
    if ( !this.hasScrollInstance() ) {
      return;
    }

    this.scroll.data( "plugin_autoScroll" ).pause();
  }

  render() {
    const {
      align,
      className,
      columnFormats,
      data,
      height,
      rowHeight,
      width,
    } = this.props;

    return (
      <div className="scroll" ref={ this.setScrollInstance }>
        <section className="page" ref={ this.setPageInstance }>
          <Table
            align={ align }
            className={ className }
            columnFormats={ columnFormats }
            data={ data }
            height={ height }
            rowHeight={ rowHeight }
            width={ width } />
        </section>
      </div>
    );
  }
}

export default Scroll;
