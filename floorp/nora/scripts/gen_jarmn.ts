/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as fs from "node:fs/promises";

export async function generateJarManifest(bundle: object) {
  console.log("generate jar.mn");
  const viteManifest = bundle;

  const arr = [];
  for (const i of Object.values(viteManifest)) {
    arr.push((i as { fileName: string })["fileName"]);
  }
  console.log("generate end jar.mn");

  return `midori.jar:\n% content nora %nora/ contentaccessible=yes\n ${Array.from(
    new Set(arr),
  )
    .map((v) => `nora/${v} (${v})`)
    .join("\n ")}`;
}
