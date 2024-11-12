#version 450

#include "config.glsl"
#include "helpers.glsl"

layout(location = 0) in vec2 i_uv;
layout(location = 0) out vec4 o_color;

layout(set = 2, binding = 0) uniform sampler2D s_atlas;
layout(set = 2, binding = 1) uniform sampler2D s_position;
layout(set = 2, binding = 2) uniform sampler2D s_uv;
layout(set = 2, binding = 3) uniform usampler2D s_voxel;
layout(set = 2, binding = 4) uniform sampler2D s_shadow;
layout(set = 2, binding = 5) uniform sampler2D s_edge;

layout(set = 3, binding = 0) uniform viewport_t {
    ivec2 size;
} u_viewport;

layout(set = 3, binding = 1) uniform player_camera_t {
    vec3 position;
} u_player_camera;

layout(set = 3, binding = 2) uniform shadow_camera_t {
    vec3 vector;
} u_shadow_camera;

layout(set = 3, binding = 3) uniform shadow_t {
    mat4 matrix;
} u_shadow;

layout(set = 3, binding = 4) uniform view_t {
    mat4 matrix;
} u_view;


void main()
{
    vec3 position = texture(s_position, i_uv).xyz;
    vec2 uv = texture(s_uv, i_uv).xy;

    // Discard fragments with no valid UVs
    if (length(uv) == 0) {
        discard;
    }

    // Retrieve voxel information and determine the normal direction
    uint voxel = texture(s_voxel, i_uv).x;
    uint direction = (voxel >> VOXEL_DIRECTION_OFFSET) & VOXEL_DIRECTION_MASK;
    vec3 normal = normals[direction];

    // Check if this voxel should cast a shadow
    uint should_shadow = (voxel >> VOXEL_SHADOW_OFFSET) & VOXEL_SHADOW_MASK;

    // Calculate shadow coordinates
    vec4 shadow_position4 = bias * u_shadow.matrix * vec4(position, 1.0);
    vec3 shadow_position = shadow_position4.xyz / shadow_position4.w;

    // Compute shadow factor
    bool shadow = should_shadow != 0 && get_shadow(normal, -u_shadow_camera.vector, shadow_position, s_shadow);

    vec4 color = texture(s_atlas, uv);
    bool edge_occlusion = bool(texture(s_edge, i_uv).r);
    float fog = get_fog(position.xz, u_player_camera.position.xz);
    o_color = get_composite(color, shadow, edge_occlusion, fog);
}