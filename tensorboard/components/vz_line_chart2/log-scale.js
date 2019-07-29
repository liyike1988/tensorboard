/* Copyright 2018 The TensorFlow Authors. All Rights Reserved.

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
var vz_line_chart2;
(function (vz_line_chart2) {
    // Smallest positive non-zero value represented by IEEE 754 binary (64 bit)
    // floating-point number.
    // https://www.ecma-international.org/ecma-262/5.1/#sec-8.5
    vz_line_chart2.MIN_POSITIVE_VALUE = Math.pow(2, -1074);
    function log(x) {
        return Math.log10(x);
    }
    function pow(x) {
        return Math.pow(10, x);
    }
    /**
     * A logarithmic scale that returns NaN for all non-positive values as it
     * mathematically is supposed to be -Infinity. Also, due to the floating point
     * precision issue, it treats all values smaller than MIN_POSITIVE_VALUE as
     * non-positive. Lastly, if using autoDomain feature and if all values are the
     * same value, it pads 10% of the value.
     */
    class LogScale extends vz_line_chart2.TfScale {
        constructor() {
            super();
            this._d3LogScale = d3.scaleLog();
            this.padProportion(.2);
        }
        scale(x) {
            // Returning NaN makes sure line plot does not plot illegal values.
            if (x <= 0)
                return NaN;
            return this._d3LogScale(x);
        }
        invert(x) {
            return this._d3LogScale.invert(x);
        }
        scaleTransformation(value) {
            return this.scale(value);
        }
        invertedTransformation(value) {
            return this.invert(value);
        }
        getTransformationDomain() {
            return this.domain();
        }
        _getDomain() {
            return this._untransformedDomain;
        }
        _setDomain(values) {
            this._untransformedDomain = values;
            const [min, max] = values;
            super._setDomain([Math.max(vz_line_chart2.MIN_POSITIVE_VALUE, min), max]);
        }
        /**
         * Given a domain, pad it and clip the lower bound to MIN_POSITIVE_VALUE.
         */
        _niceDomain(domain, count) {
            const [low, high] = domain;
            const adjustedLogLow = Math.max(log(vz_line_chart2.MIN_POSITIVE_VALUE), log(low));
            const logHigh = log(high);
            const spread = logHigh - adjustedLogLow;
            const pad = spread ? spread * this.padProportion() : 1;
            return [
                pow(Math.max(log(vz_line_chart2.MIN_POSITIVE_VALUE), adjustedLogLow - pad)),
                pow(logHigh + pad),
            ];
        }
        /**
         * Generates a possible extent based on data from all plots the scale is
         * connected to by taking the minimum and maximum values of all extents for
         * lower and upper bound, respectively.
         * @override to remove default padding logic.
         */
        _getUnboundedExtent(ignoreAttachState) {
            const includedValues = this._getAllIncludedValues(ignoreAttachState);
            let extent = this._defaultExtent();
            if (includedValues.length !== 0) {
                const combinedExtent = [
                    Plottable.Utils.Math.min(includedValues, extent[0]),
                    Plottable.Utils.Math.max(includedValues, extent[1]),
                ];
                extent = this._niceDomain(combinedExtent);
            }
            return extent;
        }
        _getAllIncludedValues(ignoreAttachState = false) {
            const values = super._getAllIncludedValues();
            // For log scale, the value cannot be smaller or equal to 0. They are
            // negative infinity.
            return values.map(x => x > 0 ? x : vz_line_chart2.MIN_POSITIVE_VALUE);
        }
        _defaultExtent() {
            return [1, 10];
        }
        _backingScaleDomain(values) {
            if (values == null) {
                return this._d3LogScale.domain();
            }
            else {
                this._d3LogScale.domain(values);
                return this;
            }
        }
        _getRange() {
            return this._d3LogScale.range();
        }
        _setRange(values) {
            this._d3LogScale.range(values);
        }
        defaultTicks() {
            return this._d3LogScale.ticks(1);
        }
        ticks() {
            return this._d3LogScale.ticks();
        }
        /**
         * Returns an `extent` for a data series. In log-scale, we must omit all
         * non-positive values when computing a `domain`.
         * @override
         */
        extentOfValues(values) {
            // Log can only take positive values.
            const legalValues = values
                .filter(x => Plottable.Utils.Math.isValidNumber(x) && x > 0);
            let filteredValues = legalValues;
            if (this.ignoreOutlier()) {
                const logValues = legalValues.map(log);
                const sortedLogValues = logValues.sort((a, b) => a - b);
                const a = d3.quantile(sortedLogValues, 0.05);
                const b = d3.quantile(sortedLogValues, 0.95);
                filteredValues = sortedLogValues.filter(x => x >= a && x <= b).map(pow);
            }
            const extent = d3.extent(filteredValues);
            return extent[0] == null || extent[1] == null ? [] : extent;
        }
    }
    vz_line_chart2.LogScale = LogScale;
})(vz_line_chart2 || (vz_line_chart2 = {})); //  namespace vz_line_chart2