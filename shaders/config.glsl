#ifndef CONFIG_GLSL
#define CONFIG_GLSL

#include "config.h"

const vec3 sky_bottom_color = vec3(0.4, 0.7, 1.0);
const vec3 sky_top_color = vec3(0.7, 0.9, 1.0);
const float sky_horizon = 0.2;

const vec4 ui_crosshair_color = vec4(1.0, 1.0, 1.0, 1.0);
const float ui_crosshair_size = 0.01;
const float ui_crosshair_thickness = 0.002;
const float ui_block_left = 0.01;
const float ui_block_bottom = 0.01;
const float ui_block_size = 0.05;

const float raycast_block_size = 1.05;
const float raycast_alpha = 0.2;

const float world_ambient_light = 0.3;
const float world_fog_distance = 400.0;
const float world_fog_factor = 2.5;
const float world_shadow_bias = 0.0005;
const float world_shadow_factor = 0.9;

#endif