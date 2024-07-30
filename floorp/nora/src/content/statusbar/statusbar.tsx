/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { showStatusbar } from "./browser-statusbar";
import statusbarStyle from "./statusbar.pcss?inline";

export function StatusBar() {
  return (
    <>
      <xul:toolbar
        id="statusBar"
        toolbarname="Status bar"
        customizable="true"
        class={`browser-toolbar customization-target ${
          showStatusbar() ? "" : "collapsed"
        }`}
        mode="icons"
        context="toolbar-context-menu"
        accesskey="A"
      >
        <xul:hbox
          id="status-text"
          align="center"
          flex="1"
          class="statusbar-padding"
        />
      </xul:toolbar>
      <style jsx>{statusbarStyle}</style>
    </>
  );
}
