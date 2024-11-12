#version 450

#include "helpers.glsl"

layout(location = 0) in uint i_voxel;
layout(set = 1, binding = 0) uniform t_position
{
    ivec3 u_position;
};
layout(set = 1, binding = 1) uniform t_matrix
{
    mat4 u_matrix;
};

void main()
{
    if (get_shadow(i_voxel) != 0)
    {
        gl_Position = u_matrix * vec4(u_position + get_position(i_voxel), 1.0);
    }
    else
    {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    }
}