#version 450

layout(location = 0) in vec3 i_position;
layout(location = 0) out vec3 o_position;
layout(set = 1, binding = 0) uniform t_matrix
{
    mat4 u_matrix;
};
layout(set = 1, binding = 1) uniform t_position
{
    ivec3 u_position;
};

void main()
{
    o_position = i_position * 1.05/ 2.0 + vec3(0.5, 0.5, 0.5);
    gl_Position = u_matrix * vec4(u_position + o_position, 1.0);
}