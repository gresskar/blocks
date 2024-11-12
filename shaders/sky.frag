#version 450

#include "helpers.glsl"

layout(location = 0) in vec3 i_position;
layout(location = 0) out vec4 o_color;

void main()
{
    o_color = vec4(get_sky(i_position.y), 1.0);
}