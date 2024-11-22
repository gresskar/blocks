#version 450

#include "helpers.glsl"

layout(location = 0) out vec4 o_color;
layout(set = 2, binding = 0) uniform sampler2D s_atlas;
layout(set = 3, binding = 0) uniform t_viewport
{
    ivec2 u_viewport;
};
layout(set = 3, binding = 1) uniform t_block
{
    ivec2 u_block;
};

void main()
{
    vec2 position = gl_FragCoord.xy / u_viewport;
    position.y = 1.0 - position.y;
    const float aspect = float(u_viewport.x) / float(u_viewport.y);
    const float block_height = 0.05;
    const float block_width = block_height / aspect;
    const vec2 block_start = vec2(0.01);
    const vec2 block_end = block_start + vec2(block_width, block_height);
    if (position.x > block_start.x && position.x < block_end.x &&
        position.y > block_start.y && position.y < block_end.y)
    {
        const float x = (position.x - block_start.x) / block_width;
        const float y = (position.y - block_start.y) / block_height;
        const vec2 uv = get_atlas(u_block);
        const float c = uv.x + x / ATLAS_X_FACES;
        const float d = uv.y + (1.0 - y) / ATLAS_Y_FACES;
        o_color = texture(s_atlas, vec2(c, d));
        o_color.xyz *= min(1.5, 2.0 - y);
        return;
    }
    const float cross_size1 = 0.01;
    const float cross_thickness1 = 0.002;
    const float cross_size2 = cross_size1 / aspect;
    const float cross_thickness2 = cross_thickness1 / aspect;
    const vec2 cross_start1 = vec2(0.5 - cross_size2, 0.5 - cross_thickness1);
    const vec2 cross_end1 = vec2(0.5 + cross_size2, 0.5 + cross_thickness1);
    const vec2 cross_start2 = vec2(0.5 - cross_thickness2, 0.5 - cross_size1);
    const vec2 cross_end2 = vec2(0.5 + cross_thickness2, 0.5 + cross_size1);
    if ((position.x > cross_start1.x && position.y > cross_start1.y &&
        position.x < cross_end1.x && position.y < cross_end1.y) ||
        (position.x > cross_start2.x && position.y > cross_start2.y &&
        position.x < cross_end2.x && position.y < cross_end2.y))
    {
        o_color = vec4(1.0);
        return;
    }
    discard;
}