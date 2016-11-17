require("fixed-data-table/dist/fixed-data-table.min.css");

import React from "react";

var $ = require("jquery");
import "../../components/gsap/src/uncompressed/TweenLite"
import "../../components/gsap/src/uncompressed/plugins/CSSPlugin";
import "../../components/gsap/src/uncompressed/utils/Draggable";
import "../../components/gsap/src/uncompressed/plugins/ScrollToPlugin";

import "../../components/auto-scroll/jquery.auto-scroll";

class Scroll extends React.Component {
  constructor( props ) {
    super( props );
  }

  componentDidMount() {
    this.scroll = $( this.refs.scroll );
    this.initScroll();
  }

  componentWillReceiveProps(nextProps) {
    this.resize = this.scroll && ( this.props.height !== nextProps.height );
  }

  componentDidUpdate() {
    if ( this.resize ) {
      $( this.scroll.data( "plugin_autoScroll" ).element ).trigger( "resize" );

      if ( this.canScroll() ) {
        this.play();
      }
    }
  }

  componentWillUnmount() {
    this.destroyScroll();
  }

  initScroll() {
    const { onDone, scroll } = this.props;

    if ( this.scroll ) {
      this.scroll.autoScroll( scroll ).on( "done", onDone );
    }
  }

  canScroll() {
    return this.props.scroll.by !== "none" && this.scroll && this.scroll.data("plugin_autoScroll") &&
      this.scroll.data("plugin_autoScroll").canScroll();
  }

  destroyScroll() {
    const { onDone, scroll } = this.props;

    if ( this.scroll ) {
      this.scroll.autoScroll( scroll ).off( "done", onDone );
      this.scroll.data( "plugin_autoScroll" ).destroy();
    }
  }

  play() {
    if (this.scroll && this.scroll.data("plugin_autoScroll")) {
      this.scroll.data("plugin_autoScroll").play();
    }
  }

  pause() {
    if (this.scroll && this.scroll.data("plugin_autoScroll")) {
      this.scroll.data("plugin_autoScroll").pause();
    }
  }

  render() {
    const { height } = this.props;

    return (
      <div id="scroll" ref="scroll">
        <section className="page" style={ { height: height + "px" } }>
          { this.props.children }
        </section>
      </div>
    );
  }
}

export default Scroll;
