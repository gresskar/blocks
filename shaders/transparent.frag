#version 450

#include "helpers.glsl"

layout(location = 0) in vec2 i_uv;
layout(location = 1) in flat vec3 i_normal;
layout(location = 2) in vec4 i_shadow_position;
layout(location = 3) in flat uint i_shadow;
layout(location = 4) in float i_fog;
layout(location = 0) out vec4 o_color;
layout(set = 2, binding = 0) uniform sampler2D s_atlas;
layout(set = 2, binding = 1) uniform sampler2D s_shadow;
layout(set = 3, binding = 0) uniform t_shadow_vector
{
    vec3 u_shadow_vector;
};

void main()
{
    const vec4 color = texture(s_atlas, i_uv);
    const vec3 shadow_position = i_shadow_position.xyz / i_shadow_position.w;
    const bool shadowed = i_shadow != 0 && get_shadowed(i_normal,
        u_shadow_vector, shadow_position, s_shadow);
    o_color = get_color(color, shadowed, 1.0, i_fog, i_normal, u_shadow_vector);
}