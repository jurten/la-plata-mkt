import type { Page } from '@playwright/test';

declare global {
  interface Window { galaxyUniforms: Record<string, number[]>; galaxyArrivalScales: number[] }
}

/** Observe uniforms actually uploaded to Galaxy's GPU program. */
export async function auditGalaxy(page: Page, hideBackground = false) {
  await page.addInitScript(hideBackground => {
    window.galaxyUniforms = {};
    window.galaxyArrivalScales = [];
    const names = new WeakMap<WebGLUniformLocation, string>();
    const get = WebGL2RenderingContext.prototype.getUniformLocation;
    WebGL2RenderingContext.prototype.getUniformLocation = function (program, name) {
      const location = get.call(this, program, name);
      if (location) names.set(location, name);
      return location;
    };
    const scalar = WebGL2RenderingContext.prototype.uniform1f;
    WebGL2RenderingContext.prototype.uniform1f = function (location, value) {
      const name = location && names.get(location);
      if (hideBackground && name === 'uOpacity') value = 0;
      if (name) window.galaxyUniforms[name] = [value];
      if (name === 'uHeadScale') window.galaxyArrivalScales.push(value);
      return scalar.call(this, location, value);
    };
    const vector = WebGL2RenderingContext.prototype.uniform2f;
    WebGL2RenderingContext.prototype.uniform2f = function (location, x, y) {
      const name = location && names.get(location);
      if (name) window.galaxyUniforms[name] = [x, y];
      return vector.call(this, location, x, y);
    };
  }, hideBackground);
}
