#ifndef HELPERS_GLSL
#define HELPERS_GLSL

const vec3 normals[6] = vec3[6]
(
    vec3( 0, 0, 1),
    vec3( 0, 0,-1),
    vec3( 1, 0, 0),
    vec3(-1, 0, 0),
    vec3( 0, 1, 0),
    vec3( 0,-1, 0)
);

const mat4 bias = mat4
(
    0.5, 0.0, 0.0, 0.0,
    0.0,-0.5, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.0, 1.0
);


const float tmp_near = 1.0;
const float tmp_far = 500.0;

float linearize(float z, float near, float far)
{
    return near * far / (far - z * (far - near));
}

float reverseLinearizeDepth(float z, float near, float far)
{
    return (far * near) / (far - (far - near) * z);
}

#endif