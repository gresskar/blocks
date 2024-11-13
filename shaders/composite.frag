#version 450

#include "helpers.glsl"

layout(location = 0) in vec2 i_uv;
layout(location = 0) out vec4 o_color;
layout(set = 2, binding = 0) uniform sampler2D s_atlas;
layout(set = 2, binding = 1) uniform sampler2D s_position;
layout(set = 2, binding = 2) uniform sampler2D s_uv;
layout(set = 2, binding = 3) uniform usampler2D s_voxel;
layout(set = 2, binding = 4) uniform sampler2D s_shadow;
layout(set = 2, binding = 5) uniform sampler2D s_ssao;
layout(set = 3, binding = 0) uniform t_player_position
{
    vec3 u_player_position;
};
layout(set = 3, binding = 1) uniform t_shadow_vector
{
    vec3 u_shadow_vector;
};
layout(set = 3, binding = 2) uniform t_shadow_matrix
{
    mat4 u_shadow_matrix;
};

void main()
{
    const vec3 position = texture(s_position, i_uv).xyz;
    const vec2 uv = texture(s_uv, i_uv).xy;
    const uint voxel = texture(s_voxel, i_uv).x;
    if (length(uv) == 0)
    {
        discard;
    }
    const vec4 shadow_position = bias * u_shadow_matrix * vec4(position, 1.0);
    const bool shadowed = get_shadow(voxel) && get_shadowed(get_normal(voxel),
        -u_shadow_vector, shadow_position.xyz / shadow_position.w, s_shadow);
    const vec4 color = texture(s_atlas, uv);
    const float ssao = texture(s_ssao, i_uv).r;
    const float fog = get_fog(position.xz, u_player_position.xz);
    o_color = get_color(color, shadowed, ssao, fog);
}