#version 450

layout(location = 0) in vec3 i_position;
layout(location = 1) in vec2 i_uv;
layout(location = 2) in vec3 i_normal;
layout(location = 0) out vec4 o_combine1;
layout(location = 1) out vec4 o_combine2;
layout(set = 2, binding = 0) uniform sampler2D u_atlas;

void main()
{
    if (texture(u_atlas, i_uv).a < 0.001)
    {
        discard;
    }
    o_combine1.x = i_position.x;
    o_combine1.y = i_position.y;
    o_combine1.z = i_position.z;
    o_combine1.w = i_uv.x;
    o_combine2.x = i_uv.y;
    o_combine2.y = i_normal.x;
    o_combine2.z = i_normal.y;
    o_combine2.w = i_normal.z;
}