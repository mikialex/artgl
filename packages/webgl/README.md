# About @artgl/webgl

This module contains webgl layer for artgl, also could be use in other project for webgl encapsulation.

## Responsibility for this module

Wrap every webgl call, provide:

* Convenient and better api naming, usage(but still in binding style).
* Remove the feature level webgl1/webgl2/extension native api difference(ie. instance).

State management:

* State setting diffing for performance.

Resource management:

* Webgl context level deletion/creation/updating for webgl objects.
* Mapping your upper layer handle to webgl objects.

## RoadMaps

* better support in texture resource
* conformance testing
* context lost handling
