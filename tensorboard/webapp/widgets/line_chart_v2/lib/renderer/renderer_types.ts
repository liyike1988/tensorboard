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
import {Paths, Dimension} from '../internal_types';

export interface IRenderer {
  /**
   * Certain renderer requires DOM dimensions for correct rendering density. The
   * method is invoked when container is resized.
   *
   * @param domDimension Container dimensions
   */
  onResize(domDimension: Dimension): void;

  drawLine(cacheId: string, paths: Paths, spec: LineSpec): void;

  flush(): void;

  renderGroup(groupName: string, renderBlock: () => void): void;
}

export interface LineSpec {
  visible: boolean;
  color: string;
  opacity?: number;
  width: number;
}

export enum RendererType {
  SVG,
  WEBGL,
}
