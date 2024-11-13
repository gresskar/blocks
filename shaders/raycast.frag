#version 450

layout(location = 0) in vec3 i_position;
layout(location = 0) out vec4 o_color;

void main()
{
    o_color = vec4(normalize(i_position), 0.3);
}