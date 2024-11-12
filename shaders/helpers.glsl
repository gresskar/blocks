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

vec3 get_sky(const float y)
{
    const float height = max(y - 0.2, 0.0);
    return mix(vec3(0.4, 0.7, 1.0), vec3(0.7, 0.9, 1.0), height);
}

bool get_shadow(
    const vec3 normal,
    const vec3 camera,
    const  vec3 position,
    const sampler2D map)
{
    return
        (dot(normal, camera) < 0.0) || (
        position.x <= 1.0 && position.x >= 0.0 &&
        position.y <= 1.0 && position.y >= 0.0 &&
        position.z <= 1.0 && position.z >= 0.0 &&
        (position.z - 0.0005 > texture(map, position.xy).x));
}

#endif