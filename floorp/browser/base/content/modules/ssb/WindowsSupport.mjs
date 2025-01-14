/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SiteSpecificBrowserService } from "./SiteSpecificBrowserService.mjs";
import { SiteSpecificBrowserIdUtils } from "./SiteSpecificBrowserIdUtils.mjs";
import { ImageTools } from "./ImageTools.mjs";

export const WindowsSupport = {
  get shellService() {
    return Cc["@mozilla.org/browser/shell-service;1"].getService(
      Ci.nsIWindowsShellService
    );
  },
  get uiUtils() {
    return Cc["@mozilla.org/windows-ui-utils;1"].getService(
      Ci.nsIWindowsUIUtils
    );
  },
  get taskbar() {
    return Cc["@mozilla.org/windows-taskbar;1"].getService(Ci.nsIWinTaskbar);
  },
  get nsIFile() {
    return Components.Constructor(
      "@mozilla.org/file/local;1",
      Ci.nsIFile,
      "initWithPath"
    );
  },

  buildGroupId(id) {
    return `astian.midori.ssb.${id}`;
  },

  async install(ssb) {
    if (!SiteSpecificBrowserService.useOSIntegration) {
      return;
    }

    let dir = PathUtils.join(PathUtils.profileDir, "ssb", ssb.id);
    await IOUtils.makeDirectory(dir, {
      from: PathUtils.profileDir,
      ignoreExisting: true,
    });

    let iconFile = new WindowsSupport.nsIFile(PathUtils.join(dir, "icon.ico"));

    // We should be embedding multiple icon sizes, but the current icon encoder
    // does not support this. For now just embed a sensible size.
    let icon = await SiteSpecificBrowserIdUtils.getIconBySSBId(ssb.id, 128);
    if (icon) {
      let { container } = await ImageTools.loadImage(
        Services.io.newURI(icon.src)
      );
      ImageTools.saveIcon(container, 128, 128, iconFile);
    } else {
      // TODO use a default icon file.
      iconFile = null;
    }

    WindowsSupport.shellService.createShortcut(
      Services.dirsvc.get("XREExeF", Ci.nsIFile),
      ["-profile", PathUtils.profileDir, "-start-ssb", ssb.id],
      ssb.name,
      iconFile,
      0,
      WindowsSupport.buildGroupId(ssb.id),
      "Programs",
      `${ssb.name}.lnk`
    );
  },

  /**
   * @param {SiteSpecificBrowser} ssb the SSB to uninstall.
   */
  async uninstall(ssb) {
    if (!SiteSpecificBrowserService.useOSIntegration) {
      return;
    }

    try {
      let startMenu =
        Services.dirsvc.get("Home", Ci.nsIFile).path +
        "\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\";
      await IOUtils.remove(startMenu + ssb.name + ".lnk");
    } catch (e) {
      console.error(e);
    }

    let dir = PathUtils.join(PathUtils.profileDir, "ssb", ssb.id);
    try {
      await IOUtils.remove(dir, { recursive: true });
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Applies the necessary OS integration to an open SSB.
   *
   * Sets the window icon based on the available icons.
   *
   * @param {SiteSpecificBrowser} ssb the SSB.
   * @param {DOMWindow} aWindow the window showing the SSB.
   */
  async applyOSIntegration(ssb, aWindow) {
    WindowsSupport.taskbar.setGroupIdForWindow(
      aWindow,
      WindowsSupport.buildGroupId(ssb.id)
    );
    const getIcon = async size => {
      let icon = await SiteSpecificBrowserIdUtils.getIconBySSBId(ssb.id, size);
      if (!icon) {
        return null;
      }

      try {
        let image = await ImageTools.loadImage(Services.io.newURI(icon.src));
        return image.container;
      } catch (e) {
        console.error(e);
        return null;
      }
    };

    if (!SiteSpecificBrowserService.useOSIntegration) {
      return;
    }

    let icons = await Promise.all([
      getIcon(WindowsSupport.uiUtils.systemSmallIconSize),
      getIcon(WindowsSupport.uiUtils.systemLargeIconSize),
    ]);

    if (icons[0] || icons[1]) {
      WindowsSupport.uiUtils.setWindowIcon(aWindow, icons[0], icons[1]);
    }
  },
};
