#version 450

#include "config.glsl"

layout(location = 0) out vec4 o_color;

layout(set = 2, binding = 0) uniform sampler2D s_atlas;
layout(set = 2, binding = 1) uniform sampler2D s_position;
layout(set = 2, binding = 2) uniform sampler2D s_uv;
layout(set = 2, binding = 3) uniform usampler2D s_voxel;
layout(set = 2, binding = 4) uniform sampler2D s_shadow;
layout(set = 2, binding = 5) uniform sampler2D s_ssao;

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

const vec3 normals[6] = vec3[6](
    vec3( 0, 0, 1),
    vec3( 0, 0,-1),
    vec3( 1, 0, 0),
    vec3(-1, 0, 0),
    vec3( 0, 1, 0),
    vec3( 0,-1, 0)
);

const mat4 bias = mat4(
    0.5, 0.0, 0.0, 0.0,
    0.0,-0.5, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.0, 1.0
);

void main()
{
    // Get screen-space texture coordinates
    vec2 coord = gl_FragCoord.xy / u_viewport.size;

    // Retrieve world-space position and UV coordinates for texture lookup
    vec3 position = texture(s_position, coord).xyz;
    vec3 inverse_position = (inverse(u_view.matrix) * vec4(position, 1.0)).xyz;
    vec2 uv = texture(s_uv, coord).xy;

    // Discard fragments with no valid UVs
    if (length(uv) == 0) {
        discard;
    }

    // Retrieve voxel information and determine the normal direction
    uint voxel = texture(s_voxel, coord).x;
    uint direction = (voxel >> VOXEL_DIRECTION_OFFSET) & VOXEL_DIRECTION_MASK;
    vec3 normal = normals[direction];

    // Check if this voxel should cast a shadow
    uint should_shadow = (voxel >> VOXEL_SHADOW_OFFSET) & VOXEL_SHADOW_MASK;

    // Compute fog factor based on distance to the camera's xz-plane position
    float fog = abs(length(position.xz));
    fog = pow(clamp(fog / world_fog_distance, 0.0, 1.0), world_fog_factor);

    // Calculate shadow coordinates
    vec4 shadow_position4 = bias * u_shadow.matrix * vec4(inverse_position, 1.0);
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
            const vec2 size = 1.0 / textureSize(s_shadow, 0);
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    vec2 offset_uv = shadow_position.xy + vec2(x, y) * size;
                    float depth = texture(s_shadow, offset_uv).r;
                    if (shadow_position.z - world_shadow_bias >= depth) {
                        shadow += world_shadow_factor;
                    }
                }
            }
            shadow /= 9.0;
        }
    }

    // Sample color from the atlas texture
    vec3 color = texture(s_atlas, uv).xyz;

    // Sample SSAO factor and apply it to the ambient light
    float ssao_factor = texture(s_ssao, coord).r;

    color = mix(color, color * ssao_factor, 0.5);
    color = color * (world_ambient_light + world_shadow_factor - shadow);

    o_color = mix(vec4(color, 1.0), vec4(sky_bottom_color, 1.0), fog);
}