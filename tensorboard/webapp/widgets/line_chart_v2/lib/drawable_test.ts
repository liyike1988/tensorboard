/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import {Coordinator} from './coordinator';
import {SvgRenderer} from './renderer/svg_renderer';
import {DataDrawable, DrawableConfig} from './drawable';

class TestableDataDrawable extends DataDrawable {
  redraw(): void {}
  getSeriesData() {
    return this.series;
  }
}

describe('line_chart_v2/lib/drawable test', () => {
  let option: DrawableConfig;
  let root: TestableDataDrawable;
  let redrawSpy: jasmine.Spy;

  beforeEach(() => {
    option = {
      coordinator: new Coordinator(),
      renderer: new SvgRenderer(
        document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      ),
      metadataMap: {},
    };

    root = new TestableDataDrawable(option);
    root.setLayoutRect({x: 0, y: 0, width: 100, height: 100});
    redrawSpy = spyOn(root, 'redraw');
  });

  describe('redraw', () => {
    it('handles empty data', () => {
      root.internalOnlyRedraw();

      expect(redrawSpy).toHaveBeenCalledTimes(1);
    });

    it('does not re-render if paint is not dirty', () => {
      root.internalOnlyRedraw();

      expect(redrawSpy).toHaveBeenCalledTimes(1);

      // Nothing changed for paint to be dirty.
      root.internalOnlyRedraw();
      expect(redrawSpy).toHaveBeenCalledTimes(1);
    });

    it('re-renders if explictly marked as dirty', () => {
      root.internalOnlyRedraw();
      root.markAsPaintDirty();
      root.internalOnlyRedraw();

      expect(redrawSpy).toHaveBeenCalledTimes(2);
    });

    // If the dimension of the DOM changes, even if the data has not changed, we need to
    // repaint.
    it('re-renders if layout has changed', () => {
      root.internalOnlyRedraw();
      root.setLayoutRect({x: 0, y: 0, width: 200, height: 200});

      expect(redrawSpy).toHaveBeenCalledTimes(1);

      root.internalOnlyRedraw();

      expect(redrawSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('data coordinate transformation', () => {
    beforeEach(() => {
      const domRect = {x: 0, y: 0, width: 100, height: 100};
      root.setLayoutRect(domRect);

      const dataSeries = [
        {
          id: 'foo',
          points: [
            {x: 0, y: 0},
            {x: 1, y: 1},
            {x: 2, y: -1},
          ],
        },
        {
          id: 'bar',
          points: [
            {x: 0, y: 0},
            {x: 1, y: -10},
            {x: 2, y: 10},
          ],
        },
      ];
      root.setData(dataSeries);
      option.coordinator.setViewBoxRect({x: 0, y: -50, width: 2, height: 100});
      option.coordinator.setDomContainerDimension(domRect);
    });

    it('updates the data coordinate on redraw', () => {
      root.internalOnlyRedraw();
      // Notice that data.x = 0 got map to dom.x = 50. That is because we are rendering
      // both TestableDrawable and TestableDataDrawable, both of which are flex layout,
      // and TestableDataDrawable has rect of {x: 50, y: 0, width: 50, height: 100}.
      expect(root.getSeriesData()).toEqual([
        {id: 'foo', paths: new Float32Array([0, 50, 50, 49, 100, 51])},
        {id: 'bar', paths: new Float32Array([0, 50, 50, 60, 100, 40])},
      ]);
    });

    it('updates and redraws when the data changes', () => {
      root.internalOnlyRedraw();

      root.setData([
        {
          id: 'foo',
          points: [
            {x: 0, y: 0},
            {x: 1, y: 10},
            {x: 2, y: -10},
          ],
        },
        {
          id: 'bar',
          points: [
            {x: 0, y: 0},
            {x: 1, y: 50},
            {x: 2, y: -50},
          ],
        },
      ]);
      expect(redrawSpy).toHaveBeenCalledTimes(1);
      root.setData([
        {
          id: 'foo',
          points: [
            {x: 0, y: 0},
            {x: 1, y: 50},
            {x: 2, y: -50},
          ],
        },
        {
          id: 'bar',
          points: [
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 0},
          ],
        },
      ]);

      root.internalOnlyRedraw();
      expect(root.getSeriesData()).toEqual([
        {id: 'foo', paths: new Float32Array([0, 50, 50, 0, 100, 100])},
        {id: 'bar', paths: new Float32Array([0, 50, 50, 50, 100, 50])},
      ]);
      expect(redrawSpy).toHaveBeenCalledTimes(2);
    });
  });
});
