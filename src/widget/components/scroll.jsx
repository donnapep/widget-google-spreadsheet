require("fixed-data-table/dist/fixed-data-table.min.css");

import React from "react";
import Table from "./table";

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

  componentWillMount() {
    this.height = this.props.height;
  }

  componentWillUpdate( nextProps, nextState ) {
    this.height = (nextProps.data.length * nextProps.rowHeight) + ((nextProps.hasHeader) ? nextProps.rowHeight : 0)
    $(this.refs.page).height(this.height);

    this.scroll.data("plugin_autoScroll").destroy();
    this.scroll.autoScroll(nextProps.scroll).on("done", () => {
      nextProps.onDone();
    });
  }

  componentDidUpdate() {
    if (this.canScroll()) {
      this.play();
    }
  }

  componentDidMount() {
    this.scroll = $(this.refs.scroll);
    this.height = (this.props.data.length * this.props.rowHeight) + ((this.props.hasHeader) ? this.props.rowHeight : 0)

    $(this.refs.page).height(this.height);

    this.scroll.autoScroll(this.props.scroll).on("done", () => {
      this.props.onDone();
    });
  }

  canScroll() {
    return this.props.scroll.by !== "none" && this.scroll && this.scroll.data("plugin_autoScroll") &&
      this.scroll.data("plugin_autoScroll").canScroll();
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
    return (
      <div id="scroll" ref="scroll">
        <section className="page" ref="page">
            <Table
              data={this.props.data}
              align={this.props.align}
              class={this.props.class}
              totalCols={this.props.totalCols}
              rowHeight={this.props.rowHeight}
              width={this.props.width}
              height={this.height}
              columnFormats={this.props.columnFormats} />
        </section>
      </div>
    );
  }
}

export default Scroll;
