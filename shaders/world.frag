#version 450

#include "config.glsl"

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
    if (block.a < 0.001)
    {
        discard;
    }
    float shadow = 0.0;
    if (i_shadow != 0)
    {
        const vec3 position = i_shadow_position.xyz / i_shadow_position.w;
        if (dot(i_normal, -u_camera.vector) < 0.0)
        {
            shadow = world_shadow_factor;
        }
        else if (
            position.x <= 1.0 && position.x >= 0.0 &&
            position.y <= 1.0 && position.y >= 0.0 &&
            position.z <= 1.0 && position.z >= 0.0 &&
            position.z - world_shadow_bias > texture(u_shadow_map, position.xy).r)
        {
            const vec2 size = 1.0 / textureSize(u_shadow_map, 0);
            for (int x = -1; x <= 1; x++)
            {
                for (int y = -1; y <= 1; y++)
                {
                    const vec2 uv = position.xy + vec2(x, y) * size;
                    const float depth = texture(u_shadow_map, uv).r;
                    if (position.z - world_shadow_bias >= depth)
                    {
                        shadow += world_shadow_factor;
                    }
                }
            }
            shadow /= 9.0;
        }
    }
    const vec3 color = block.rgb * (world_ambient_light + world_shadow_factor - shadow);
    o_color = mix(vec4(color, block.a), vec4(sky_bottom_color, 1.0), i_fog);
}