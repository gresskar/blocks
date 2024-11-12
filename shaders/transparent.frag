#version 450

#include "config.glsl"
#include "helpers.glsl"

layout(location = 0) in vec2 i_uv;
layout(location = 1) in vec3 i_normal;
layout(location = 2) in vec4 i_shadow_position;
layout(location = 3) in flat uint i_shadow;
layout(location = 4) in float i_fog;
layout(location = 0) out vec4 o_color;
layout(set = 2, binding = 0) uniform sampler2D u_atlas;
layout(set = 2, binding = 1) uniform sampler2D u_shadow_map;
layout(set = 3, binding = 0) uniform camera_t
{
    vec3 vector;
}
u_camera;

void main()
{
    const vec4 block = texture(u_atlas, i_uv);
    const vec3 position = i_shadow_position.xyz / i_shadow_position.w;
    float shadow = 0.0;
    if (i_shadow != 0 && get_shadow(i_normal, -u_camera.vector, position, u_shadow_map))
    {
        shadow = world_shadow_factor;
    }
    const vec3 color = block.rgb * (world_ambient_light + world_shadow_factor - shadow);
    o_color = mix(vec4(color, block.a), vec4(get_sky(0.0), 1.0), i_fog);
}