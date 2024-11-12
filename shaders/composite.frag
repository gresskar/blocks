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

    // Compute fog factor based on distance to the camera's xz-plane position
    float fog = abs(length(position.xz - u_player_camera.position.xz));
    fog = pow(clamp(fog / world_fog_distance, 0.0, 1.0), world_fog_factor);

    // Calculate shadow coordinates
    vec4 shadow_position4 = bias * u_shadow.matrix * vec4(position, 1.0);
    vec3 shadow_position = shadow_position4.xyz / shadow_position4.w;

    // Compute shadow factor
    float shadow = 0.0;
    if (should_shadow != 0) {
        if (dot(normal, -u_shadow_camera.vector) < 0.0) {
            shadow = world_shadow_factor;
        } else if (
            shadow_position.x <= 1.0 && shadow_position.x >= 0.0 &&
            shadow_position.y <= 1.0 && shadow_position.y >= 0.0 &&
            shadow_position.z <= 1.0 && shadow_position.z >= 0.0 &&
            shadow_position.z - world_shadow_bias > texture(s_shadow, shadow_position.xy).r
        ) {
            shadow = world_shadow_factor;
        }
    }

    vec3 color = texture(s_atlas, uv).xyz;

    // Sample edge detection result (0.0 for no edge, 1.0 for edge)
    float edge_occlusion = (1.0 - texture(s_edge, i_uv).r) * 0.2;
    // o_color = vec4(vec3(edge_occlusion), 1.0);
    color *= edge_occlusion + world_ambient_light + world_shadow_factor - shadow;
    o_color = mix(vec4(color, 1.0), vec4(sky_bottom_color, 1.0), fog);
}