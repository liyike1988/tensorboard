load("//tensorboard/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorboard:internal"])

tf_ts_library(
    name = "internal_types",
    srcs = [
        "internal_types.ts",
        "scale_types.ts",
    ],
    visibility = [
        "//tensorboard/webapp/widgets/line_chart_v2/lib:__subpackages__",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        ":chart_types",
        ":internal_types",
        "//tensorboard/webapp/widgets/line_chart_v2/lib/renderer:types",
    ],
)

tf_ts_library(
    name = "chart",
    srcs = [
        "chart.ts",
    ],
    deps = [
        ":chart_types",
        ":coordinator",
        ":internal_types",
        ":scale",
        ":series_line_view",
        "//tensorboard/webapp/widgets/line_chart_v2/lib/renderer",
    ],
)

tf_ts_library(
    name = "chart_types",
    srcs = [
        "chart_types.ts",
    ],
    deps = [
        ":internal_types",
        "//tensorboard/webapp/widgets/line_chart_v2/lib/renderer:types",
    ],
)

tf_ts_library(
    name = "worker_pool",
    srcs = ["worker_pool.ts"],
    deps = [
        ":worker",
    ],
)

tf_ts_library(
    name = "worker",
    srcs = ["worker.ts"],
    visibility = ["//visibility:private"],
)

tf_ts_library(
    name = "scale",
    srcs = [
        "scale.ts",
    ],
    deps = [
        ":internal_types",
        "@npm//@types/d3",
        "@npm//d3",
    ],
)

tf_ts_library(
    name = "coordinator",
    srcs = [
        "coordinator.ts",
        "threejs_coordinator.ts",
    ],
    deps = [
        ":internal_types",
        ":scale",
        ":utils",
        "@npm//three",
    ],
)

tf_ts_library(
    name = "utils",
    srcs = [
        "utils.ts",
    ],
    deps = [
        ":internal_types",
    ],
)

tf_ts_library(
    name = "drawable",
    srcs = [
        "drawable.ts",
    ],
    deps = [
        ":coordinator",
        ":internal_types",
        "//tensorboard/webapp/widgets/line_chart_v2/lib/renderer:types",
    ],
)

tf_ts_library(
    name = "series_line_view",
    srcs = [
        "series_line_view.ts",
    ],
    deps = [
        ":drawable",
    ],
)

tf_ts_library(
    name = "lib_tests",
    testonly = True,
    srcs = [
        "coordinator_test.ts",
        "drawable_test.ts",
        "integration_test.ts",
        "scale_test.ts",
        "worker_pool_test.ts",
    ],
    deps = [
        ":chart",
        ":coordinator",
        ":drawable",
        ":internal_types",
        ":scale",
        ":types",
        ":worker",
        ":worker_pool",
        "//tensorboard/webapp/widgets/line_chart_v2/lib/renderer",
        "@npm//@angular/core",
        "@npm//@types/jasmine",
    ],
)
