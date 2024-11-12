#ifndef HELPERS_GLSL
#define HELPERS_GLSL

#include "config.h"

const vec3 normals[6] = vec3[6]
(
    vec3( 0, 0, 1),
    vec3( 0, 0,-1),
    vec3( 1, 0, 0),
    vec3(-1, 0, 0),
    vec3( 0, 1, 0),
    vec3( 0,-1, 0)
);

const mat4 bias = mat4
(
    0.5, 0.0, 0.0, 0.0,
    0.0,-0.5, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.0, 1.0
);

vec3 get_position(const uint voxel)
{
    return vec3(
        voxel >> VOXEL_X_OFFSET & VOXEL_X_MASK,
        voxel >> VOXEL_Y_OFFSET & VOXEL_Y_MASK,
        voxel >> VOXEL_Z_OFFSET & VOXEL_Z_MASK);
}

vec2 get_uv(const uint voxel)
{
    const vec2 uv = vec2(
        voxel >> VOXEL_U_OFFSET & VOXEL_U_MASK,
        voxel >> VOXEL_V_OFFSET & VOXEL_V_MASK);
    return vec2(
        uv.x / ATLAS_WIDTH * ATLAS_FACE_WIDTH,
        uv.y / ATLAS_HEIGHT * ATLAS_FACE_HEIGHT);
}

uint get_shadow(const uint voxel)
{
    return voxel >> VOXEL_SHADOW_OFFSET & VOXEL_SHADOW_MASK;
}

uint get_direction(const uint voxel)
{
    return voxel >> VOXEL_DIRECTION_OFFSET & VOXEL_DIRECTION_MASK;
}

vec3 get_normal(const uint voxel)
{
    return normals[get_direction(voxel)];
}

vec3 get_sky(const float y)
{
    return mix(vec3(0.4, 0.7, 1.0), vec3(0.7, 0.9, 1.0), max(y - 0.2, 0.0));
}

float get_fog(const vec2 position, const vec2 camera)
{
    return pow(clamp(length(position - camera) / 400.0, 0.0, 1.0), 2.5);
}

bool get_shadowed(
    const vec3 normal,
    const vec3 camera,
    const vec3 position,
    const sampler2D map)
{
    return
        (dot(normal, camera) < 0.0) || (
        position.x <= 1.0 && position.x >= 0.0 &&
        position.y <= 1.0 && position.y >= 0.0 &&
        position.z <= 1.0 && position.z >= 0.0 &&
        (position.z - 0.0005 > texture(map, position.xy).x));
}

bool get_edge(
    const uint direction,
    const vec3 position,
    const vec3 neighbor)
{
    switch (direction)
    {
    case 4: return position.y < neighbor.y;
    case 5: return position.y > neighbor.y;
    case 2: return position.x > neighbor.x;
    case 3: return position.x < neighbor.x;
    case 0: return position.z < neighbor.z;
    case 1: return position.z > neighbor.z;
    }
    return false;
}

vec4 get_color(
    const vec4 color,
    const bool shadow,
    const bool edge,
    const float fog)
{
    const float a = edge ? 0.0 : shadow ? 0.03 : 0.06;
    const float b = 0.3;
    const float c = shadow ? 0.0 : 1.0;
    const vec3 d = color.xyz * (a + b + c);
    return mix(vec4(d, color.a), vec4(get_sky(0.0), 1.0), fog);
}

#endif