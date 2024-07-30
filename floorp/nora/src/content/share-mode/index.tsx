/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { insert } from "@solid-xul/solid-xul";
import { ShareModeElement } from "./browser-share-mode";

export function initShareMode() {
  insert(
    document.querySelector("#menu_ToolsPopup"),
    () => <ShareModeElement />,
    document.querySelector("#menu_openFirefoxView"),
  );
}
