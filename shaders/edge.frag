#version 450

#include "helpers.glsl"

layout(location = 0) in vec2 i_uv;
layout(location = 0) out float o_edge;
layout(set = 2, binding = 0) uniform sampler2D s_position;
layout(set = 2, binding = 1) uniform sampler2D s_uv;
layout(set = 2, binding = 2) uniform usampler2D s_voxel;
layout(set = 2, binding = 3) uniform sampler2D s_atlas;

void main() {
    const vec2 uv = texture(s_uv, i_uv).xy;
    if (length(uv) == 0)
    {
        discard;
    }
    const uint voxel = texture(s_voxel, i_uv).x;
    const uint direction = get_direction(voxel);
    const vec3 position = texture(s_position, i_uv).xyz;
    const vec3 color = texture(s_atlas, uv).xyz;
    const vec2 size = 1.0 / textureSize(s_voxel, 0);
    for (int x = -1; x <= 1; ++x)
    {
        for (int y = -1; y <= 1; ++y)
        {
            if (x == 0 && y == 0)
            {
                continue;
            }
            const uint neighbor_voxel = texture(s_voxel, i_uv + vec2(x, y) * size).x;
            const uint neighbor_direction = get_direction(neighbor_voxel);
            const vec3 neighbor_position = texture(s_position, i_uv + vec2(x, y) * size).xyz;
            const vec2 neighbor_uv = texture(s_uv, i_uv + vec2(x, y) * size).xy;
            const vec3 neighbor_color = texture(s_atlas, neighbor_uv).xyz;
            if (length(neighbor_uv) == 0 ||
                distance(color, neighbor_color) > 0.01 ||
                direction != neighbor_direction ||
                get_edge(direction, position, neighbor_position))
            {
                o_edge = 1.0;
                return;
            }
        }
    }
    o_edge = 0.0;
}