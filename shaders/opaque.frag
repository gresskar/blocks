#version 450

layout(location = 0) in flat uint i_voxel;
layout(location = 1) in vec3 i_position;
layout(location = 2) in vec2 i_uv;
layout(location = 0) out vec4 o_position;
layout(location = 1) out vec2 o_uv;
layout(location = 2) out uint o_voxel;
layout(set = 2, binding = 0) uniform sampler2D u_atlas;

void main()
{
    if (texture(u_atlas, i_uv).a < 0.001)
    {
        discard;
    }
    o_position = vec4(i_position, 0.0);
    o_uv = i_uv;
    o_voxel = i_voxel;
}