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
import {IRenderer} from './renderer/renderer_types';
import {
  DataInternalSeries,
  DataSeries,
  DataSeriesMetadataMap,
  Rect,
} from './internal_types';

export interface DrawableConfig {
  coordinator: Coordinator;
  metadataMap: DataSeriesMetadataMap;
  renderer: IRenderer;
}

/**
 * A view that renders data in a rectangular layout.
 *
 * It maintains ui coordinate mapped data on `series` before a render.
 *
 * A client of DataDrawable is expected to subclass DataDrawable and implement redraw
 * method.
 *
 * Example:
 *
 * class LineView extends DataDrawable {
 *   redraw() {
 *     for (const line of this.series) {
 *       this.renderer.drawLine(line, ...);
 *     }
 *   }
 * }
 */
export abstract class DataDrawable {
  private rawSeriesData: DataSeries[] = [];
  // UI coordinate mapped data.
  protected series: DataInternalSeries[] = [];

  private paintDirty = true;

  protected readonly metadataMap: DataSeriesMetadataMap;
  protected readonly coordinator: Coordinator;
  protected readonly renderer: IRenderer;
  private coordinateIdentifier: number | null = null;
  private layout: Rect = {x: 0, width: 1, y: 0, height: 1};

  constructor(config: DrawableConfig) {
    this.metadataMap = config.metadataMap;
    this.coordinator = config.coordinator;
    this.renderer = config.renderer;
  }

  setLayoutRect(layout: Rect) {
    if (
      this.layout.x !== layout.x ||
      this.layout.width !== layout.width ||
      this.layout.y !== layout.y ||
      this.layout.height !== layout.height
    ) {
      this.paintDirty = true;
    }
    this.layout = layout;
  }

  protected getLayoutRect(): Rect {
    return this.layout;
  }

  markAsPaintDirty() {
    this.paintDirty = true;
  }

  internalOnlyRedraw() {
    this.internalOnlyTransformCoordinatesIfStale();

    if (!this.paintDirty) {
      return;
    }

    this.renderer.renderGroup(this.constructor.name, () => {
      this.redraw();
    });

    this.paintDirty = false;
  }

  protected isCoordinateUpdated() {
    return this.coordinator.getUpdateIdentifier() !== this.coordinateIdentifier;
  }

  protected clearCoordinateIdentifier() {
    this.coordinateIdentifier = null;
  }

  setData(data: DataSeries[]) {
    this.clearCoordinateIdentifier();
    this.rawSeriesData = data;
  }

  internalOnlyTransformCoordinatesIfStale(): void {
    if (!this.isCoordinateUpdated()) {
      return;
    }

    const layoutRect = this.getLayoutRect();
    this.series = new Array(this.rawSeriesData.length);

    for (let i = 0; i < this.rawSeriesData.length; i++) {
      const datum = this.rawSeriesData[i];
      this.series[i] = {
        id: datum.id,
        paths: new Float32Array(datum.points.length * 2),
      };
      for (let pointIndex = 0; pointIndex < datum.points.length; pointIndex++) {
        const [x, y] = this.coordinator.getViewCoordinate(layoutRect, [
          datum.points[pointIndex].x,
          datum.points[pointIndex].y,
        ]);
        this.series[i].paths[pointIndex * 2] = x;
        this.series[i].paths[pointIndex * 2 + 1] = y;
      }
    }

    this.coordinateIdentifier = this.coordinator.getUpdateIdentifier();
    this.markAsPaintDirty();
  }

  protected abstract redraw(): void;
}
